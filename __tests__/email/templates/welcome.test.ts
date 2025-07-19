import { generateWelcomeEmailHtml, generateWelcomeEmailText, WelcomeEmailData } from '@/app/email/templates/welcome';

describe('Welcome Email Templates', () => {
  const mockStudentData: WelcomeEmailData = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student'
  };

  const mockMentorData: WelcomeEmailData = {
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'mentor'
  };

  describe('generateWelcomeEmailHtml', () => {
    test('should generate HTML for student', () => {
      const html = generateWelcomeEmailHtml(mockStudentData);
      
      expect(html).toContain('Welcome to Your Learning Journey!');
      expect(html).toContain('John Doe');
      expect(html).toContain('john@example.com');
      expect(html).toContain('Browse and discover expert mentors');
      expect(html).toContain('Find Your Perfect Mentor');
      expect(html).toContain('learning meets mentorship');
    });

    test('should generate HTML for mentor', () => {
      const html = generateWelcomeEmailHtml(mockMentorData);
      
      expect(html).toContain('Welcome to the Mentor Community!');
      expect(html).toContain('Jane Smith');
      expect(html).toContain('jane@example.com');
      expect(html).toContain('Connect with eager students');
      expect(html).toContain('Complete Your Profile');
      expect(html).toContain('expertise meets opportunity');
    });

    test('should contain proper HTML structure', () => {
      const html = generateWelcomeEmailHtml(mockStudentData);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</body>');
      expect(html).toContain('</html>');
    });

    test('should include responsive CSS', () => {
      const html = generateWelcomeEmailHtml(mockStudentData);
      
      expect(html).toContain('@media (max-width: 600px)');
      expect(html).toContain('max-width: 600px');
    });
  });

  describe('generateWelcomeEmailText', () => {
    test('should generate plain text for student', () => {
      const text = generateWelcomeEmailText(mockStudentData);
      
      expect(text).toContain('Hi John Doe!');
      expect(text).toContain('Welcome to EduVibe');
      expect(text).toContain('learning journey');
      expect(text).toContain('Browse and discover expert mentors');
      expect(text).toContain('support@eduvibe.com');
    });

    test('should generate plain text for mentor', () => {
      const text = generateWelcomeEmailText(mockMentorData);
      
      expect(text).toContain('Hi Jane Smith!');
      expect(text).toContain('Welcome to EduVibe');
      expect(text).toContain('mentoring adventure');
      expect(text).toContain('Connect with eager students');
      expect(text).toContain('support@eduvibe.com');
    });

    test('should not contain HTML tags', () => {
      const text = generateWelcomeEmailText(mockStudentData);
      
      expect(text).not.toContain('<');
      expect(text).not.toContain('>');
    });
  });
}); 