import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";
import { verifyWebhookSignature, WEBHOOK_EVENTS } from "@/lib/stripe";
import { COLLECTIONS } from "@/lib/models";
import Stripe from "stripe";

const getEndpointSecret = () => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
  }
  return endpointSecret;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      const endpointSecret = getEndpointSecret();
      event = verifyWebhookSignature(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const db = await getDatabase();

    // Handle the event
    switch (event.type) {
      case WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, db);
        break;

      case WEBHOOK_EVENTS.PAYMENT_INTENT_PAYMENT_FAILED:
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, db);
        break;

      case WEBHOOK_EVENTS.SETUP_INTENT_SUCCEEDED:
        await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent, db);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: "Webhook handler failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, db: any) {
  console.log('Payment succeeded:', paymentIntent.id);

  try {
    // Update payment record
    const paymentUpdate = await db.collection(COLLECTIONS.PAYMENTS).updateOne(
      { stripePaymentIntentId: paymentIntent.id },
      { 
        $set: {
          status: "completed",
          processedAt: new Date(),
          updatedAt: new Date(),
          paymentMethod: paymentIntent.payment_method_types[0] || "card"
        }
      }
    );

    if (paymentUpdate.matchedCount === 0) {
      console.error('Payment record not found for payment intent:', paymentIntent.id);
      return;
    }

    // Get the payment record to find the session
    const payment = await db.collection(COLLECTIONS.PAYMENTS).findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (!payment) {
      console.error('Payment record not found after update:', paymentIntent.id);
      return;
    }

    // Update session status
    await db.collection(COLLECTIONS.SESSIONS).updateOne(
      { _id: payment.sessionId },
      { 
        $set: {
          paymentStatus: "verified",
          status: "confirmed", // Session is now confirmed after payment
          confirmedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    // Create notifications for both student and mentor
    const session = await db.collection(COLLECTIONS.SESSIONS).findOne({
      _id: payment.sessionId
    });

    if (session) {
      // Notification for student
      await db.collection(COLLECTIONS.NOTIFICATIONS).insertOne({
        userId: session.studentId,
        type: "payment",
        title: "Payment Successful",
        message: `Your payment of $${(paymentIntent.amount / 100).toFixed(2)} for the ${session.subject} session has been processed successfully.`,
        data: {
          sessionId: session._id.toString(),
          paymentId: payment._id.toString(),
          amount: paymentIntent.amount / 100
        },
        isRead: false,
        channels: ["email", "push"],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Notification for mentor
      await db.collection(COLLECTIONS.NOTIFICATIONS).insertOne({
        userId: session.mentorId,
        type: "session",
        title: "Session Confirmed",
        message: `A ${session.subject} session has been confirmed and paid for. Session scheduled for ${session.sessionDate.toLocaleDateString()} at ${session.sessionTime}.`,
        data: {
          sessionId: session._id.toString(),
          paymentId: payment._id.toString(),
          amount: paymentIntent.amount / 100
        },
        isRead: false,
        channels: ["email", "push"],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update mentor profile earnings
      await db.collection(COLLECTIONS.MENTOR_PROFILES).updateOne(
        { userId: session.mentorId },
        { 
          $inc: { 
            totalEarnings: paymentIntent.amount / 100,
            totalSessions: 1
          },
          $set: { updatedAt: new Date() }
        }
      );
    }

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, db: any) {
  console.log('Payment failed:', paymentIntent.id);

  try {
    // Update payment record
    await db.collection(COLLECTIONS.PAYMENTS).updateOne(
      { stripePaymentIntentId: paymentIntent.id },
      { 
        $set: {
          status: "failed",
          updatedAt: new Date(),
          failureReason: paymentIntent.last_payment_error?.message || "Payment failed"
        }
      }
    );

    // Get the payment record to find the session
    const payment = await db.collection(COLLECTIONS.PAYMENTS).findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (payment) {
      // Update session status back to pending
      await db.collection(COLLECTIONS.SESSIONS).updateOne(
        { _id: payment.sessionId },
        { 
          $set: {
            paymentStatus: "rejected",
            status: "pending", // Keep session pending for retry
            updatedAt: new Date()
          }
        }
      );

      // Create notification for student about payment failure
      const session = await db.collection(COLLECTIONS.SESSIONS).findOne({
        _id: payment.sessionId
      });

      if (session) {
        await db.collection(COLLECTIONS.NOTIFICATIONS).insertOne({
          userId: session.studentId,
          type: "payment",
          title: "Payment Failed",
          message: `Your payment for the ${session.subject} session failed. Please try again or contact support.`,
          data: {
            sessionId: session._id.toString(),
            paymentId: payment._id.toString(),
            failureReason: paymentIntent.last_payment_error?.message || "Payment failed"
          },
          isRead: false,
          channels: ["email", "push"],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent, db: any) {
  console.log('Setup intent succeeded:', setupIntent.id);

  try {
    // This would be used for saving payment methods for future use
    // You can implement customer payment method storage here
    console.log('Payment method saved for customer:', setupIntent.customer);
    
    // Create notification for user about successful payment method setup
    if (setupIntent.metadata?.userId) {
      await db.collection(COLLECTIONS.NOTIFICATIONS).insertOne({
        userId: new ObjectId(setupIntent.metadata.userId),
        type: "system",
        title: "Payment Method Added",
        message: "Your payment method has been successfully saved for future transactions.",
        data: {
          setupIntentId: setupIntent.id,
          customerId: setupIntent.customer
        },
        isRead: false,
        channels: ["push"],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

  } catch (error) {
    console.error('Error handling setup intent success:', error);
  }
}