import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/models";

// Helper function to get available time slots for a mentor on a specific date
async function getAvailableTimeSlots(
  db: any,
  mentorId: ObjectId,
  date: Date
): Promise<string[]> {
  const dayOfWeek = date.getDay();
  
  // Get mentor's general availability for this day
  const availability = await db.collection(COLLECTIONS.AVAILABILITY).findOne({
    mentorId: mentorId,
    dayOfWeek: dayOfWeek,
    isActive: true
  });

  if (!availability) {
    return [];
  }

  // Check for date-specific exceptions
  const dateString = date.toISOString().split('T')[0];
  const exception = availability.exceptions?.find((ex: any) => 
    ex.date.toISOString().split('T')[0] === dateString
  );

  if (exception && exception.type === 'unavailable') {
    return [];
  }

  // Generate time slots based on availability
  const startTime = exception?.startTime || availability.startTime;
  const endTime = exception?.endTime || availability.endTime;
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const slots: string[] = [];
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Check if this slot is already booked
    const existingSession = await db.collection(COLLECTIONS.SESSIONS).findOne({
      mentorId: mentorId,
      sessionDate: {
        $gte: new Date(date.toDateString()),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      },
      sessionTime: timeSlot,
      status: { $in: ["pending", "confirmed"] }
    });

    if (!existingSession) {
      slots.push(timeSlot);
    }
    
    // Increment by 1 hour (you can adjust this to 30 minutes if needed)
    currentHour += 1;
  }
  
  return slots;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get('mentorId');
    const dateStr = searchParams.get('date');
    const daysAhead = parseInt(searchParams.get('daysAhead') || '30');

    if (!mentorId) {
      return NextResponse.json({ error: "Mentor ID is required" }, { status: 400 });
    }

    const db = await getDatabase();

    // Verify mentor exists
    const mentor = await db.collection(COLLECTIONS.USERS).findOne({
      _id: new ObjectId(mentorId),
      role: "mentor",
      onboardingCompleted: true,
      isActive: true
    });

    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    if (dateStr) {
      // Get availability for a specific date
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        return NextResponse.json({ error: "Cannot check availability for past dates" }, { status: 400 });
      }

      const availableSlots = await getAvailableTimeSlots(db, new ObjectId(mentorId), date);
      
      return NextResponse.json({
        success: true,
        date: dateStr,
        availableSlots
      });
    } else {
      // Get availability for the next 'daysAhead' days
      const availabilityMap: Record<string, string[]> = {};
      const today = new Date();
      
      for (let i = 0; i < daysAhead; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        
        const dateKey = currentDate.toISOString().split('T')[0];
        const slots = await getAvailableTimeSlots(db, new ObjectId(mentorId), currentDate);
        
        if (slots.length > 0) {
          availabilityMap[dateKey] = slots;
        }
      }
      
      return NextResponse.json({
        success: true,
        mentorId,
        availability: availabilityMap
      });
    }

  } catch (error) {
    console.error("Error fetching mentor availability:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST endpoint to set mentor availability
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only mentors can set their availability
    if (session.user.role !== "mentor") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { dayOfWeek, startTime, endTime, isActive, exceptions } = body;

    // Validate required fields
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ 
        error: "dayOfWeek, startTime, and endTime are required" 
      }, { status: 400 });
    }

    // Validate day of week (0-6)
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json({ 
        error: "dayOfWeek must be between 0 (Sunday) and 6 (Saturday)" 
      }, { status: 400 });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json({ 
        error: "Time must be in HH:MM format" 
      }, { status: 400 });
    }

    const db = await getDatabase();
    const mentorId = new ObjectId(session.user.id);

    // Check if availability already exists for this day
    const existingAvailability = await db.collection(COLLECTIONS.AVAILABILITY).findOne({
      mentorId: mentorId,
      dayOfWeek: dayOfWeek
    });

    const availabilityData = {
      mentorId: mentorId,
      dayOfWeek: dayOfWeek,
      startTime: startTime,
      endTime: endTime,
      isActive: isActive !== false, // default to true
      exceptions: exceptions || [],
      timezone: "UTC", // TODO: Get from user preferences
      updatedAt: new Date()
    };

    let result;
    
    if (existingAvailability) {
      // Update existing availability
      result = await db.collection(COLLECTIONS.AVAILABILITY).updateOne(
        { _id: existingAvailability._id },
        { $set: availabilityData }
      );
    } else {
      // Create new availability
      result = await db.collection(COLLECTIONS.AVAILABILITY).insertOne({
        ...availabilityData,
        createdAt: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      message: existingAvailability ? "Availability updated" : "Availability created",
      availabilityId: existingAvailability?._id?.toString() || result.insertedId?.toString()
    });

  } catch (error) {
    console.error("Error setting mentor availability:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}