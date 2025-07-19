// Mock the email config before importing the service
jest.mock('@/app/email/config', () => ({
  transporter: {
    sendMail: jest.fn()
  }
}));

// Mock the templates before importing
jest.mock('@/app/email/templates/welcome', () => ({
  generateWelcomeEmailHtml: jest.fn().mockReturnValue('<html>Welcome HTML</html>'),
  generateWelcomeEmailText: jest.fn().mockReturnValue('Welcome Text')
}));

import { emailService } from '@/app/email/service';

describe('Email Service', () => {
  const mockTransporter = require('@/app/email/config').transporter;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendWelcomeEmail', () => {
    const welcomeData = {
      name: 'Test User',
      email: 'test@example.com',
      role: 'student' as const
    };

    test('should send welcome email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await emailService.sendWelcomeEmail(welcomeData);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'EduVibe <test@eduvibe.com>',
        to: 'test@example.com',
        subject: '🎓 Welcome to EduVibe - Your Learning Journey Begins!',
        html: '<html>Welcome HTML</html>',
        text: 'Welcome Text',
        replyTo: 'support@eduvibe.com'
      });
    });

    test('should handle email sending failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      const result = await emailService.sendWelcomeEmail(welcomeData);

      expect(result).toBe(false);
    });

    test('should use correct subject for mentor', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await emailService.sendWelcomeEmail({ ...welcomeData, role: 'mentor' });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: '🌟 Welcome to EduVibe - Start Mentoring Today!'
        })
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    test('should send password reset email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await emailService.sendPasswordResetEmail('user@example.com', 'reset-token');

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'EduVibe <test@eduvibe.com>',
        to: 'user@example.com',
        subject: 'Reset Your EduVibe Password',
        html: expect.stringContaining('Reset Your Password'),
        text: expect.stringContaining('Reset Your Password'),
        replyTo: undefined
      });
    });

    test('should handle password reset email failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      const result = await emailService.sendPasswordResetEmail('user@example.com', 'reset-token');

      expect(result).toBe(false);
    });
  });

  describe('sendBookingConfirmation', () => {
    const bookingDetails = {
      studentName: 'John Doe',
      mentorName: 'Jane Smith',
      sessionDate: '2024-02-15',
      sessionTime: '2:00 PM EST',
      topic: 'React Development',
      meetingLink: 'https://meet.google.com/test'
    };

    test('should send booking confirmation emails to both parties', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await emailService.sendBookingConfirmation(
        'student@example.com',
        'mentor@example.com',
        bookingDetails
      );

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(2);
    });

    test('should handle booking confirmation failure', async () => {
      // Mock Promise.all to throw an error  
      const originalPromiseAll = Promise.all;
      (Promise as any).all = jest.fn().mockRejectedValue(new Error('Email sending failed'));

      const result = await emailService.sendBookingConfirmation(
        'student@example.com',
        'mentor@example.com',
        bookingDetails
      );

      expect(result).toBe(false);
      
      // Restore original Promise.all
      (Promise as any).all = originalPromiseAll;
    });
  });
}); 