import { NextRequest } from 'next/server';

// Mock the email service before imports
jest.mock('@/app/email/service', () => ({
  emailService: {
    sendWelcomeEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendBookingConfirmation: jest.fn()
  }
}));

// Mock the email config before imports
jest.mock('@/app/email/config', () => ({
  verifyEmailConnection: jest.fn()
}));

import { POST, GET } from '@/app/api/email/route';

describe('/api/email Route', () => {
  const mockEmailService = require('@/app/email/service').emailService;
  const mockVerifyEmailConnection = require('@/app/email/config').verifyEmailConnection;

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyEmailConnection.mockResolvedValue(true);
  });

  describe('POST /api/email', () => {
    test('should handle welcome email request', async () => {
      mockEmailService.sendWelcomeEmail.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/email', {
        method: 'POST',
        body: JSON.stringify({
          type: 'welcome',
          data: {
            name: 'Test User',
            email: 'test@example.com',
            role: 'student'
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Welcome email sent successfully');
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        role: 'student'
      });
    });

    test('should validate welcome email fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/email', {
        method: 'POST',
        body: JSON.stringify({
          type: 'welcome',
          data: {
            name: 'Test User',
            // Missing email and role
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: name, email, role');
    });

    test('should validate role field', async () => {
      const request = new NextRequest('http://localhost:3000/api/email', {
        method: 'POST',
        body: JSON.stringify({
          type: 'welcome',
          data: {
            name: 'Test User',
            email: 'test@example.com',
            role: 'invalid-role'
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Role must be either "student" or "mentor"');
    });

    test('should handle password reset request', async () => {
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/email', {
        method: 'POST',
        body: JSON.stringify({
          type: 'password-reset',
          data: {
            email: 'user@example.com',
            resetToken: 'reset-token-123'
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Password reset email sent successfully');
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'user@example.com',
        'reset-token-123'
      );
    });

    test('should handle booking confirmation request', async () => {
      mockEmailService.sendBookingConfirmation.mockResolvedValue(true);

      const bookingDetails = {
        studentName: 'John Doe',
        mentorName: 'Jane Smith',
        sessionDate: '2024-02-15',
        sessionTime: '2:00 PM EST',
        topic: 'React Development'
      };

      const request = new NextRequest('http://localhost:3000/api/email', {
        method: 'POST',
        body: JSON.stringify({
          type: 'booking-confirmation',
          data: {
            studentEmail: 'student@example.com',
            mentorEmail: 'mentor@example.com',
            bookingDetails
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Booking confirmation emails sent successfully');
      expect(mockEmailService.sendBookingConfirmation).toHaveBeenCalledWith(
        'student@example.com',
        'mentor@example.com',
        bookingDetails
      );
    });

    test('should handle invalid email type', async () => {
      const request = new NextRequest('http://localhost:3000/api/email', {
        method: 'POST',
        body: JSON.stringify({
          type: 'invalid-type',
          data: {}
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid email type');
    });

    test('should handle email service unavailable', async () => {
      mockVerifyEmailConnection.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/email', {
        method: 'POST',
        body: JSON.stringify({
          type: 'welcome',
          data: {
            name: 'Test User',
            email: 'test@example.com',
            role: 'student'
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Email service is not configured or unavailable');
    });

    test('should handle email sending failure', async () => {
      mockEmailService.sendWelcomeEmail.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/email', {
        method: 'POST',
        body: JSON.stringify({
          type: 'welcome',
          data: {
            name: 'Test User',
            email: 'test@example.com',
            role: 'student'
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to send welcome email');
    });
  });

  describe('GET /api/email', () => {
    test('should return ready status when email service is available', async () => {
      mockVerifyEmailConnection.mockResolvedValue(true);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ready');
      expect(data.message).toBe('Email service is ready');
      expect(data.timestamp).toBeDefined();
    });

    test('should return unavailable status when email service is down', async () => {
      mockVerifyEmailConnection.mockResolvedValue(false);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('unavailable');
      expect(data.message).toBe('Email service is not configured or unavailable');
    });

    test('should handle verification error', async () => {
      mockVerifyEmailConnection.mockRejectedValue(new Error('Connection failed'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Failed to check email service status');
    });
  });
}); 