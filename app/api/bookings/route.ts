import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";
import { sessionBookingSchema } from "@/lib/validation";
import { Session, COLLECTIONS } from "@/lib/models";

// Helper function to check mentor availability
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

// Helper function to calculate session end time
function calculateSessionEndTime(startTime: string, duration: string): string {
  const [hour, minute] = startTime.split(':').map(Number);
  let durationMinutes = 60; // default 1 hour

  switch (duration) {
    case "30min":
      durationMinutes = 30;
      break;
    case "1hour":
      durationMinutes = 60;
      break;
    case "1.5hours":
      durationMinutes = 90;
      break;
    case "2hours":
      durationMinutes = 120;
      break;
  }

  const totalMinutes = hour * 60 + minute + durationMinutes;
  const endHour = Math.floor(totalMinutes / 60);
  const endMinute = totalMinutes % 60;

  return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can book sessions
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input using Zod schema
    const validationResult = sessionBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { mentorId, sessionDate, sessionTime, duration, subject, message, sessionType } = validationResult.data;
    const { bankSlipUrl, paymentStatus } = body; // These are not in the validation schema

    const db = await getDatabase();
    
    // Verify mentor exists and is available
    const mentor = await db.collection(COLLECTIONS.USERS).findOne({
      _id: new ObjectId(mentorId),
      role: "mentor",
      onboardingCompleted: true,
      isActive: true
    });

    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found or not available" }, { status: 404 });
    }

    // Get mentor profile for pricing
    const mentorProfile = await db.collection(COLLECTIONS.MENTOR_PROFILES).findOne({
      userId: new ObjectId(mentorId)
    });

    if (!mentorProfile) {
      return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
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
      studentId: new ObjectId(session.user.id),
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
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // Create notification for mentor
    await db.collection(COLLECTIONS.NOTIFICATIONS).insertOne({
      userId: new ObjectId(mentorId),
      type: "booking",
      title: "New Session Booking",
      message: `${session.user.name} has booked a ${duration} ${subject} session for ${new Date(sessionDate).toLocaleDateString()} at ${sessionTime}`,
      data: {
        sessionId: result.insertedId.toString(),
        studentName: session.user.name,
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

    return NextResponse.json({
      success: true,
      sessionId: result.insertedId.toString(),
      amount: amount,
      currency: "USD",
      message: `Session booked for ${new Date(sessionDate).toLocaleDateString()} at ${sessionTime}! Total cost: $${amount}. The mentor will confirm shortly.`
    });

  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);
    
    let bookings;
    
    if (session.user.role === "student") {
      // Get bookings where user is the student
      bookings = await db.collection(COLLECTIONS.SESSIONS)
        .aggregate([
          { $match: { studentId: userId } },
          {
            $lookup: {
              from: COLLECTIONS.USERS,
              localField: "mentorId", 
              foreignField: "_id",
              as: "mentor"
            }
          },
          { $unwind: "$mentor" },
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
              createdAt: 1,
              mentor: {
                name: "$mentor.name",
                email: "$mentor.email"
              }
            }
          },
          { $sort: { createdAt: -1 } }
        ]).toArray();
    } else {
      // Get bookings where user is the mentor
      bookings = await db.collection(COLLECTIONS.SESSIONS)
        .aggregate([
          { $match: { mentorId: userId } },
          {
            $lookup: {
              from: COLLECTIONS.USERS,
              localField: "studentId",
              foreignField: "_id", 
              as: "student"
            }
          },
          { $unwind: "$student" },
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
              createdAt: 1,
              student: {
                name: "$student.name",
                email: "$student.email"
              }
            }
          },
          { $sort: { createdAt: -1 } }
        ]).toArray();
    }

    return NextResponse.json({
      success: true,
      bookings: bookings.map(booking => ({
        ...booking,
        id: booking._id.toString(),
        _id: undefined
      }))
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}