export interface WelcomeEmailData {
  name: string;
  email: string;
  role: 'student' | 'mentor';
}

export const generateWelcomeEmailHtml = (data: WelcomeEmailData): string => {
  const { name, role } = data;
  const roleSpecificContent = role === 'student' 
    ? {
        title: '🎓 Welcome to Your Learning Journey!',
        subtitle: 'Start connecting with amazing mentors today',
        features: [
          '🔍 Browse and discover expert mentors',
          '📅 Book personalized learning sessions',
          '💡 Get guidance tailored to your goals',
          '📈 Track your progress and achievements'
        ],
        cta: 'Find Your Perfect Mentor',
        ctaUrl: `${process.env.NEXTAUTH_URL}/browse-mentors`
      }
    : {
        title: '🌟 Welcome to the Mentor Community!',
        subtitle: 'Share your expertise and inspire students',
        features: [
          '👥 Connect with eager students',
          '📚 Share your knowledge and experience',
          '💰 Earn from your mentoring sessions',
          '🏆 Build your reputation as a mentor'
        ],
        cta: 'Complete Your Profile',
        ctaUrl: `${process.env.NEXTAUTH_URL}/mentor-profile`
      };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to EduVibe</title>
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
        
        .features {
            background: #f7fafc;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .features h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #2d3748;
        }
        
        .features ul {
            list-style: none;
        }
        
        .features li {
            padding: 8px 0;
            font-size: 15px;
            color: #4a5568;
            display: flex;
            align-items: center;
        }
        
        .features li::before {
            content: '✓';
            background: #48bb78;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            margin-right: 12px;
            flex-shrink: 0;
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
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
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
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
        }
        
        .divider {
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            margin: 30px 0;
            border-radius: 2px;
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
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">E</div>
            <h1>${roleSpecificContent.title}</h1>
            <p>${roleSpecificContent.subtitle}</p>
        </div>
        
        <div class="content">
            <div class="greeting">Hi ${name}! 👋</div>
            
            <div class="message">
                We're thrilled to welcome you to <strong>EduVibe</strong> - the platform where ${role === 'student' ? 'learning meets mentorship' : 'expertise meets opportunity'}! 
                ${role === 'student' 
                  ? 'Your journey to connect with amazing mentors and accelerate your learning starts now.'
                  : 'Your journey to inspire students and share your valuable knowledge begins here.'
                }
            </div>
            
            <div class="divider"></div>
            
            <div class="features">
                <h3>🚀 Here's what you can do:</h3>
                <ul>
                    ${roleSpecificContent.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            
            <div class="cta">
                <a href="${roleSpecificContent.ctaUrl}" class="cta-button">
                    ${roleSpecificContent.cta}
                </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; line-height: 1.6;">
                Need help getting started? Our support team is here for you at 
                <a href="mailto:support@eduvibe.com" style="color: #667eea;">support@eduvibe.com</a>
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Welcome to the EduVibe community!</strong></p>
            <p>This email was sent to ${data.email} because you created an account with us.</p>
            
            <div class="social-links">
                <a href="${process.env.NEXTAUTH_URL}/about">About</a>
                <a href="${process.env.NEXTAUTH_URL}/contact">Contact</a>
                <a href="${process.env.NEXTAUTH_URL}/privacy">Privacy</a>
            </div>
            
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

export const generateWelcomeEmailText = (data: WelcomeEmailData): string => {
  const { name, role } = data;
  const roleText = role === 'student' ? 'learning journey' : 'mentoring adventure';
  
  return `
Hi ${name}!

Welcome to EduVibe - where ${role === 'student' ? 'learning meets mentorship' : 'expertise meets opportunity'}!

We're excited to have you join our community. Your ${roleText} starts now!

${role === 'student' 
  ? `As a student, you can:
- Browse and discover expert mentors
- Book personalized learning sessions  
- Get guidance tailored to your goals
- Track your progress and achievements

Get started: ${process.env.NEXTAUTH_URL}/browse-mentors`
  : `As a mentor, you can:
- Connect with eager students
- Share your knowledge and experience
- Earn from your mentoring sessions
- Build your reputation as a mentor

Complete your profile: ${process.env.NEXTAUTH_URL}/mentor-profile`
}

Need help? Contact us at support@eduvibe.com

Welcome to the EduVibe community!

Best regards,
The EduVibe Team
  `;
}; 