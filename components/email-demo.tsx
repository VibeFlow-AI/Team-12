'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendBookingConfirmation,
  checkEmailServiceStatus 
} from '@/app/email/utils';

export default function EmailDemo() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [emailStatus, setEmailStatus] = useState<{ status: string; message: string } | null>(null);

  const handleWelcomeEmail = async () => {
    setLoading(true);
    setStatus('');
    
    const success = await sendWelcomeEmail({
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'student'
    });
    
    setStatus(success ? 'Welcome email sent successfully!' : 'Failed to send welcome email');
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setStatus('');
    
    const success = await sendPasswordResetEmail(
      'user@example.com',
      'sample-reset-token-123'
    );
    
    setStatus(success ? 'Password reset email sent!' : 'Failed to send password reset email');
    setLoading(false);
  };

  const handleBookingConfirmation = async () => {
    setLoading(true);
    setStatus('');
    
    const success = await sendBookingConfirmation(
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
    
    setStatus(success ? 'Booking confirmation emails sent!' : 'Failed to send booking confirmations');
    setLoading(false);
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    const result = await checkEmailServiceStatus();
    setEmailStatus(result);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📧 Email System Demo</CardTitle>
          <CardDescription>
            Test the email functionality with sample data. Check your Mailtrap inbox to see the emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Email Service Status */}
          <div className="mb-6">
            <Button 
              onClick={handleCheckStatus} 
              disabled={loading}
              variant="outline"
              className="mb-4"
            >
              Check Email Service Status
            </Button>
            
            {emailStatus && (
              <div className={`p-3 rounded-md ${
                emailStatus.status === 'ready' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              } border`}>
                <strong>Status:</strong> {emailStatus.status}<br />
                <strong>Message:</strong> {emailStatus.message}
              </div>
            )}
          </div>

          {/* Email Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">🎓 Welcome Email</CardTitle>
                <CardDescription className="text-sm">
                  Send a welcome email to a new student
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleWelcomeEmail} 
                  disabled={loading}
                  className="w-full"
                >
                  Send Welcome Email
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  To: john.doe@example.com<br />
                  Role: Student
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">🔒 Password Reset</CardTitle>
                <CardDescription className="text-sm">
                  Send a password reset email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handlePasswordReset} 
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  Send Reset Email
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  To: user@example.com<br />
                  Token: sample-reset-token-123
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">📅 Booking Confirmation</CardTitle>
                <CardDescription className="text-sm">
                  Send booking confirmation to both parties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleBookingConfirmation} 
                  disabled={loading}
                  className="w-full"
                  variant="secondary"
                >
                  Send Confirmations
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Student: student@example.com<br />
                  Mentor: mentor@example.com
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Display */}
          {status && (
            <div className={`p-4 rounded-md ${
              status.includes('successfully') || status.includes('sent')
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            } border`}>
              {status}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Processing...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>🛠️ Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">1. Configure Mailtrap</h4>
            <p className="text-sm text-muted-foreground">
              Add your Mailtrap credentials to your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file:
            </p>
            <div className="bg-gray-50 p-3 rounded-md mt-2 text-sm font-mono">
              MAILTRAP_USER=your-username<br />
              MAILTRAP_PASS=your-password<br />
              MAILTRAP_HOST=sandbox.smtp.mailtrap.io<br />
              MAILTRAP_PORT=2525
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-2">2. Check Email Service Status</h4>
            <p className="text-sm text-muted-foreground">
              Click &quot;Check Email Service Status&quot; above to verify your configuration.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-2">3. Test Email Sending</h4>
            <p className="text-sm text-muted-foreground">
              Click any of the email buttons above and check your Mailtrap inbox for the emails.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <h4 className="font-semibold text-sm text-blue-800 mb-1">💡 Pro Tip</h4>
            <p className="text-sm text-blue-700">
              In production, replace Mailtrap with a real SMTP service like SendGrid, AWS SES, or similar.
              The code will work the same way!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Integration Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Registration Form Integration:</h4>
              <div className="bg-gray-50 p-3 rounded-md text-sm font-mono">
                {`// After successful registration
const success = await sendWelcomeEmail({
  name: formData.name,
  email: formData.email,
  role: formData.role
});`}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">Booking System Integration:</h4>
              <div className="bg-gray-50 p-3 rounded-md text-sm font-mono">
                {`// After booking confirmation
await sendBookingConfirmation(
  booking.studentEmail,
  booking.mentorEmail,
  {
    studentName: booking.studentName,
    mentorName: booking.mentorName,
    sessionDate: booking.date,
    sessionTime: booking.time,
    topic: booking.topic,
    meetingLink: booking.meetingLink
  }
);`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 