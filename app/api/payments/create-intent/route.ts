import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";
import { createPaymentIntent } from "@/lib/stripe";
import { COLLECTIONS } from "@/lib/models";
import { paymentSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can create payment intents for sessions
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = paymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { bookingId, amount, currency } = validationResult.data;

    const db = await getDatabase();
    
    // Verify the session/booking exists and belongs to the student
    const sessionRecord = await db.collection(COLLECTIONS.SESSIONS).findOne({
      _id: new ObjectId(bookingId),
      studentId: new ObjectId(session.user.id),
      status: "pending"
    });

    if (!sessionRecord) {
      return NextResponse.json({ 
        error: "Session not found or not eligible for payment" 
      }, { status: 404 });
    }

    // Verify the amount matches the session amount
    if (Math.abs(amount - sessionRecord.amount) > 0.01) {
      return NextResponse.json({ 
        error: "Payment amount does not match session cost" 
      }, { status: 400 });
    }

    // Check if a payment intent already exists for this session
    const existingPayment = await db.collection(COLLECTIONS.PAYMENTS).findOne({
      sessionId: new ObjectId(bookingId),
      status: { $in: ["pending", "completed"] }
    });

    if (existingPayment && existingPayment.stripePaymentIntentId) {
      // Return existing payment intent
      return NextResponse.json({
        success: true,
        clientSecret: existingPayment.clientSecret,
        paymentIntentId: existingPayment.stripePaymentIntentId,
        amount: existingPayment.amount
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(amount, {
      sessionId: bookingId,
      studentId: session.user.id,
      mentorId: sessionRecord.mentorId.toString(),
      studentName: session.user.name || "",
      subject: sessionRecord.subject,
      sessionDate: sessionRecord.sessionDate.toISOString(),
      sessionTime: sessionRecord.sessionTime
    });

    // Save payment record to database
    const paymentRecord = {
      sessionId: new ObjectId(bookingId),
      studentId: new ObjectId(session.user.id),
      mentorId: new ObjectId(sessionRecord.mentorId),
      amount: amount,
      currency: currency || "usd",
      paymentMethod: "card",
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      description: `EduVibe mentoring session - ${sessionRecord.subject}`,
      metadata: {
        sessionDate: sessionRecord.sessionDate.toISOString(),
        sessionTime: sessionRecord.sessionTime,
        subject: sessionRecord.subject
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection(COLLECTIONS.PAYMENTS).insertOne(paymentRecord);

    if (!result.insertedId) {
      return NextResponse.json({ 
        error: "Failed to create payment record" 
      }, { status: 500 });
    }

    // Update session with payment reference
    await db.collection(COLLECTIONS.SESSIONS).updateOne(
      { _id: new ObjectId(bookingId) },
      { 
        $set: { 
          paymentStatus: "processing",
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency || "usd",
      paymentId: result.insertedId.toString()
    });

  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json({ 
      error: "Failed to create payment intent",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}