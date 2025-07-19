import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";
import { getPaymentIntent } from "@/lib/stripe";
import { COLLECTIONS } from "@/lib/models";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!sessionId && !paymentIntentId) {
      return NextResponse.json({ 
        error: "Either sessionId or paymentIntentId is required" 
      }, { status: 400 });
    }

    const db = await getDatabase();
    let payment;

    if (sessionId) {
      // Find payment by session ID
      payment = await db.collection(COLLECTIONS.PAYMENTS).findOne({
        sessionId: new ObjectId(sessionId),
        $or: [
          { studentId: new ObjectId(session.user.id) },
          { mentorId: new ObjectId(session.user.id) }
        ]
      });
    } else if (paymentIntentId) {
      // Find payment by Stripe payment intent ID
      payment = await db.collection(COLLECTIONS.PAYMENTS).findOne({
        stripePaymentIntentId: paymentIntentId,
        $or: [
          { studentId: new ObjectId(session.user.id) },
          { mentorId: new ObjectId(session.user.id) }
        ]
      });
    }

    if (!payment) {
      return NextResponse.json({ 
        error: "Payment not found or access denied" 
      }, { status: 404 });
    }

    // Get the associated session details
    const sessionRecord = await db.collection(COLLECTIONS.SESSIONS).findOne({
      _id: payment.sessionId
    });

    if (!sessionRecord) {
      return NextResponse.json({ 
        error: "Associated session not found" 
      }, { status: 404 });
    }

    // If payment has a Stripe payment intent, get the latest status from Stripe
    let stripeStatus = null;
    if (payment.stripePaymentIntentId) {
      try {
        const paymentIntent = await getPaymentIntent(payment.stripePaymentIntentId);
        stripeStatus = {
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          last_payment_error: paymentIntent.last_payment_error,
          created: paymentIntent.created,
          charges: (paymentIntent as any).charges?.data?.[0] || null
        };

        // Update our database if Stripe status is different
        if (paymentIntent.status === 'succeeded' && payment.status !== 'completed') {
          await db.collection(COLLECTIONS.PAYMENTS).updateOne(
            { _id: payment._id },
            { 
              $set: {
                status: "completed",
                processedAt: new Date(),
                updatedAt: new Date()
              }
            }
          );
          payment.status = 'completed';
        } else if (paymentIntent.status === 'canceled' && payment.status !== 'failed') {
          await db.collection(COLLECTIONS.PAYMENTS).updateOne(
            { _id: payment._id },
            { 
              $set: {
                status: "failed",
                updatedAt: new Date(),
                failureReason: "Payment canceled"
              }
            }
          );
          payment.status = 'failed';
        }
      } catch (stripeError) {
        console.error('Error fetching payment intent from Stripe:', stripeError);
        // Continue without Stripe data if there's an error
      }
    }

    // Get student and mentor info for the response
    const student = await db.collection(COLLECTIONS.USERS).findOne(
      { _id: payment.studentId },
      { projection: { name: 1, email: 1 } }
    );

    const mentor = await db.collection(COLLECTIONS.USERS).findOne(
      { _id: payment.mentorId },
      { projection: { name: 1, email: 1 } }
    );

    const response = {
      success: true,
      payment: {
        id: payment._id.toString(),
        sessionId: payment.sessionId.toString(),
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        createdAt: payment.createdAt,
        processedAt: payment.processedAt,
        failureReason: payment.failureReason,
        metadata: payment.metadata
      },
      session: {
        id: sessionRecord._id.toString(),
        sessionDate: sessionRecord.sessionDate,
        sessionTime: sessionRecord.sessionTime,
        duration: sessionRecord.duration,
        subject: sessionRecord.subject,
        status: sessionRecord.status,
        paymentStatus: sessionRecord.paymentStatus
      },
      student: {
        name: student?.name,
        email: student?.email
      },
      mentor: {
        name: mentor?.name,
        email: mentor?.email
      },
      stripeStatus
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching payment status:", error);
    return NextResponse.json({ 
      error: "Failed to fetch payment status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// PUT endpoint to update payment status (for admin or webhook use)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, status, failureReason } = body;

    if (!paymentId || !status) {
      return NextResponse.json({ 
        error: "paymentId and status are required" 
      }, { status: 400 });
    }

    const validStatuses = ["pending", "completed", "failed", "refunded"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Find the payment and verify access
    const payment = await db.collection(COLLECTIONS.PAYMENTS).findOne({
      _id: new ObjectId(paymentId),
      $or: [
        { studentId: new ObjectId(session.user.id) },
        { mentorId: new ObjectId(session.user.id) }
      ]
    });

    if (!payment) {
      return NextResponse.json({ 
        error: "Payment not found or access denied" 
      }, { status: 404 });
    }

    // Update payment status
    const updateData: any = {
      status: status,
      updatedAt: new Date()
    };

    if (status === "completed") {
      updateData.processedAt = new Date();
    } else if (status === "failed" && failureReason) {
      updateData.failureReason = failureReason;
    } else if (status === "refunded") {
      updateData.refundedAt = new Date();
    }

    const result = await db.collection(COLLECTIONS.PAYMENTS).updateOne(
      { _id: new ObjectId(paymentId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        error: "Failed to update payment status" 
      }, { status: 500 });
    }

    // Update related session status if needed
    if (status === "completed") {
      await db.collection(COLLECTIONS.SESSIONS).updateOne(
        { _id: payment.sessionId },
        { 
          $set: {
            paymentStatus: "verified",
            status: "confirmed",
            confirmedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );
    } else if (status === "failed") {
      await db.collection(COLLECTIONS.SESSIONS).updateOne(
        { _id: payment.sessionId },
        { 
          $set: {
            paymentStatus: "rejected",
            updatedAt: new Date()
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully",
      paymentId: paymentId,
      newStatus: status
    });

  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json({ 
      error: "Failed to update payment status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}