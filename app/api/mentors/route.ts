import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb-alt";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can browse mentors
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const db = await getDatabase();
    
    // Get all users with role "mentor" who have completed onboarding
    const mentors = await db.collection("users").find({
      role: "mentor",
      onboardingCompleted: true
    }).toArray();

    // Transform mentor data for frontend
    const formattedMentors = mentors.map(mentor => ({
      id: mentor._id.toString(),
      name: mentor.name,
      email: mentor.email,
      location: mentor.onboardingData?.company || "Remote",
      subjects: mentor.onboardingData?.expertiseAreas || [],
      bio: mentor.onboardingData?.bio || "Experienced mentor ready to help you succeed.",
      duration: mentor.onboardingData?.preferredSessionLength 
        ? `${mentor.onboardingData.preferredSessionLength} minutes`
        : "1 hour",
      languages: ["English"], // Default for now
      rating: 4.5 + Math.random() * 0.5, // Mock rating
      totalSessions: Math.floor(Math.random() * 200) + 50, // Mock sessions
      avatarColor: {
        from: getRandomColor(),
        to: getRandomColor()
      },
      company: mentor.onboardingData?.company,
      role: mentor.onboardingData?.currentRole,
      experience: mentor.onboardingData?.experienceLevel,
      availability: mentor.onboardingData?.availabilityHours 
        ? [`${mentor.onboardingData.availabilityHours} hours/week`]
        : ["Flexible"],
      specializations: mentor.onboardingData?.specializations,
      achievements: mentor.onboardingData?.achievements,
      mentoringApproaches: mentor.onboardingData?.mentoringApproaches || []
    }));

    return NextResponse.json({ 
      success: true, 
      mentors: formattedMentors 
    });

  } catch (error) {
    console.error("Error fetching mentors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getRandomColor(): string {
  const colors = [
    "#3b82f6", "#1d4ed8", // Blues
    "#f97316", "#ea580c", // Oranges
    "#ec4899", "#db2777", // Pinks
    "#10b981", "#059669", // Greens
    "#8b5cf6", "#7c3aed", // Purples
    "#ef4444", "#dc2626", // Reds
    "#06b6d4", "#0891b2", // Cyans
    "#84cc16", "#65a30d"  // Limes
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}