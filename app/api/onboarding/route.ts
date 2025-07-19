import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { onboardingData } = body;

    const db = await getDatabase();
    
    // Update user's onboarding status and data
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        $set: { 
          onboardingCompleted: true,
          onboardingData: onboardingData,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Onboarding completed successfully" 
    });

  } catch (error) {
    console.error("Onboarding completion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}