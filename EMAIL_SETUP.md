# Email System Setup Guide - EduVibe

This guide covers how to set up and use the email system for EduVibe, including Mailtrap integration for development and production email sending.

## 📧 Features

- **Welcome Emails**: Beautiful HTML emails sent to new users upon registration
- **Password Reset**: Secure password reset emails with tokens
- **Booking Confirmations**: Automated emails for mentor-student session bookings
- **Role-specific Content**: Different email templates for students and mentors
- **Mailtrap Integration**: Safe email testing in development
- **Error Handling**: Graceful degradation when email service is unavailable

## 🛠️ Setup Instructions

### 1. Install Dependencies

The required packages are already installed:
```bash
npm install nodemailer @types/nodemailer
```

### 2. Mailtrap Configuration

#### For Development (Recommended):

1. **Sign up for Mailtrap** at [https://mailtrap.io](https://mailtrap.io)
2. **Create a new inbox** in your Mailtrap dashboard
3. **Get your SMTP credentials** from the inbox settings
4. **Add to your `.env.local`**:

```env
# Mailtrap Email Configuration
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT="2525"
MAILTRAP_USER="your-mailtrap-username-here"
MAILTRAP_PASS="your-mailtrap-password-here"
DEFAULT_FROM_EMAIL="EduVibe <noreply@eduvibe.com>"

# NextAuth (required for email links)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

#### For Production:

Replace Mailtrap credentials with your production SMTP service (SendGrid, AWS SES, etc.):

```env
MAILTRAP_HOST="smtp.your-provider.com"
MAILTRAP_PORT="587"
MAILTRAP_USER="your-smtp-username"
MAILTRAP_PASS="your-smtp-password"
```

### 3. Verify Setup

Test your email configuration by checking the service status:

```bash
curl http://localhost:3000/api/email
```

Expected response:
```json
{
  "status": "ready",
  "message": "Email service is ready",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎨 Email Templates

### Welcome Email Features:

- **Role-specific content** for students and mentors
- **Beautiful HTML design** with gradients and modern styling
- **Responsive layout** for mobile devices
- **Call-to-action buttons** leading to relevant pages
- **Brand consistency** with EduVibe design system

### Template Structure:

```typescript
// Welcome email data structure
interface WelcomeEmailData {
  name: string;
  email: string;
  role: 'student' | 'mentor';
}
```

## 🚀 Usage

### 1. Automatic Welcome Emails

Welcome emails are automatically sent when users register via `/api/auth/register`. No additional code needed!

### 2. Manual Email Sending

#### Send Welcome Email:
```typescript
import { sendWelcomeEmail } from '@/app/email/utils';

await sendWelcomeEmail({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'student'
});
```

#### Send Password Reset:
```typescript
import { sendPasswordResetEmail } from '@/app/email/utils';

await sendPasswordResetEmail('user@example.com', 'reset-token-123');
```

#### Send Booking Confirmation:
```typescript
import { sendBookingConfirmation } from '@/app/email/utils';

await sendBookingConfirmation(
  'student@example.com',
  'mentor@example.com',
  {
    studentName: 'John Doe',
    mentorName: 'Jane Smith',
    sessionDate: '2024-02-15',
    sessionTime: '2:00 PM EST',
    topic: 'React Development',
    meetingLink: 'https://meet.google.com/xyz-abc-123'
  }
);
```

### 3. API Usage

#### Send Email via API:
```javascript
// POST /api/email
const response = await fetch('/api/email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'welcome', // 'welcome' | 'password-reset' | 'booking-confirmation'
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student'
    }
  })
});
```

#### Check Email Service Status:
```javascript
// GET /api/email
const response = await fetch('/api/email');
const status = await response.json();
```

## 📁 File Structure

```
app/
├── email/
│   ├── config.ts           # Email configuration & transporter
│   ├── service.ts          # Email service class with methods
│   ├── utils.ts            # Client-side utility functions
│   └── templates/
│       └── welcome.ts      # Welcome email HTML & text templates
└── api/
    └── email/
        └── route.ts        # API routes for email operations
```

## 🎯 Email Types

### 1. Welcome Emails

**Triggers**: User registration
**Recipients**: New users (students/mentors)
**Content**: 
- Role-specific welcome message
- Platform feature highlights
- Call-to-action buttons
- Support contact information

### 2. Password Reset

**Triggers**: Password reset request
**Recipients**: Users requesting password reset
**Content**:
- Secure reset link with token
- Expiration information
- Security instructions

### 3. Booking Confirmations

**Triggers**: Session booking
**Recipients**: Both student and mentor
**Content**:
- Session details (date, time, topic)
- Participant information
- Meeting link (if available)
- Contact information

## 🛡️ Security & Best Practices

### Environment Variables
- Never commit real SMTP credentials to version control
- Use different credentials for development and production
- Rotate credentials regularly

### Email Content
- All templates include unsubscribe information
- Links use HTTPS in production
- Tokens expire appropriately (1 hour for password reset)

### Error Handling
- Email failures don't block user registration
- All errors are logged for monitoring
- Graceful degradation when email service is unavailable

## 🔧 Customization

### Adding New Email Templates

1. **Create template function** in `app/email/templates/`:
```typescript
export const generateCustomEmailHtml = (data: CustomEmailData): string => {
  // Your HTML template
};
```

2. **Add service method** in `app/email/service.ts`:
```typescript
async sendCustomEmail(data: CustomEmailData): Promise<boolean> {
  // Implementation
}
```

3. **Add API route handler** in `app/api/email/route.ts`:
```typescript
case 'custom': {
  // Handle custom email type
}
```

### Styling Guidelines

- Use inline CSS for email compatibility
- Test across different email clients
- Include fallback fonts
- Use tables for complex layouts
- Provide text alternatives

## 📊 Monitoring

### Logs
- All email operations are logged to console
- Success/failure status included
- Error details for debugging

### Health Check
- Use `GET /api/email` to verify service status
- Implement monitoring alerts for email failures
- Track delivery rates in production

## 🚨 Troubleshooting

### Common Issues

1. **"Email service is not configured"**
   - Check environment variables are set
   - Verify MAILTRAP_USER and MAILTRAP_PASS

2. **"Authentication failed"**
   - Verify Mailtrap credentials
   - Check if inbox is active

3. **"Connection timeout"**
   - Check network connectivity
   - Verify MAILTRAP_HOST and MAILTRAP_PORT

4. **Emails not received**
   - Check spam folder
   - Verify recipient email address
   - Check Mailtrap inbox for captured emails

### Debug Mode

Enable debug logging by adding to your environment:
```env
NODE_ENV=development
```

This will show detailed connection and sending logs in your console.

## 📞 Support

For email system support:
- Check logs in development console
- Verify Mailtrap inbox for test emails
- Review environment variable configuration
- Test email service status endpoint

---

## Quick Start Checklist

- [ ] Sign up for Mailtrap account
- [ ] Create inbox in Mailtrap dashboard
- [ ] Copy SMTP credentials to `.env.local`
- [ ] Set NEXTAUTH_URL and NEXTAUTH_SECRET
- [ ] Test email service: `curl http://localhost:3000/api/email`
- [ ] Register a test user to receive welcome email
- [ ] Check Mailtrap inbox for delivered email

Your email system is now ready! 🎉 