import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/app/email/service';
import { verifyEmailConnection } from '@/app/email/config';
import { WelcomeEmailData } from '@/app/email/templates/welcome';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Verify email connection before sending
    const isEmailReady = await verifyEmailConnection();
    if (!isEmailReady) {
      return NextResponse.json(
        { error: 'Email service is not configured or unavailable' },
        { status: 503 }
      );
    }

    switch (type) {
      case 'welcome': {
        const { name, email, role }: WelcomeEmailData = data;
        
        if (!name || !email || !role) {
          return NextResponse.json(
            { error: 'Missing required fields: name, email, role' },
            { status: 400 }
          );
        }

        if (role !== 'student' && role !== 'mentor') {
          return NextResponse.json(
            { error: 'Role must be either "student" or "mentor"' },
            { status: 400 }
          );
        }

        const success = await emailService.sendWelcomeEmail({ name, email, role });
        
        if (success) {
          return NextResponse.json({ message: 'Welcome email sent successfully' });
        } else {
          return NextResponse.json(
            { error: 'Failed to send welcome email' },
            { status: 500 }
          );
        }
      }

      case 'password-reset': {
        const { email, resetToken } = data;
        
        if (!email || !resetToken) {
          return NextResponse.json(
            { error: 'Missing required fields: email, resetToken' },
            { status: 400 }
          );
        }

        const success = await emailService.sendPasswordResetEmail(email, resetToken);
        
        if (success) {
          return NextResponse.json({ message: 'Password reset email sent successfully' });
        } else {
          return NextResponse.json(
            { error: 'Failed to send password reset email' },
            { status: 500 }
          );
        }
      }

      case 'booking-confirmation': {
        const { studentEmail, mentorEmail, bookingDetails } = data;
        
        if (!studentEmail || !mentorEmail || !bookingDetails) {
          return NextResponse.json(
            { error: 'Missing required fields: studentEmail, mentorEmail, bookingDetails' },
            { status: 400 }
          );
        }

        const requiredFields = ['studentName', 'mentorName', 'sessionDate', 'sessionTime', 'topic'];
        const missingFields = requiredFields.filter(field => !bookingDetails[field]);
        
        if (missingFields.length > 0) {
          return NextResponse.json(
            { error: `Missing booking details: ${missingFields.join(', ')}` },
            { status: 400 }
          );
        }

        const success = await emailService.sendBookingConfirmation(
          studentEmail,
          mentorEmail,
          bookingDetails
        );
        
        if (success) {
          return NextResponse.json({ message: 'Booking confirmation emails sent successfully' });
        } else {
          return NextResponse.json(
            { error: 'Failed to send booking confirmation emails' },
            { status: 500 }
          );
        }
      }

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Supported types: welcome, password-reset, booking-confirmation' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const isEmailReady = await verifyEmailConnection();
    
    return NextResponse.json({
      status: isEmailReady ? 'ready' : 'unavailable',
      message: isEmailReady 
        ? 'Email service is ready' 
        : 'Email service is not configured or unavailable',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Email status check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to check email service status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 