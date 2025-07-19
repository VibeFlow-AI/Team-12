/**
 * Utility functions for email operations
 */

interface SendWelcomeEmailParams {
  name: string;
  email: string;
  role: 'student' | 'mentor';
}

/**
 * Send welcome email via API route (client-side safe)
 */
export async function sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<boolean> {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        data: params
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Welcome email sent successfully:', result.message);
      return true;
    } else {
      console.error('Failed to send welcome email:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

/**
 * Send password reset email via API route
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'password-reset',
        data: { email, resetToken }
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Password reset email sent successfully');
      return true;
    } else {
      console.error('Failed to send password reset email:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

/**
 * Send booking confirmation emails via API route
 */
export async function sendBookingConfirmation(
  studentEmail: string,
  mentorEmail: string,
  bookingDetails: {
    studentName: string;
    mentorName: string;
    sessionDate: string;
    sessionTime: string;
    topic: string;
    meetingLink?: string;
  }
): Promise<boolean> {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'booking-confirmation',
        data: { studentEmail, mentorEmail, bookingDetails }
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Booking confirmation emails sent successfully');
      return true;
    } else {
      console.error('Failed to send booking confirmation emails:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error sending booking confirmation emails:', error);
    return false;
  }
}

/**
 * Check email service status
 */
export async function checkEmailServiceStatus(): Promise<{
  status: 'ready' | 'unavailable' | 'error';
  message: string;
}> {
  try {
    const response = await fetch('/api/email');
    const result = await response.json();
    
    return {
      status: result.status,
      message: result.message
    };
  } catch (error) {
    console.error('Error checking email service status:', error);
    return {
      status: 'error',
      message: 'Failed to check email service status'
    };
  }
} 