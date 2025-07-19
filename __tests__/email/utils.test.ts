import { sendWelcomeEmail, sendPasswordResetEmail, sendBookingConfirmation, checkEmailServiceStatus } from '@/app/email/utils';

// Mock fetch globally
global.fetch = jest.fn();

describe('Email Utils', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('sendWelcomeEmail', () => {
    const welcomeData = {
      name: 'Test User',
      email: 'test@example.com',
      role: 'student' as const
    };

    test('should send welcome email successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Welcome email sent successfully' })
      } as Response);

      const result = await sendWelcomeEmail(welcomeData);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          data: welcomeData
        })
      });
    });

    test('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to send email' })
      } as Response);

      const result = await sendWelcomeEmail(welcomeData);

      expect(result).toBe(false);
    });

    test('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await sendWelcomeEmail(welcomeData);

      expect(result).toBe(false);
    });
  });

  describe('sendPasswordResetEmail', () => {
    test('should send password reset email successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset email sent successfully' })
      } as Response);

      const result = await sendPasswordResetEmail('user@example.com', 'reset-token');

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'password-reset',
          data: { email: 'user@example.com', resetToken: 'reset-token' }
        })
      });
    });

    test('should handle failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to send reset email' })
      } as Response);

      const result = await sendPasswordResetEmail('user@example.com', 'reset-token');

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

    test('should send booking confirmation successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Booking confirmation emails sent successfully' })
      } as Response);

      const result = await sendBookingConfirmation(
        'student@example.com',
        'mentor@example.com',
        bookingDetails
      );

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking-confirmation',
          data: {
            studentEmail: 'student@example.com',
            mentorEmail: 'mentor@example.com',
            bookingDetails
          }
        })
      });
    });

    test('should handle failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to send confirmations' })
      } as Response);

      const result = await sendBookingConfirmation(
        'student@example.com',
        'mentor@example.com',
        bookingDetails
      );

      expect(result).toBe(false);
    });
  });

  describe('checkEmailServiceStatus', () => {
    test('should check email service status successfully', async () => {
      const mockStatus = {
        status: 'ready',
        message: 'Email service is ready'
      };

      mockFetch.mockResolvedValueOnce({
        json: async () => mockStatus
      } as Response);

      const result = await checkEmailServiceStatus();

      expect(result).toEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith('/api/email');
    });

    test('should handle status check failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await checkEmailServiceStatus();

      expect(result).toEqual({
        status: 'error',
        message: 'Failed to check email service status'
      });
    });
  });
}); 