import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import RecommendationService from "@/lib/recommendation-service";

// GET - Get popular subjects for recommendations
async function getPopularSubjectsHandler(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    if (limit < 1 || limit > 50) {
      return NextResponse.json({ 
        error: "Limit must be between 1 and 50" 
      }, { status: 400 });
    }

    const popularSubjects = await RecommendationService.getPopularSubjects(limit);

    return NextResponse.json({
      success: true,
      subjects: popularSubjects,
      count: popularSubjects.length
    });

  } catch (error) {
    console.error("Error getting popular subjects:", error);
    return NextResponse.json({ 
      error: "Failed to get popular subjects" 
    }, { status: 500 });
  }
}

export const GET = withAuth(getPopularSubjectsHandler);