import { emailConfig } from '@/app/email/config';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn().mockReturnValue({
    verify: jest.fn().mockResolvedValue(true),
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

describe('Email Configuration', () => {
  test('should have correct default configuration', () => {
    expect(emailConfig.host).toBe('sandbox.smtp.mailtrap.io');
    expect(emailConfig.port).toBe(2525);
    expect(emailConfig.auth.user).toBe('test-user');
    expect(emailConfig.auth.pass).toBe('test-pass');
  });

  test('should use environment variables', () => {
    expect(emailConfig.host).toBe(process.env.MAILTRAP_HOST);
    expect(emailConfig.port).toBe(parseInt(process.env.MAILTRAP_PORT || '2525'));
    expect(emailConfig.auth.user).toBe(process.env.MAILTRAP_USER);
    expect(emailConfig.auth.pass).toBe(process.env.MAILTRAP_PASS);
  });

  test('should have required configuration properties', () => {
    expect(emailConfig).toHaveProperty('host');
    expect(emailConfig).toHaveProperty('port');
    expect(emailConfig).toHaveProperty('auth');
    expect(emailConfig.auth).toHaveProperty('user');
    expect(emailConfig.auth).toHaveProperty('pass');
  });
}); 