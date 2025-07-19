import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import RecommendationService, { RecommendationFilters } from "@/lib/recommendation-service";
import { z } from "zod";

// Validation schema for recommendation filters
const recommendationFiltersSchema = z.object({
  subjects: z.array(z.string()).optional(),
  experienceLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).optional(),
  availability: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  location: z.string().optional(),
  language: z.array(z.string()).optional(),
  limit: z.number().min(1).max(50).optional()
});

// GET - Get mentor recommendations for a student
async function getRecommendationsHandler(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    // Verify user is a student
    if (user.role !== "student") {
      return NextResponse.json({ 
        error: "Only students can get mentor recommendations" 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters: RecommendationFilters = {};
    const limit = parseInt(searchParams.get('limit') || '10');

    // Parse subjects
    const subjectsParam = searchParams.get('subjects');
    if (subjectsParam) {
      filters.subjects = subjectsParam.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Parse experience level
    const experienceLevel = searchParams.get('experienceLevel');
    if (experienceLevel) {
      filters.experienceLevel = experienceLevel;
    }

    // Parse price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice && maxPrice) {
      filters.priceRange = {
        min: parseFloat(minPrice),
        max: parseFloat(maxPrice)
      };
    }

    // Parse rating
    const rating = searchParams.get('rating');
    if (rating) {
      filters.rating = parseFloat(rating);
    }

    // Parse location
    const location = searchParams.get('location');
    if (location) {
      filters.location = location;
    }

    // Parse languages
    const languagesParam = searchParams.get('languages');
    if (languagesParam) {
      filters.language = languagesParam.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Validate filters
    const validation = recommendationFiltersSchema.safeParse({
      ...filters,
      limit
    });

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid filters", 
        details: validation.error.issues 
      }, { status: 400 });
    }

    // Get recommendations
    const result = await RecommendationService.getRecommendations(
      user.id,
      filters,
      limit
    );

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      recommendations: result.recommendations,
      filters: filters,
      count: result.recommendations?.length || 0
    });

  } catch (error) {
    console.error("Error getting recommendations:", error);
    return NextResponse.json({ 
      error: "Failed to get recommendations" 
    }, { status: 500 });
  }
}

// POST - Get recommendations with complex filters (body)
async function getRecommendationsWithFiltersHandler(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    // Verify user is a student
    if (user.role !== "student") {
      return NextResponse.json({ 
        error: "Only students can get mentor recommendations" 
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate request body
    const validation = recommendationFiltersSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid request body", 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const { limit = 10, ...filters } = validation.data;

    // Get recommendations
    const result = await RecommendationService.getRecommendations(
      user.id,
      filters as RecommendationFilters,
      limit
    );

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error 
      }, { status: 500 });
    }

    // Also get popular subjects for suggestions
    const popularSubjects = await RecommendationService.getPopularSubjects(10);

    return NextResponse.json({
      success: true,
      recommendations: result.recommendations,
      popularSubjects,
      filters: filters,
      count: result.recommendations?.length || 0,
      message: `Found ${result.recommendations?.length || 0} recommended mentors`
    });

  } catch (error) {
    console.error("Error getting recommendations:", error);
    return NextResponse.json({ 
      error: "Failed to get recommendations" 
    }, { status: 500 });
  }
}

export const GET = withAuth(getRecommendationsHandler);
export const POST = withAuth(getRecommendationsWithFiltersHandler);