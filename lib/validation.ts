import { z } from "zod";

// User Authentication Schemas
export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  role: z.enum(["student", "mentor"], {
    required_error: "Please select a role",
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Student Onboarding Schema
export const studentOnboardingSchema = z.object({
  // Academic Information
  institution: z.string().min(2, "Institution name is required"),
  fieldOfStudy: z.string().min(2, "Field of study is required"),
  academicLevel: z.enum(["high_school", "undergraduate", "graduate", "postgraduate", "other"], {
    required_error: "Please select your academic level",
  }),
  graduationYear: z.number().min(2020).max(2035),
  
  // Learning Goals
  learningGoals: z.array(z.string()).min(1, "Please select at least one learning goal"),
  primarySubjects: z.array(z.string()).min(1, "Please select at least one subject of interest"),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select your skill level",
  }),
  
  // Mentorship Preferences
  mentorshipStyle: z.enum(["structured", "flexible", "project_based"], {
    required_error: "Please select your preferred mentorship style",
  }),
  sessionFrequency: z.enum(["weekly", "biweekly", "monthly", "as_needed"], {
    required_error: "Please select your preferred session frequency",
  }),
  preferredSessionDuration: z.enum(["30min", "1hour", "1.5hours", "2hours"], {
    required_error: "Please select your preferred session duration",
  }),
  
  // Additional Information
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  timezone: z.string().min(1, "Timezone is required"),
  availability: z.array(z.string()).min(1, "Please select at least one availability slot"),
});

// Mentor Onboarding Schema
export const mentorOnboardingSchema = z.object({
  // Professional Information
  jobTitle: z.string().min(2, "Job title is required"),
  company: z.string().min(2, "Company name is required"),
  experience: z.number().min(0).max(50),
  
  // Education
  education: z.array(z.object({
    degree: z.string().min(2, "Degree is required"),
    institution: z.string().min(2, "Institution is required"),
    year: z.number().min(1950).max(2030),
  })).min(1, "Please add at least one education entry"),
  
  // Expertise
  expertise: z.array(z.string()).min(1, "Please select at least one area of expertise"),
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
  certifications: z.array(z.string()).optional(),
  
  // Mentoring Information
  mentoringExperience: z.number().min(0).max(50),
  mentorshipStyle: z.enum(["structured", "flexible", "project_based"], {
    required_error: "Please select your mentorship style",
  }),
  maxStudents: z.number().min(1).max(20),
  sessionTypes: z.array(z.enum(["one_on_one", "group", "workshop"])).min(1, "Please select at least one session type"),
  
  // Availability and Pricing
  hourlyRate: z.number().min(10).max(500),
  availability: z.array(z.string()).min(1, "Please select at least one availability slot"),
  timezone: z.string().min(1, "Timezone is required"),
  
  // Additional Information
  bio: z.string().min(50, "Bio must be at least 50 characters").max(1000, "Bio must be less than 1000 characters"),
  languages: z.array(z.string()).min(1, "Please select at least one language"),
});

// Session Booking Schema
export const sessionBookingSchema = z.object({
  mentorId: z.string().min(1, "Mentor ID is required"),
  sessionDate: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, "Session date must be today or in the future"),
  sessionTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time format (HH:MM)"),
  duration: z.enum(["30min", "1hour", "1.5hours", "2hours"], {
    required_error: "Please select session duration",
  }),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().max(500, "Message must be less than 500 characters").optional(),
  sessionType: z.enum(["one_on_one", "group"], {
    required_error: "Please select session type",
  }),
});

// Payment Schema
export const paymentSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().min(3).max(3),
  paymentMethod: z.enum(["card", "bank_transfer", "digital_wallet"], {
    required_error: "Please select a payment method",
  }),
  bankSlipUrl: z.string().url("Please provide a valid bank slip URL").optional(),
});

// Review and Rating Schema
export const reviewSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(500, "Comment must be less than 500 characters"),
  wouldRecommend: z.boolean(),
  skills: z.array(z.string()).optional(),
});

// Profile Update Schemas
export const updateStudentProfileSchema = studentOnboardingSchema.partial();
export const updateMentorProfileSchema = mentorOnboardingSchema.partial();

// File Upload Schema
export const fileUploadSchema = z.object({
  file: z.any().refine((file) => {
    if (!file) return false;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    return allowedTypes.includes(file.type);
  }, "File must be JPEG, PNG, or PDF"),
  category: z.enum(["avatar", "bank_slip", "certificate", "document"], {
    required_error: "Please specify file category",
  }),
});

// Search and Filter Schema
export const mentorSearchSchema = z.object({
  query: z.string().max(100, "Search query must be less than 100 characters").optional(),
  subjects: z.array(z.string()).optional(),
  experience: z.object({
    min: z.number().min(0).optional(),
    max: z.number().max(50).optional(),
  }).optional(),
  hourlyRate: z.object({
    min: z.number().min(0).optional(),
    max: z.number().max(1000).optional(),
  }).optional(),
  availability: z.array(z.string()).optional(),
  rating: z.number().min(1).max(5).optional(),
  sortBy: z.enum(["rating", "experience", "price_low", "price_high", "newest"]).optional(),
});

// Session Management Schema
export const sessionUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "rescheduled"], {
    required_error: "Please select a status",
  }),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  rescheduleDate: z.string().optional(),
  rescheduleTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
});

// Notification Preferences Schema
export const notificationPreferencesSchema = z.object({
  email: z.object({
    bookingUpdates: z.boolean(),
    sessionReminders: z.boolean(),
    messages: z.boolean(),
    promotions: z.boolean(),
  }),
  sms: z.object({
    sessionReminders: z.boolean(),
    emergencyUpdates: z.boolean(),
  }),
  push: z.object({
    messages: z.boolean(),
    sessionReminders: z.boolean(),
    bookingUpdates: z.boolean(),
  }),
});

// Analytics Schema
export const analyticsSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid start date"),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid end date"),
  metrics: z.array(z.enum(["sessions", "revenue", "ratings", "students"])).min(1, "Please select at least one metric"),
});

// Type exports for TypeScript
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type StudentOnboardingInput = z.infer<typeof studentOnboardingSchema>;
export type MentorOnboardingInput = z.infer<typeof mentorOnboardingSchema>;
export type SessionBookingInput = z.infer<typeof sessionBookingSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type MentorSearchInput = z.infer<typeof mentorSearchSchema>;
export type SessionUpdateInput = z.infer<typeof sessionUpdateSchema>;
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
export type AnalyticsInput = z.infer<typeof analyticsSchema>;