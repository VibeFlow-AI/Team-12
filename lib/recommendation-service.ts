import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/models";
import OpenAI from "openai";

export interface RecommendationFilters {
  subjects?: string[];
  experienceLevel?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: string[];
  rating?: number;
  location?: string;
  language?: string[];
}

export interface MentorRecommendation {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  subjects: string[];
  experienceLevel: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  location?: string;
  languages: string[];
  totalSessions: number;
  responseTime: string;
  matchScore: number;
  matchReasons: string[];
}

class RecommendationService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Get AI-powered mentor recommendations for a student
  static async getRecommendations(
    studentId: string,
    filters?: RecommendationFilters,
    limit: number = 10
  ): Promise<{
    success: boolean;
    recommendations?: MentorRecommendation[];
    error?: string;
  }> {
    try {
      const db = await getDatabase();

      // Get student profile for recommendation matching
      const student = await db.collection(COLLECTIONS.USERS).findOne({
        _id: new ObjectId(studentId),
        role: "student"
      });

      if (!student) {
        return {
          success: false,
          error: "Student not found"
        };
      }

      // Build mentor query
      const mentorQuery: any = {
        role: "mentor",
        isActive: true,
        "profile.isAvailable": true
      };

      // Apply filters
      if (filters?.subjects && filters.subjects.length > 0) {
        mentorQuery["profile.subjects"] = { $in: filters.subjects };
      }

      if (filters?.experienceLevel) {
        mentorQuery["profile.experienceLevel"] = filters.experienceLevel;
      }

      if (filters?.priceRange) {
        mentorQuery["profile.hourlyRate"] = {
          $gte: filters.priceRange.min,
          $lte: filters.priceRange.max
        };
      }

      if (filters?.rating) {
        mentorQuery["profile.rating"] = { $gte: filters.rating };
      }

      if (filters?.location) {
        mentorQuery["profile.location"] = { $regex: filters.location, $options: "i" };
      }

      if (filters?.language && filters.language.length > 0) {
        mentorQuery["profile.languages"] = { $in: filters.language };
      }

      // Fetch mentors
      const mentors = await db.collection(COLLECTIONS.USERS)
        .find(mentorQuery)
        .limit(limit * 2) // Fetch more to allow for scoring and filtering
        .toArray();

      // Calculate match scores for each mentor
      const recommendations: MentorRecommendation[] = [];

      for (const mentor of mentors) {
        const matchResult = this.calculateMatchScore(student, mentor);
        
        if (matchResult.score > 0) {
          // Get mentor stats
          const stats = await this.getMentorStats(mentor._id.toString());
          
          recommendations.push({
            _id: mentor._id.toString(),
            name: mentor.name,
            email: mentor.email,
            avatar: mentor.avatar,
            bio: mentor.profile?.bio,
            subjects: mentor.profile?.subjects || [],
            experienceLevel: mentor.profile?.experienceLevel || "Beginner",
            hourlyRate: mentor.profile?.hourlyRate || 0,
            rating: mentor.profile?.rating || 0,
            totalReviews: stats.totalReviews,
            availability: mentor.profile?.availability || [],
            location: mentor.profile?.location,
            languages: mentor.profile?.languages || ["English"],
            totalSessions: stats.totalSessions,
            responseTime: stats.averageResponseTime,
            matchScore: matchResult.score,
            matchReasons: matchResult.reasons
          });
        }
      }

      // Use AI to enhance and rerank recommendations based on student onboarding details
      const aiEnhancedRecommendations = await this.enhanceRecommendationsWithAI(student, recommendations);

      // Sort by enhanced match score (highest first)
      aiEnhancedRecommendations.sort((a, b) => b.matchScore - a.matchScore);

      return {
        success: true,
        recommendations: aiEnhancedRecommendations.slice(0, limit)
      };

    } catch (error) {
      console.error("Error getting recommendations:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get recommendations"
      };
    }
  }

  // Enhance recommendations using OpenAI based on student onboarding details
  private static async enhanceRecommendationsWithAI(
    student: any,
    recommendations: MentorRecommendation[]
  ): Promise<MentorRecommendation[]> {
    try {
      if (!process.env.OPENAI_API_KEY || recommendations.length === 0) {
        return recommendations;
      }

      // Prepare student context for AI analysis
      const studentContext = {
        academicLevel: student.profile?.academicLevel || "Not specified",
        fieldOfStudy: student.profile?.fieldOfStudy || "Not specified",
        learningGoals: student.profile?.learningGoals || [],
        primarySubjects: student.profile?.primarySubjects || [],
        skillLevel: student.profile?.skillLevel || "beginner",
        mentorshipStyle: student.profile?.mentorshipStyle || "flexible",
        sessionFrequency: student.profile?.sessionFrequency || "as_needed",
        preferredSessionDuration: student.profile?.preferredSessionDuration || "1hour",
        favoriteSubjects: student.profile?.favoriteSubjects || []
      };

      // Create mentor summaries for AI analysis
      const mentorSummaries = recommendations.map(mentor => ({
        id: mentor._id,
        name: mentor.name,
        subjects: mentor.subjects,
        experienceLevel: mentor.experienceLevel,
        bio: mentor.bio,
        rating: mentor.rating,
        totalSessions: mentor.totalSessions,
        currentMatchScore: mentor.matchScore,
        matchReasons: mentor.matchReasons
      }));

      const prompt = `You are an expert educational matchmaking AI. Analyze the student's onboarding details and rerank mentors based on optimal learning fit.

Student Profile:
- Academic Level: ${studentContext.academicLevel}
- Field of Study: ${studentContext.fieldOfStudy}
- Learning Goals: ${studentContext.learningGoals.join(", ")}
- Primary Subjects: ${studentContext.primarySubjects.join(", ")}
- Skill Level: ${studentContext.skillLevel}
- Preferred Mentorship Style: ${studentContext.mentorshipStyle}
- Session Frequency: ${studentContext.sessionFrequency}
- Preferred Duration: ${studentContext.preferredSessionDuration}
- Favorite Subjects: ${studentContext.favoriteSubjects.join(", ")}

Available Mentors:
${JSON.stringify(mentorSummaries, null, 2)}

Instructions:
1. Analyze each mentor's suitability based on the student's specific learning goals and preferences
2. Consider subject alignment, teaching style compatibility, and experience level appropriateness
3. Provide enhanced match scores (0-100) and detailed reasons for each mentor
4. Prioritize mentors who can best support the student's academic level and career goals
5. Return ONLY a JSON array with enhanced recommendations

Format:
[
  {
    "mentorId": "mentor_id",
    "enhancedMatchScore": 85,
    "aiMatchReasons": ["Specific reason 1", "Specific reason 2", "Specific reason 3"]
  }
]`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert educational matchmaking AI that helps match students with the most suitable mentors based on their learning profile and goals."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        return recommendations;
      }

      // Parse AI response
      const aiEnhancements = JSON.parse(aiResponse);
      
      // Apply AI enhancements to recommendations
      const enhancedRecommendations = recommendations.map(recommendation => {
        const aiEnhancement = aiEnhancements.find((ai: any) => ai.mentorId === recommendation._id);
        
        if (aiEnhancement) {
          return {
            ...recommendation,
            matchScore: aiEnhancement.enhancedMatchScore,
            matchReasons: [
              ...recommendation.matchReasons,
              ...aiEnhancement.aiMatchReasons
            ].slice(0, 5) // Limit to top 5 reasons
          };
        }
        
        return recommendation;
      });

      return enhancedRecommendations;

    } catch (error) {
      console.error("Error enhancing recommendations with AI:", error);
      // Return original recommendations if AI enhancement fails
      return recommendations;
    }
  }

  // Calculate match score between student and mentor
  private static calculateMatchScore(
    student: any, 
    mentor: any
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const maxScore = 100;

    // Subject match (30 points max)
    const studentSubjects = student.profile?.interestedSubjects || [];
    const mentorSubjects = mentor.profile?.subjects || [];
    const subjectMatches = studentSubjects.filter((subject: string) => 
      mentorSubjects.includes(subject)
    );
    
    if (subjectMatches.length > 0) {
      const subjectScore = Math.min(30, (subjectMatches.length / studentSubjects.length) * 30);
      score += subjectScore;
      reasons.push(`Teaches ${subjectMatches.length} of your interested subjects`);
    }

    // Experience level match (20 points max)
    const studentLevel = student.profile?.currentLevel || "Beginner";
    const mentorExperience = mentor.profile?.experienceLevel || "Beginner";
    
    if (this.isExperienceLevelMatch(studentLevel, mentorExperience)) {
      score += 20;
      reasons.push(`Experience level matches your current level`);
    }

    // Price preference match (15 points max)
    const studentBudget = student.profile?.budgetRange;
    const mentorRate = mentor.profile?.hourlyRate || 0;
    
    if (studentBudget && mentorRate >= studentBudget.min && mentorRate <= studentBudget.max) {
      score += 15;
      reasons.push(`Within your budget range`);
    }

    // Language match (10 points max)
    const studentLanguages = student.profile?.preferredLanguages || ["English"];
    const mentorLanguages = mentor.profile?.languages || ["English"];
    const languageMatches = studentLanguages.some((lang: string) => 
      mentorLanguages.includes(lang)
    );
    
    if (languageMatches) {
      score += 10;
      reasons.push(`Speaks your preferred language`);
    }

    // Rating bonus (10 points max)
    const mentorRating = mentor.profile?.rating || 0;
    if (mentorRating >= 4.5) {
      score += 10;
      reasons.push(`Highly rated mentor (${mentorRating.toFixed(1)} stars)`);
    } else if (mentorRating >= 4.0) {
      score += 7;
      reasons.push(`Well-rated mentor (${mentorRating.toFixed(1)} stars)`);
    }

    // Availability match (10 points max)
    const studentAvailability = student.profile?.preferredTimes || [];
    const mentorAvailability = mentor.profile?.availability || [];
    
    if (this.hasAvailabilityOverlap(studentAvailability, mentorAvailability)) {
      score += 10;
      reasons.push(`Available during your preferred times`);
    }

    // Location match (5 points max)
    const studentLocation = student.profile?.location;
    const mentorLocation = mentor.profile?.location;
    
    if (studentLocation && mentorLocation && 
        studentLocation.toLowerCase().includes(mentorLocation.toLowerCase())) {
      score += 5;
      reasons.push(`Located in your area`);
    }

    return {
      score: Math.min(score, maxScore),
      reasons
    };
  }

  // Check if experience levels are compatible
  private static isExperienceLevelMatch(studentLevel: string, mentorExperience: string): boolean {
    const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
    const studentLevelIndex = levels.indexOf(studentLevel);
    const mentorLevelIndex = levels.indexOf(mentorExperience);
    
    // Mentor should be at least same level or higher
    return mentorLevelIndex >= studentLevelIndex;
  }

  // Check if there's availability overlap
  private static hasAvailabilityOverlap(studentTimes: any[], mentorTimes: any[]): boolean {
    // Simplified check - you can implement more complex logic
    if (!studentTimes || !mentorTimes || studentTimes.length === 0 || mentorTimes.length === 0) {
      return false;
    }

    return studentTimes.some((studentTime: any) =>
      mentorTimes.some((mentorTime: any) =>
        studentTime.day === mentorTime.day &&
        this.timeOverlap(studentTime, mentorTime)
      )
    );
  }

  // Check if two time ranges overlap
  private static timeOverlap(time1: any, time2: any): boolean {
    const start1 = this.timeToMinutes(time1.startTime);
    const end1 = this.timeToMinutes(time1.endTime);
    const start2 = this.timeToMinutes(time2.startTime);
    const end2 = this.timeToMinutes(time2.endTime);

    return start1 < end2 && start2 < end1;
  }

  // Convert time string to minutes for comparison
  private static timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Get mentor statistics
  private static async getMentorStats(mentorId: string): Promise<{
    totalSessions: number;
    totalReviews: number;
    averageResponseTime: string;
  }> {
    try {
      const db = await getDatabase();

      // Get session count
      const sessionCount = await db.collection(COLLECTIONS.SESSIONS || 'sessions').countDocuments({
        mentorId: new ObjectId(mentorId),
        status: "completed"
      });

      // Get review count
      const reviewCount = await db.collection(COLLECTIONS.REVIEWS || 'reviews').countDocuments({
        mentorId: new ObjectId(mentorId)
      });

      // Calculate average response time (simplified)
      const responseTime = sessionCount > 10 ? "Within 2 hours" : 
                          sessionCount > 5 ? "Within 4 hours" : 
                          "Within 24 hours";

      return {
        totalSessions: sessionCount,
        totalReviews: reviewCount,
        averageResponseTime: responseTime
      };
    } catch (error) {
      console.error("Error getting mentor stats:", error);
      return {
        totalSessions: 0,
        totalReviews: 0,
        averageResponseTime: "Unknown"
      };
    }
  }

  // Get popular subjects for recommendations
  static async getPopularSubjects(limit: number = 10): Promise<string[]> {
    try {
      const db = await getDatabase();

      const pipeline = [
        { $match: { role: "mentor", isActive: true } },
        { $unwind: "$profile.subjects" },
        { $group: { _id: "$profile.subjects", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 1 } }
      ];

      const result = await db.collection(COLLECTIONS.USERS).aggregate(pipeline).toArray();
      return result.map(item => item._id);
    } catch (error) {
      console.error("Error getting popular subjects:", error);
      return [];
    }
  }

  // Get mentor availability for a specific mentor
  static async getMentorAvailability(mentorId: string): Promise<{
    success: boolean;
    availability?: any[];
    error?: string;
  }> {
    try {
      const db = await getDatabase();

      const mentor = await db.collection(COLLECTIONS.USERS).findOne({
        _id: new ObjectId(mentorId),
        role: "mentor"
      }, {
        projection: { "profile.availability": 1 }
      });

      if (!mentor) {
        return {
          success: false,
          error: "Mentor not found"
        };
      }

      return {
        success: true,
        availability: mentor.profile?.availability || []
      };
    } catch (error) {
      console.error("Error getting mentor availability:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get availability"
      };
    }
  }
}

export default RecommendationService;