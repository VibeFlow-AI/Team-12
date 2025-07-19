// Jest setup file for global test configuration

// Mock environment variables for testing
process.env.MAILTRAP_HOST = 'sandbox.smtp.mailtrap.io';
process.env.MAILTRAP_PORT = '2525';
process.env.MAILTRAP_USER = 'test-user';
process.env.MAILTRAP_PASS = 'test-pass';
process.env.DEFAULT_FROM_EMAIL = 'EduVibe <test@eduvibe.com>';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Global test timeout
jest.setTimeout(10000); 