import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";
import { sessionBookingSchema } from "@/lib/validation";
import { Session, COLLECTIONS } from "@/lib/models";
import { 
  withPermission, 
  withResourceAccess, 
  createErrorResponse, 
  createSuccessResponse,
  validateRequest
} from "@/lib/auth-middleware";
import { 
  Permission, 
  Action, 
  Resource, 
  AccessContext 
} from "@/lib/rbac";

// Helper function to check mentor availability (same as before)
async function checkMentorAvailability(
  db: any,
  mentorId: ObjectId,
  sessionDate: Date,
  sessionTime: string,
  duration: string
): Promise<{ available: boolean; conflictReason?: string }> {
  // Check for existing sessions at the same time
  const existingSession = await db.collection(COLLECTIONS.SESSIONS).findOne({
    mentorId: mentorId,
    sessionDate: {
      $gte: new Date(sessionDate.toDateString()),
      $lt: new Date(new Date(sessionDate).getTime() + 24 * 60 * 60 * 1000)
    },
    sessionTime: sessionTime,
    status: { $in: ["pending", "confirmed"] }
  });

  if (existingSession) {
    return { available: false, conflictReason: "Mentor already has a session at this time" };
  }

  // Check mentor's availability schedule
  const dayOfWeek = sessionDate.getDay();
  const availability = await db.collection(COLLECTIONS.AVAILABILITY).findOne({
    mentorId: mentorId,
    dayOfWeek: dayOfWeek,
    isActive: true
  });

  if (!availability) {
    return { available: false, conflictReason: "Mentor is not available on this day" };
  }

  // Check if the session time falls within available hours
  const [sessionHour, sessionMinute] = sessionTime.split(':').map(Number);
  const [startHour, startMinute] = availability.startTime.split(':').map(Number);
  const [endHour, endMinute] = availability.endTime.split(':').map(Number);

  const sessionTimeInMinutes = sessionHour * 60 + sessionMinute;
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  if (sessionTimeInMinutes < startTimeInMinutes || sessionTimeInMinutes >= endTimeInMinutes) {
    return { available: false, conflictReason: "Session time is outside mentor's available hours" };
  }

  // Check for exceptions (unavailable dates)
  const dateString = sessionDate.toISOString().split('T')[0];
  const exception = availability.exceptions?.find((ex: any) => 
    ex.date.toISOString().split('T')[0] === dateString && ex.type === 'unavailable'
  );

  if (exception) {
    return { available: false, conflictReason: "Mentor is unavailable on this specific date" };
  }

  return { available: true };
}

// Create booking handler with RBAC
async function createBookingHandler(
  request: NextRequest, 
  user: any, 
  context: AccessContext
): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validation = validateRequest(body, sessionBookingSchema);
    if (!validation.success) {
      return createErrorResponse('Validation failed', 400);
    }

    const { mentorId, sessionDate, sessionTime, duration, subject, message, sessionType } = validation.data;
    const { bankSlipUrl, paymentStatus } = body; // These are not in the validation schema

    const db = await getDatabase();
    
    // Verify the mentor exists and is available
    const mentor = await db.collection(COLLECTIONS.USERS).findOne({
      _id: new ObjectId(mentorId),
      role: "mentor",
      onboardingCompleted: true,
      isActive: true
    });

    if (!mentor) {
      return createErrorResponse("Mentor not found or not available", 404);
    }

    // Get mentor profile for pricing
    const mentorProfile = await db.collection(COLLECTIONS.MENTOR_PROFILES).findOne({
      userId: new ObjectId(mentorId)
    });

    if (!mentorProfile) {
      return createErrorResponse("Mentor profile not found", 404);
    }

    // Check availability
    const availabilityCheck = await checkMentorAvailability(
      db,
      new ObjectId(mentorId),
      new Date(sessionDate),
      sessionTime,
      duration
    );

    if (!availabilityCheck.available) {
      return NextResponse.json({ 
        error: "Mentor is not available", 
        reason: availabilityCheck.conflictReason 
      }, { status: 409 });
    }

    // Calculate pricing
    let durationMultiplier = 1;
    switch (duration) {
      case "30min":
        durationMultiplier = 0.5;
        break;
      case "1hour":
        durationMultiplier = 1;
        break;
      case "1.5hours":
        durationMultiplier = 1.5;
        break;
      case "2hours":
        durationMultiplier = 2;
        break;
    }

    const amount = mentorProfile.hourlyRate * durationMultiplier;

    // Create session record
    const sessionData: Partial<Session> = {
      studentId: new ObjectId(user.id),
      mentorId: new ObjectId(mentorId),
      sessionDate: new Date(sessionDate),
      sessionTime: sessionTime,
      duration: duration as any,
      subject: subject,
      sessionType: sessionType as any,
      message: message || "",
      status: "pending",
      paymentStatus: paymentStatus || "pending_verification",
      bankSlipUrl: bankSlipUrl || undefined,
      amount: amount,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection(COLLECTIONS.SESSIONS).insertOne(sessionData);

    if (!result.insertedId) {
      return createErrorResponse("Failed to create booking", 500);
    }

    // Create notification for mentor
    await db.collection(COLLECTIONS.NOTIFICATIONS).insertOne({
      userId: new ObjectId(mentorId),
      type: "booking",
      title: "New Session Booking",
      message: `${user.name} has booked a ${duration} ${subject} session for ${new Date(sessionDate).toLocaleDateString()} at ${sessionTime}`,
      data: {
        sessionId: result.insertedId.toString(),
        studentName: user.name,
        amount: amount
      },
      isRead: false,
      channels: ["email", "push"],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update mentor profile statistics
    await db.collection(COLLECTIONS.MENTOR_PROFILES).updateOne(
      { userId: new ObjectId(mentorId) },
      { 
        $inc: { totalSessions: 1 },
        $set: { updatedAt: new Date() }
      }
    );

    return createSuccessResponse({
      sessionId: result.insertedId.toString(),
      amount: amount,
      currency: "USD",
      message: `Session booked for ${new Date(sessionDate).toLocaleDateString()} at ${sessionTime}! Total cost: $${amount}. The mentor will confirm shortly.`
    });

  } catch (error) {
    console.error("Booking creation error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

// Get bookings handler with RBAC
async function getBookingsHandler(
  request: NextRequest, 
  user: any, 
  context: AccessContext
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');

    const db = await getDatabase();
    const userId = new ObjectId(user.id);
    
    let query: any = {};
    let lookupCollection: string;
    let lookupField: string;

    // Build query based on user role and permissions
    if (user.role === "student") {
      query.studentId = userId;
      lookupCollection = COLLECTIONS.USERS;
      lookupField = "mentorId";
    } else if (user.role === "mentor") {
      query.mentorId = userId;
      lookupCollection = COLLECTIONS.USERS;
      lookupField = "studentId";
    } else {
      // Admin can see all bookings
      lookupCollection = COLLECTIONS.USERS;
      lookupField = "studentId";
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get bookings with user information
    const bookings = await db.collection(COLLECTIONS.SESSIONS)
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: lookupCollection,
            localField: lookupField,
            foreignField: "_id",
            as: "relatedUser"
          }
        },
        { $unwind: "$relatedUser" },
        {
          $project: {
            _id: 1,
            sessionDate: 1,
            sessionTime: 1,
            duration: 1,
            subject: 1,
            message: 1,
            status: 1,
            bankSlipUrl: 1,
            paymentStatus: 1,
            amount: 1,
            createdAt: 1,
            relatedUser: {
              name: "$relatedUser.name",
              email: "$relatedUser.email"
            }
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ]).toArray();

    // Get total count for pagination
    const totalCount = await db.collection(COLLECTIONS.SESSIONS).countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    return createSuccessResponse({
      bookings: bookings.map(booking => ({
        ...booking,
        id: booking._id.toString(),
        _id: undefined
      })),
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

// Export handlers with RBAC protection
export const POST = withPermission(
  Permission.BOOK_SESSION,
  createBookingHandler
);

export const GET = withPermission(
  Permission.VIEW_OWN_SESSIONS,
  getBookingsHandler
);