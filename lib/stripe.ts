import Stripe from 'stripe';

// Initialize Stripe with the secret key (only if available)
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
}) : null;

// Helper function to ensure Stripe is initialized
function ensureStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe is not initialized. Please check your STRIPE_SECRET_KEY environment variable.');
  }
  return stripe;
}

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  automatic_payment_methods: {
    enabled: true,
  },
} as const;

// Helper function to convert amount to cents (Stripe requires amounts in cents)
export function formatAmountForStripe(amount: number, currency: string = 'usd'): number {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  
  const parts = numberFormat.formatToParts(amount);
  
  // Find the fraction part if it exists
  let fraction = '0';
  const fractionPart = parts.find(part => part.type === 'fraction');
  if (fractionPart) {
    fraction = fractionPart.value;
  }
  
  // Return the amount in cents
  return Math.round(amount * 100);
}

// Helper function to format amount from cents to dollars
export function formatAmountFromStripe(amount: number, currency: string = 'usd'): string {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  
  return numberFormat.format(amount / 100);
}

// Create a payment intent for session booking
export async function createPaymentIntent(
  amount: number,
  metadata: {
    sessionId: string;
    studentId: string;
    mentorId: string;
    [key: string]: string;
  }
): Promise<Stripe.PaymentIntent> {
  const stripeInstance = ensureStripe();
  
  try {
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: formatAmountForStripe(amount),
      currency: STRIPE_CONFIG.currency,
      automatic_payment_methods: STRIPE_CONFIG.automatic_payment_methods,
      metadata,
      description: `EduVibe mentoring session - ${metadata.sessionId}`,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

// Confirm a payment intent
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentIntent> {
  const stripeInstance = ensureStripe();
  
  try {
    const paymentIntent = await stripeInstance.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    throw error;
  }
}

// Create a refund for a payment
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
  try {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = formatAmountForStripe(amount);
    }

    if (reason) {
      refundParams.reason = reason;
    }

    const stripeInstance = ensureStripe();
    const refund = await stripeInstance.refunds.create(refundParams);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
}

// Get payment intent by ID
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  const stripeInstance = ensureStripe();
  
  try {
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
}

// Create a customer in Stripe
export async function createCustomer(
  email: string,
  name: string,
  metadata?: { [key: string]: string }
): Promise<Stripe.Customer> {
  try {
    const stripeInstance = ensureStripe();
    const customer = await stripeInstance.customers.create({
      email,
      name,
      metadata,
    });

    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

// Get customer by ID
export async function getCustomer(customerId: string): Promise<Stripe.Customer> {
  try {
    const stripeInstance = ensureStripe();
    const customer = await stripeInstance.customers.retrieve(customerId) as Stripe.Customer;
    return customer;
  } catch (error) {
    console.error('Error retrieving customer:', error);
    throw error;
  }
}

// Create a setup intent for saving payment methods
export async function createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
  try {
    const stripeInstance = ensureStripe();
    const setupIntent = await stripeInstance.setupIntents.create({
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return setupIntent;
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw error;
  }
}

// List payment methods for a customer
export async function listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
  try {
    const stripeInstance = ensureStripe();
    const paymentMethods = await stripeInstance.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  } catch (error) {
    console.error('Error listing payment methods:', error);
    throw error;
  }
}

// Webhook event types we handle
export const WEBHOOK_EVENTS = {
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
  SETUP_INTENT_SUCCEEDED: 'setup_intent.succeeded',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
} as const;

// Webhook signature verification
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  endpointSecret: string
): Stripe.Event {
  const stripeInstance = ensureStripe();
  return stripeInstance.webhooks.constructEvent(payload, signature, endpointSecret);
}

// Platform fee calculation (you can adjust this based on your business model)
export function calculatePlatformFee(amount: number): number {
  const feePercentage = 0.1; // 10% platform fee
  return Math.round(amount * feePercentage * 100) / 100;
}

// Create connected account for mentors (for marketplace model)
export async function createConnectedAccount(
  email: string,
  country: string = 'US'
): Promise<Stripe.Account> {
  try {
    const stripeInstance = ensureStripe();
    const account = await stripeInstance.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account;
  } catch (error) {
    console.error('Error creating connected account:', error);
    throw error;
  }
}

// Create account link for onboarding
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<Stripe.AccountLink> {
  try {
    const stripeInstance = ensureStripe();
    const accountLink = await stripeInstance.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw error;
  }
}