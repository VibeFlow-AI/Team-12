export interface MentorSessionRegistrationData {
  mentorName: string;
  mentorEmail: string;
  studentName: string;
  studentEmail: string;
  sessionTitle: string;
  sessionDate: string;
  sessionTime: string;
  sessionDuration: string;
  sessionType: string; // 'online' | 'in-person'
  studentBackground?: string;
  studentGoals?: string;
  sessionDescription?: string;
  totalEarnings?: string;
}

export const generateMentorSessionRegistrationHtml = (data: MentorSessionRegistrationData): string => {
  const { mentorName, studentName, studentEmail, sessionTitle, sessionDate, sessionTime, sessionDuration, sessionType, studentBackground, studentGoals, sessionDescription, totalEarnings } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Session Registration</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px 0;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 40px 30px;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="25" cy="25" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="50" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="20" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
            opacity: 0.3;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            position: relative;
            z-index: 1;
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #2d3748;
        }
        
        .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .session-details {
            background: #f7fafc;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border-left: 4px solid #667eea;
        }
        
        .session-details h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #2d3748;
            display: flex;
            align-items: center;
        }
        
        .session-details h3::before {
            content: '👤';
            margin-right: 10px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-weight: 600;
            color: #4a5568;
            font-size: 14px;
        }
        
        .detail-value {
            color: #2d3748;
            font-size: 14px;
            text-align: right;
            font-weight: 500;
        }
        
        .student-info {
            background: #e6fffa;
            border: 1px solid #81e6d9;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .student-info h4 {
            color: #234e52;
            font-size: 16px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        
        .student-info h4::before {
            content: '🎯';
            margin-right: 8px;
        }
        
        .student-info p {
            color: #285e61;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 10px;
        }
        
        .earnings-highlight {
            background: #f0fff4;
            border: 2px solid #68d391;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        
        .earnings-highlight h4 {
            color: #22543d;
            font-size: 18px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .earnings-highlight h4::before {
            content: '💰';
            margin-right: 8px;
        }
        
        .earnings-amount {
            font-size: 24px;
            font-weight: bold;
            color: #38a169;
            margin-bottom: 5px;
        }
        
        .earnings-note {
            font-size: 12px;
            color: #68d391;
        }
        
        .cta {
            text-align: center;
            margin: 40px 0 30px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            margin: 0 10px 10px;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .cta-button.secondary {
            background: #f7fafc;
            color: #4a5568;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .footer {
            background: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
            font-size: 14px;
            color: #718096;
            margin-bottom: 10px;
        }
        
        .divider {
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            margin: 30px 0;
            border-radius: 2px;
        }
        
        .preparation-tips {
            background: #fef5e7;
            border: 1px solid #f6ad55;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .preparation-tips h4 {
            color: #c05621;
            font-size: 16px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        
        .preparation-tips h4::before {
            content: '📋';
            margin-right: 8px;
        }
        
        .preparation-tips ul {
            list-style: none;
            color: #744210;
        }
        
        .preparation-tips li {
            padding: 4px 0;
            font-size: 14px;
        }
        
        .preparation-tips li::before {
            content: '•';
            color: #f6ad55;
            font-weight: bold;
            margin-right: 8px;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0 10px;
            }
            
            .header, .content, .footer {
                padding: 30px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .cta-button {
                display: block;
                width: 100%;
                margin: 10px 0;
            }
            
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
            
            .detail-value {
                text-align: left;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌟</div>
            <h1>🎉 New Student Registration!</h1>
            <p>A student has booked your session</p>
        </div>
        
        <div class="content">
            <div class="greeting">Hi ${mentorName}! 👋</div>
            
            <div class="message">
                Great news! <strong>${studentName}</strong> has registered for your upcoming session. 
                This is your opportunity to make a real impact on their learning journey!
            </div>
            
            <div class="session-details">
                <h3>Session Details</h3>
                
                <div class="detail-row">
                    <span class="detail-label">Session</span>
                    <span class="detail-value">${sessionTitle}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Student</span>
                    <span class="detail-value">${studentName}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Student Email</span>
                    <span class="detail-value">${studentEmail}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">${sessionDate}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Time</span>
                    <span class="detail-value">${sessionTime}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Duration</span>
                    <span class="detail-value">${sessionDuration}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Format</span>
                    <span class="detail-value">${sessionType === 'online' ? '💻 Online' : '🏢 In-Person'}</span>
                </div>
                
                ${sessionDescription ? `
                <div class="divider" style="margin: 20px 0; height: 1px; background: #e2e8f0;"></div>
                <div style="margin-top: 15px;">
                    <div class="detail-label" style="margin-bottom: 8px;">Session Description:</div>
                    <div style="color: #2d3748; font-size: 14px; line-height: 1.5;">${sessionDescription}</div>
                </div>
                ` : ''}
            </div>
            
            ${(studentBackground || studentGoals) ? `
            <div class="student-info">
                <h4>About ${studentName}</h4>
                ${studentBackground ? `
                <p><strong>Background:</strong> ${studentBackground}</p>
                ` : ''}
                ${studentGoals ? `
                <p><strong>Learning Goals:</strong> ${studentGoals}</p>
                ` : ''}
            </div>
            ` : ''}
            
            ${totalEarnings ? `
            <div class="earnings-highlight">
                <h4>Session Earnings</h4>
                <div class="earnings-amount">${totalEarnings}</div>
                <div class="earnings-note">Will be transferred after session completion</div>
            </div>
            ` : ''}
            
            <div class="preparation-tips">
                <h4>Preparation Checklist</h4>
                <ul>
                    <li>Review the student's background and goals</li>
                    <li>Prepare relevant materials and resources</li>
                    <li>Test your tech setup 15 minutes before</li>
                    <li>Plan your session structure and key points</li>
                    <li>Prepare actionable takeaways for the student</li>
                </ul>
            </div>
            
            <div class="cta">
                <a href="${process.env.NEXTAUTH_URL}/mentor/sessions" class="cta-button">
                    Manage Sessions
                </a>
                <a href="${process.env.NEXTAUTH_URL}/mentor/student-profile/${encodeURIComponent(studentEmail)}" class="cta-button secondary">
                    View Student Profile
                </a>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #718096; font-size: 14px; line-height: 1.6;">
                Need to reschedule or have questions? Contact us at 
                <a href="mailto:support@eduvibe.com" style="color: #667eea;">support@eduvibe.com</a> 
                or reach out to the student directly at 
                <a href="mailto:${studentEmail}" style="color: #667eea;">${studentEmail}</a>
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Happy Mentoring! 🎓</strong></p>
            <p>This notification was sent to ${data.mentorEmail}</p>
            
            <p style="font-size: 12px; color: #a0aec0;">
                © 2024 EduVibe. All rights reserved.<br>
                Made with ❤️ for learners and mentors everywhere.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

export const generateMentorSessionRegistrationText = (data: MentorSessionRegistrationData): string => {
  const { mentorName, studentName, studentEmail, sessionTitle, sessionDate, sessionTime, sessionDuration, sessionType, studentBackground, studentGoals, totalEarnings } = data;
  
  return `
Hi ${mentorName}!

🎉 NEW STUDENT REGISTRATION!

Great news! ${studentName} has registered for your upcoming session.

SESSION DETAILS:
- Session: ${sessionTitle}
- Student: ${studentName} (${studentEmail})
- Date: ${sessionDate}
- Time: ${sessionTime}
- Duration: ${sessionDuration}
- Format: ${sessionType === 'online' ? 'Online' : 'In-Person'}

${studentBackground ? `STUDENT BACKGROUND: ${studentBackground}` : ''}

${studentGoals ? `LEARNING GOALS: ${studentGoals}` : ''}

${totalEarnings ? `SESSION EARNINGS: ${totalEarnings}` : ''}

PREPARATION CHECKLIST:
- Review the student's background and goals
- Prepare relevant materials and resources
- Test your tech setup 15 minutes before
- Plan your session structure and key points
- Prepare actionable takeaways for the student

Manage your sessions: ${process.env.NEXTAUTH_URL}/mentor/sessions

Need help? Contact us at support@eduvibe.com

Happy Mentoring!
The EduVibe Team
  `;
}; 