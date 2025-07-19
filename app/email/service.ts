import { transporter } from './config';
import { generateWelcomeEmailHtml, generateWelcomeEmailText, WelcomeEmailData } from './templates/welcome';

export interface EmailOptions {
  to: string;
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

class EmailService {
  private defaultFromEmail = process.env.DEFAULT_FROM_EMAIL || 'EduVibe <noreply@eduvibe.com>';

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: options.from || this.defaultFromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const subject = data.role === 'student' 
      ? '🎓 Welcome to EduVibe - Your Learning Journey Begins!'
      : '🌟 Welcome to EduVibe - Start Mentoring Today!';

    const html = generateWelcomeEmailHtml(data);
    const text = generateWelcomeEmailText(data);

    return this.sendEmail({
      to: data.email,
      subject,
      html,
      text,
      replyTo: 'support@eduvibe.com'
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Reset Your Password</h2>
        <p>You requested to reset your password. Click the link below to create a new password:</p>
        <p>
          <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;

    const text = `
      Reset Your Password
      
      You requested to reset your password. Click the link below to create a new password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      If you didn't request this, you can safely ignore this email.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your EduVibe Password',
      html,
      text
    });
  }

  async sendBookingConfirmation(
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
    const { studentName, mentorName, sessionDate, sessionTime, topic, meetingLink } = bookingDetails;

    // Email to student
    const studentHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>🎉 Session Booked Successfully!</h2>
        <p>Hi ${studentName},</p>
        <p>Your mentoring session has been confirmed:</p>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Mentor:</strong> ${mentorName}</p>
          <p><strong>Date:</strong> ${sessionDate}</p>
          <p><strong>Time:</strong> ${sessionTime}</p>
          <p><strong>Topic:</strong> ${topic}</p>
          ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        </div>
        
        <p>We're excited for your learning session!</p>
      </div>
    `;

    // Email to mentor
    const mentorHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>📅 New Session Booked</h2>
        <p>Hi ${mentorName},</p>
        <p>You have a new mentoring session:</p>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Student:</strong> ${studentName}</p>
          <p><strong>Date:</strong> ${sessionDate}</p>
          <p><strong>Time:</strong> ${sessionTime}</p>
          <p><strong>Topic:</strong> ${topic}</p>
          ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        </div>
        
        <p>Looking forward to a great session!</p>
      </div>
    `;

    try {
      await Promise.all([
        this.sendEmail({
          to: studentEmail,
          subject: '🎉 Your EduVibe Session is Confirmed!',
          html: studentHtml
        }),
        this.sendEmail({
          to: mentorEmail,
          subject: '📅 New Session Booking - EduVibe',
          html: mentorHtml
        })
      ]);
      return true;
    } catch (error) {
      console.error('Failed to send booking confirmation emails:', error);
      return false;
    }
  }
}

export const emailService = new EmailService(); 