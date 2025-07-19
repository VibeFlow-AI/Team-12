import {
  formatAmountForStripe,
  formatAmountFromStripe,
  calculatePlatformFee,
  STRIPE_CONFIG,
  WEBHOOK_EVENTS
} from '@/lib/stripe';

// Mock Stripe
jest.mock('stripe');

describe('Stripe Utilities', () => {
  describe('formatAmountForStripe', () => {
    it('should convert dollars to cents', () => {
      expect(formatAmountForStripe(10.50)).toBe(1050);
      expect(formatAmountForStripe(0.99)).toBe(99);
      expect(formatAmountForStripe(100)).toBe(10000);
    });

    it('should handle zero amount', () => {
      expect(formatAmountForStripe(0)).toBe(0);
    });

    it('should round correctly', () => {
      expect(formatAmountForStripe(10.999)).toBe(1100);
      expect(formatAmountForStripe(10.001)).toBe(1000);
    });
  });

  describe('formatAmountFromStripe', () => {
    it('should convert cents to dollars with currency formatting', () => {
      expect(formatAmountFromStripe(1050)).toBe('$10.50');
      expect(formatAmountFromStripe(99)).toBe('$0.99');
      expect(formatAmountFromStripe(10000)).toBe('$100.00');
    });

    it('should handle zero amount', () => {
      expect(formatAmountFromStripe(0)).toBe('$0.00');
    });

    it('should format large amounts correctly', () => {
      expect(formatAmountFromStripe(123456)).toBe('$1,234.56');
    });
  });

  describe('calculatePlatformFee', () => {
    it('should calculate 10% platform fee', () => {
      expect(calculatePlatformFee(100)).toBe(10);
      expect(calculatePlatformFee(50)).toBe(5);
      expect(calculatePlatformFee(25.50)).toBe(2.55);
    });

    it('should handle zero amount', () => {
      expect(calculatePlatformFee(0)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(calculatePlatformFee(33.33)).toBe(3.33);
      expect(calculatePlatformFee(12.345)).toBe(1.23);
    });
  });

  describe('STRIPE_CONFIG', () => {
    it('should have correct default configuration', () => {
      expect(STRIPE_CONFIG.currency).toBe('usd');
      expect(STRIPE_CONFIG.automatic_payment_methods.enabled).toBe(true);
    });
  });

  describe('WEBHOOK_EVENTS', () => {
    it('should have all required webhook event types', () => {
      expect(WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED).toBe('payment_intent.succeeded');
      expect(WEBHOOK_EVENTS.PAYMENT_INTENT_PAYMENT_FAILED).toBe('payment_intent.payment_failed');
      expect(WEBHOOK_EVENTS.SETUP_INTENT_SUCCEEDED).toBe('setup_intent.succeeded');
      expect(WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED).toBe('invoice.payment_succeeded');
      expect(WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED).toBe('invoice.payment_failed');
      expect(WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED).toBe('customer.subscription.created');
      expect(WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED).toBe('customer.subscription.updated');
      expect(WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED).toBe('customer.subscription.deleted');
    });
  });
});