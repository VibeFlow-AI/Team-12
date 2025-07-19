import { ObjectId } from "mongodb";

// Base User Interface
export interface BaseUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: "student" | "mentor";
  onboardingCompleted: boolean;
  emailVerified: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLoginAt?: Date;
  timezone: string;
  language: string;
  notificationPreferences: NotificationPreferences;
}

// Notification Preferences
export interface NotificationPreferences {
  email: {
    bookingUpdates: boolean;
    sessionReminders: boolean;
    messages: boolean;
    promotions: boolean;
  };
  sms: {
    sessionReminders: boolean;
    emergencyUpdates: boolean;
  };
  push: {
    messages: boolean;
    sessionReminders: boolean;
    bookingUpdates: boolean;
  };
}

// Student Profile
export interface StudentProfile {
  _id?: ObjectId;
  userId: ObjectId;
  
  // Academic Information
  institution: string;
  fieldOfStudy: string;
  academicLevel: "high_school" | "undergraduate" | "graduate" | "postgraduate" | "other";
  graduationYear: number;
  
  // Learning Goals
  learningGoals: string[];
  primarySubjects: string[];
  skillLevel: "beginner" | "intermediate" | "advanced";
  
  // Mentorship Preferences
  mentorshipStyle: "structured" | "flexible" | "project_based";
  sessionFrequency: "weekly" | "biweekly" | "monthly" | "as_needed";
  preferredSessionDuration: "30min" | "1hour" | "1.5hours" | "2hours";
  
  // Additional Information
  bio?: string;
  availability: string[];
  
  // Progress Tracking
  completedSessions: number;
  totalSpent: number;
  favoriteSubjects: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Mentor Profile
export interface MentorProfile {
  _id?: ObjectId;
  userId: ObjectId;
  
  // Professional Information
  jobTitle: string;
  company: string;
  experience: number; // years
  
  // Education
  education: Education[];
  
  // Expertise
  expertise: string[];
  skills: string[];
  certifications?: string[];
  
  // Mentoring Information
  mentoringExperience: number; // years
  mentorshipStyle: "structured" | "flexible" | "project_based";
  maxStudents: number;
  sessionTypes: ("one_on_one" | "group" | "workshop")[];
  
  // Availability and Pricing
  hourlyRate: number;
  availability: string[];
  
  // Additional Information
  bio: string;
  languages: string[];
  
  // Performance Metrics
  totalSessions: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  responseTime: number; // hours
  completionRate: number; // percentage
  
  // Verification Status
  isVerified: boolean;
  verificationDate?: Date;
  verificationDocuments?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Education Interface
export interface Education {
  degree: string;
  institution: string;
  year: number;
  description?: string;
}

// Session/Booking Interface
export interface Session {
  _id?: ObjectId;
  studentId: ObjectId;
  mentorId: ObjectId;
  
  // Session Details
  sessionDate: Date;
  sessionTime: string;
  duration: "30min" | "1hour" | "1.5hours" | "2hours";
  subject: string;
  sessionType: "one_on_one" | "group";
  
  // Communication
  message?: string;
  notes?: string;
  
  // Status and Payment
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  paymentStatus: "pending_verification" | "verified" | "rejected" | "refunded";
  bankSlipUrl?: string;
  amount: number;
  
  // Meeting Information
  meetingLink?: string;
  meetingId?: string;
  recordingUrl?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  
  // Reschedule Information
  originalDate?: Date;
  originalTime?: string;
  rescheduleReason?: string;
}

// Review Interface
export interface Review {
  _id?: ObjectId;
  sessionId: ObjectId;
  studentId: ObjectId;
  mentorId: ObjectId;
  
  // Review Details
  rating: number; // 1-5
  comment: string;
  wouldRecommend: boolean;
  skills?: string[];
  
  // Mentor Response
  mentorResponse?: string;
  mentorResponseDate?: Date;
  
  // Visibility
  isPublic: boolean;
  isApproved: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Payment Interface
export interface Payment {
  _id?: ObjectId;
  sessionId: ObjectId;
  studentId: ObjectId;
  mentorId: ObjectId;
  
  // Payment Details
  amount: number;
  currency: string;
  paymentMethod: "card" | "bank_transfer" | "digital_wallet";
  
  // Status
  status: "pending" | "completed" | "failed" | "refunded";
  
  // External References
  stripePaymentIntentId?: string;
  bankSlipUrl?: string;
  transactionId?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  refundedAt?: Date;
  
  // Additional Information
  description?: string;
  metadata?: Record<string, any>;
}

// Message Interface
export interface Message {
  _id?: ObjectId;
  sessionId?: ObjectId;
  senderId: ObjectId;
  receiverId: ObjectId;
  
  // Message Content
  content: string;
  type: "text" | "image" | "file" | "system";
  attachments?: Attachment[];
  
  // Status
  isRead: boolean;
  readAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Attachment Interface
export interface Attachment {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

// Notification Interface
export interface Notification {
  _id?: ObjectId;
  userId: ObjectId;
  
  // Notification Details
  type: "booking" | "payment" | "session" | "review" | "system" | "promotion";
  title: string;
  message: string;
  data?: Record<string, any>;
  
  // Status
  isRead: boolean;
  readAt?: Date;
  
  // Delivery
  channels: ("email" | "sms" | "push")[];
  emailSent?: boolean;
  smsSent?: boolean;
  pushSent?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Interface
export interface Analytics {
  _id?: ObjectId;
  userId: ObjectId;
  userRole: "student" | "mentor";
  
  // Time Period
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: Date;
  endDate: Date;
  
  // Metrics
  metrics: {
    sessions?: {
      total: number;
      completed: number;
      cancelled: number;
      noShow: number;
    };
    revenue?: {
      total: number;
      average: number;
      currency: string;
    };
    ratings?: {
      average: number;
      total: number;
      distribution: Record<string, number>;
    };
    students?: {
      total: number;
      new: number;
      returning: number;
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Availability Interface
export interface Availability {
  _id?: ObjectId;
  mentorId: ObjectId;
  
  // Schedule
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  
  // Exceptions
  exceptions: AvailabilityException[];
  
  // Timezone
  timezone: string;
  
  // Status
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Availability Exception Interface
export interface AvailabilityException {
  date: Date;
  type: "unavailable" | "custom_hours";
  startTime?: string;
  endTime?: string;
  reason?: string;
}

// Skill Interface
export interface Skill {
  _id?: ObjectId;
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Subject Interface
export interface Subject {
  _id?: ObjectId;
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
  prerequisites?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// System Configuration Interface
export interface SystemConfig {
  _id?: ObjectId;
  key: string;
  value: any;
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  category: string;
  isEditable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Database Collection Names
export const COLLECTIONS = {
  USERS: "users",
  STUDENT_PROFILES: "studentProfiles",
  MENTOR_PROFILES: "mentorProfiles",
  SESSIONS: "sessions",
  REVIEWS: "reviews",
  PAYMENTS: "payments",
  MESSAGES: "messages",
  NOTIFICATIONS: "notifications",
  ANALYTICS: "analytics",
  AVAILABILITY: "availability",
  SKILLS: "skills",
  SUBJECTS: "subjects",
  SYSTEM_CONFIG: "systemConfig",
  FILES: "files",
} as const;

// Database Indexes
export const DATABASE_INDEXES = {
  users: [
    { email: 1 },
    { role: 1 },
    { createdAt: -1 },
    { "email": 1, "role": 1 },
  ],
  sessions: [
    { studentId: 1 },
    { mentorId: 1 },
    { sessionDate: 1 },
    { status: 1 },
    { createdAt: -1 },
    { "mentorId": 1, "sessionDate": 1 },
  ],
  reviews: [
    { mentorId: 1 },
    { sessionId: 1 },
    { rating: -1 },
    { createdAt: -1 },
  ],
  payments: [
    { sessionId: 1 },
    { status: 1 },
    { createdAt: -1 },
  ],
  notifications: [
    { userId: 1 },
    { isRead: 1 },
    { createdAt: -1 },
  ],
} as const;