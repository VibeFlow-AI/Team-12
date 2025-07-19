import {
  signupSchema,
  loginSchema,
  studentOnboardingSchema,
  mentorOnboardingSchema,
  sessionBookingSchema,
  reviewSchema,
  paymentSchema,
  mentorSearchSchema,
  sessionUpdateSchema,
  notificationPreferencesSchema,
  analyticsSchema
} from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('signupSchema', () => {
    it('should validate correct signup data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'student' as const
      };

      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123!',
        role: 'student' as const
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('email');
      }
    });

    it('should reject weak password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456', // No uppercase, special char
        role: 'student' as const
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('password');
      }
    });

    it('should reject invalid role', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'invalid' as any
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('role');
      }
    });

    it('should reject short name', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'student' as const
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('name');
      }
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'john@example.com',
        password: ''
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('studentOnboardingSchema', () => {
    it('should validate correct student onboarding data', () => {
      const validData = {
        institution: 'MIT',
        fieldOfStudy: 'Computer Science',
        academicLevel: 'undergraduate' as const,
        graduationYear: 2025,
        learningGoals: ['Web Development', 'Machine Learning'],
        primarySubjects: ['Mathematics', 'Programming'],
        skillLevel: 'intermediate' as const,
        mentorshipStyle: 'structured' as const,
        sessionFrequency: 'weekly' as const,
        preferredSessionDuration: '1hour' as const,
        timezone: 'UTC',
        availability: ['monday-morning', 'wednesday-evening']
      };

      const result = studentOnboardingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid graduation year', () => {
      const invalidData = {
        institution: 'MIT',
        fieldOfStudy: 'Computer Science',
        academicLevel: 'undergraduate' as const,
        graduationYear: 2019, // Too early
        learningGoals: ['Web Development'],
        primarySubjects: ['Mathematics'],
        skillLevel: 'intermediate' as const,
        mentorshipStyle: 'structured' as const,
        sessionFrequency: 'weekly' as const,
        preferredSessionDuration: '1hour' as const,
        timezone: 'UTC',
        availability: ['monday-morning']
      };

      const result = studentOnboardingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty learning goals', () => {
      const invalidData = {
        institution: 'MIT',
        fieldOfStudy: 'Computer Science',
        academicLevel: 'undergraduate' as const,
        graduationYear: 2025,
        learningGoals: [], // Empty array
        primarySubjects: ['Mathematics'],
        skillLevel: 'intermediate' as const,
        mentorshipStyle: 'structured' as const,
        sessionFrequency: 'weekly' as const,
        preferredSessionDuration: '1hour' as const,
        timezone: 'UTC',
        availability: ['monday-morning']
      };

      const result = studentOnboardingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('mentorOnboardingSchema', () => {
    it('should validate correct mentor onboarding data', () => {
      const validData = {
        jobTitle: 'Senior Software Engineer',
        company: 'Tech Corp',
        experience: 5,
        education: [
          {
            degree: 'Bachelor of Science',
            institution: 'MIT',
            year: 2018
          }
        ],
        expertise: ['JavaScript', 'React'],
        skills: ['Problem Solving', 'Communication'],
        mentoringExperience: 2,
        mentorshipStyle: 'flexible' as const,
        maxStudents: 10,
        sessionTypes: ['one_on_one' as const],
        hourlyRate: 75,
        availability: ['monday-morning', 'friday-afternoon'],
        timezone: 'UTC',
        bio: 'I am a passionate software engineer with 5 years of experience in web development.',
        languages: ['English', 'Spanish']
      };

      const result = mentorOnboardingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short bio', () => {
      const invalidData = {
        jobTitle: 'Senior Software Engineer',
        company: 'Tech Corp',
        experience: 5,
        education: [
          {
            degree: 'Bachelor of Science',
            institution: 'MIT',
            year: 2018
          }
        ],
        expertise: ['JavaScript'],
        skills: ['Problem Solving'],
        mentoringExperience: 2,
        mentorshipStyle: 'flexible' as const,
        maxStudents: 10,
        sessionTypes: ['one_on_one' as const],
        hourlyRate: 75,
        availability: ['monday-morning'],
        timezone: 'UTC',
        bio: 'Short bio', // Too short
        languages: ['English']
      };

      const result = mentorOnboardingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid hourly rate', () => {
      const invalidData = {
        jobTitle: 'Senior Software Engineer',
        company: 'Tech Corp',
        experience: 5,
        education: [
          {
            degree: 'Bachelor of Science',
            institution: 'MIT',
            year: 2018
          }
        ],
        expertise: ['JavaScript'],
        skills: ['Problem Solving'],
        mentoringExperience: 2,
        mentorshipStyle: 'flexible' as const,
        maxStudents: 10,
        sessionTypes: ['one_on_one' as const],
        hourlyRate: 5, // Too low
        availability: ['monday-morning'],
        timezone: 'UTC',
        bio: 'I am a passionate software engineer with many years of experience.',
        languages: ['English']
      };

      const result = mentorOnboardingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('sessionBookingSchema', () => {
    it('should validate correct session booking data', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const validData = {
        mentorId: 'mentor123',
        sessionDate: futureDate.toISOString(),
        sessionTime: '14:30',
        duration: '1hour' as const,
        subject: 'Mathematics',
        sessionType: 'one_on_one' as const
      };

      const result = sessionBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const invalidData = {
        mentorId: 'mentor123',
        sessionDate: pastDate.toISOString(),
        sessionTime: '14:30',
        duration: '1hour' as const,
        subject: 'Mathematics',
        sessionType: 'one_on_one' as const
      };

      const result = sessionBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const invalidData = {
        mentorId: 'mentor123',
        sessionDate: futureDate.toISOString(),
        sessionTime: '25:00', // Invalid time
        duration: '1hour' as const,
        subject: 'Mathematics',
        sessionType: 'one_on_one' as const
      };

      const result = sessionBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('reviewSchema', () => {
    it('should validate correct review data', () => {
      const validData = {
        sessionId: 'session123',
        rating: 5,
        comment: 'Excellent mentor! Very helpful and patient.',
        wouldRecommend: true,
        skills: ['Problem Solving', 'Communication']
      };

      const result = reviewSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid rating', () => {
      const invalidData = {
        sessionId: 'session123',
        rating: 6, // Out of range
        comment: 'Good session',
        wouldRecommend: true
      };

      const result = reviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short comment', () => {
      const invalidData = {
        sessionId: 'session123',
        rating: 5,
        comment: 'Good', // Too short
        wouldRecommend: true
      };

      const result = reviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('paymentSchema', () => {
    it('should validate correct payment data', () => {
      const validData = {
        bookingId: 'booking123',
        amount: 50.00,
        currency: 'USD',
        paymentMethod: 'card' as const
      };

      const result = paymentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const invalidData = {
        bookingId: 'booking123',
        amount: -10,
        currency: 'USD',
        paymentMethod: 'card' as const
      };

      const result = paymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid currency code', () => {
      const invalidData = {
        bookingId: 'booking123',
        amount: 50.00,
        currency: 'INVALID',
        paymentMethod: 'card' as const
      };

      const result = paymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('mentorSearchSchema', () => {
    it('should validate correct search data', () => {
      const validData = {
        query: 'javascript',
        subjects: ['Programming', 'Web Development'],
        experience: {
          min: 2,
          max: 10
        },
        hourlyRate: {
          min: 20,
          max: 100
        },
        rating: 4,
        sortBy: 'rating' as const
      };

      const result = mentorSearchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept empty search data', () => {
      const validData = {};

      const result = mentorSearchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid rating', () => {
      const invalidData = {
        rating: 6 // Out of range
      };

      const result = mentorSearchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('sessionUpdateSchema', () => {
    it('should validate correct session update data', () => {
      const validData = {
        status: 'completed' as const,
        notes: 'Session went well, student made good progress.'
      };

      const result = sessionUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate reschedule data', () => {
      const validData = {
        status: 'rescheduled' as const,
        rescheduleDate: '2024-12-30',
        rescheduleTime: '15:00'
      };

      const result = sessionUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const invalidData = {
        status: 'invalid_status' as any
      };

      const result = sessionUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('notificationPreferencesSchema', () => {
    it('should validate correct notification preferences', () => {
      const validData = {
        email: {
          bookingUpdates: true,
          sessionReminders: false,
          messages: true,
          promotions: false
        },
        sms: {
          sessionReminders: true,
          emergencyUpdates: true
        },
        push: {
          messages: true,
          sessionReminders: true,
          bookingUpdates: false
        }
      };

      const result = notificationPreferencesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        email: {
          bookingUpdates: true
          // Missing other required fields
        }
      };

      const result = notificationPreferencesSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('analyticsSchema', () => {
    it('should validate correct analytics data', () => {
      const validData = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        metrics: ['sessions', 'revenue']
      };

      const result = analyticsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        startDate: 'invalid-date',
        endDate: '2024-12-31',
        metrics: ['sessions']
      };

      const result = analyticsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty metrics array', () => {
      const invalidData = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        metrics: [] // Empty array
      };

      const result = analyticsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});