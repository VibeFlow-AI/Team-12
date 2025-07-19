// Jest setup file for global test configuration
require('@testing-library/jest-dom');

// Mock environment variables for testing
process.env.MAILTRAP_HOST = 'sandbox.smtp.mailtrap.io';
process.env.MAILTRAP_PORT = '2525';
process.env.MAILTRAP_USER = 'test-user';
process.env.MAILTRAP_PASS = 'test-pass';
process.env.DEFAULT_FROM_EMAIL = 'EduVibe <test@eduvibe.com>';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jest-testing-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/eduvibe-test';
process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456789';
process.env.CLOUDINARY_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_SECRET_KEY = 'test-secret-key';

// Global test timeout
jest.setTimeout(30000);

// Mock fetch globally
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/test-path',
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  default: jest.fn(),
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
      confirm: jest.fn(),
      retrieve: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
  }));
});

// Mock Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
    search: {
      expression: jest.fn(() => ({
        sort_by: jest.fn(() => ({
          max_results: jest.fn(() => ({
            execute: jest.fn(),
          })),
        })),
      })),
    },
  },
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock sonner (toast notifications)
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
})); 