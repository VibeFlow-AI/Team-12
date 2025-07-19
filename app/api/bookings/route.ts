import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";

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
    const { mentorId, sessionDate, sessionTime, duration, subject, message } = body;

    if (!mentorId) {
      return NextResponse.json({ error: "Mentor ID is required" }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Verify mentor exists and is available
    const mentor = await db.collection("users").findOne({
      _id: new ObjectId(mentorId),
      role: "mentor",
      onboardingCompleted: true
    });

    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    // Validate session date and time
    if (!sessionDate || !sessionTime) {
      return NextResponse.json({ error: "Session date and time are required" }, { status: 400 });
    }

    // Create booking record
    const booking = {
      studentId: new ObjectId(session.user.id),
      mentorId: new ObjectId(mentorId),
      sessionDate: new Date(sessionDate),
      sessionTime: sessionTime,
      duration: duration || "1 hour",
      subject: subject || "General",
      message: message || "",
      status: "pending", // pending, confirmed, completed, cancelled
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("bookings").insertOne(booking);

    if (!result.insertedId) {
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // In a real app, you would:
    // 1. Send email notifications to both student and mentor
    // 2. Create calendar events
    // 3. Set up payment processing
    // 4. Send SMS notifications

    return NextResponse.json({
      success: true,
      bookingId: result.insertedId.toString(),
      message: `Session booked for ${new Date(sessionDate).toLocaleDateString()} at ${sessionTime}! The mentor will confirm shortly.`
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
      bookings = await db.collection("bookings")
        .aggregate([
          { $match: { studentId: userId } },
          {
            $lookup: {
              from: "users",
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
              duration: 1,
              subject: 1,
              message: 1,
              status: 1,
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
      bookings = await db.collection("bookings")
        .aggregate([
          { $match: { mentorId: userId } },
          {
            $lookup: {
              from: "users",
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
              duration: 1,
              subject: 1,
              message: 1,
              status: 1,
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