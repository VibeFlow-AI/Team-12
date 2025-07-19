import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";
import { reviewSchema } from "@/lib/validation";
import { COLLECTIONS } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can create reviews
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input using Zod schema
    const validationResult = reviewSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { sessionId, rating, comment, wouldRecommend, skills } = validationResult.data;

    const db = await getDatabase();
    
    // Verify the session exists and belongs to the student
    const sessionRecord = await db.collection(COLLECTIONS.SESSIONS).findOne({
      _id: new ObjectId(sessionId),
      studentId: new ObjectId(session.user.id),
      status: "completed" // Only completed sessions can be reviewed
    });

    if (!sessionRecord) {
      return NextResponse.json({ 
        error: "Session not found, not completed, or access denied" 
      }, { status: 404 });
    }

    // Check if a review already exists for this session
    const existingReview = await db.collection(COLLECTIONS.REVIEWS).findOne({
      sessionId: new ObjectId(sessionId),
      studentId: new ObjectId(session.user.id)
    });

    if (existingReview) {
      return NextResponse.json({ 
        error: "Review already exists for this session" 
      }, { status: 409 });
    }

    // Create the review
    const reviewData = {
      sessionId: new ObjectId(sessionId),
      studentId: new ObjectId(session.user.id),
      mentorId: new ObjectId(sessionRecord.mentorId),
      rating: rating,
      comment: comment,
      wouldRecommend: wouldRecommend,
      skills: skills || [],
      isPublic: true, // Default to public, can be changed later
      isApproved: true, // Auto-approve for now, can implement moderation later
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection(COLLECTIONS.REVIEWS).insertOne(reviewData);

    if (!result.insertedId) {
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }

    // Update mentor's average rating and review count
    await updateMentorRatingStats(db, new ObjectId(sessionRecord.mentorId));

    // Create notification for mentor
    await db.collection(COLLECTIONS.NOTIFICATIONS).insertOne({
      userId: new ObjectId(sessionRecord.mentorId),
      type: "review",
      title: "New Review Received",
      message: `${session.user.name} left a ${rating}-star review for your ${sessionRecord.subject} session.`,
      data: {
        reviewId: result.insertedId.toString(),
        sessionId: sessionId,
        rating: rating,
        studentName: session.user.name
      },
      isRead: false,
      channels: ["email", "push"],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      reviewId: result.insertedId.toString(),
      message: "Review submitted successfully"
    });

  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get('mentorId');
    const studentId = searchParams.get('studentId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const db = await getDatabase();
    
    // Build query based on parameters
    const query: any = {
      isPublic: true,
      isApproved: true
    };

    if (mentorId) {
      query.mentorId = new ObjectId(mentorId);
    }

    if (studentId) {
      // Only allow users to see their own reviews or public reviews
      if (session.user.id !== studentId && session.user.role !== "admin") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      query.studentId = new ObjectId(studentId);
    }

    if (sessionId) {
      query.sessionId = new ObjectId(sessionId);
      // Only allow student or mentor of the session to see reviews
      const sessionRecord = await db.collection(COLLECTIONS.SESSIONS).findOne({
        _id: new ObjectId(sessionId),
        $or: [
          { studentId: new ObjectId(session.user.id) },
          { mentorId: new ObjectId(session.user.id) }
        ]
      });

      if (!sessionRecord) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get reviews with user information
    const reviews = await db.collection(COLLECTIONS.REVIEWS)
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: COLLECTIONS.USERS,
            localField: "studentId",
            foreignField: "_id",
            as: "student"
          }
        },
        {
          $lookup: {
            from: COLLECTIONS.USERS,
            localField: "mentorId",
            foreignField: "_id",
            as: "mentor"
          }
        },
        {
          $lookup: {
            from: COLLECTIONS.SESSIONS,
            localField: "sessionId",
            foreignField: "_id",
            as: "session"
          }
        },
        { $unwind: "$student" },
        { $unwind: "$mentor" },
        { $unwind: "$session" },
        {
          $project: {
            _id: 1,
            rating: 1,
            comment: 1,
            wouldRecommend: 1,
            skills: 1,
            mentorResponse: 1,
            mentorResponseDate: 1,
            createdAt: 1,
            updatedAt: 1,
            student: {
              name: "$student.name",
              avatar: "$student.avatar"
            },
            mentor: {
              name: "$mentor.name",
              avatar: "$mentor.avatar"
            },
            session: {
              subject: "$session.subject",
              duration: "$session.duration",
              sessionDate: "$session.sessionDate"
            }
          }
        },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: limit }
      ]).toArray();

    // Get total count for pagination
    const totalCount = await db.collection(COLLECTIONS.REVIEWS).countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      reviews: reviews.map(review => ({
        ...review,
        id: review._id.toString(),
        _id: undefined
      })),
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper function to update mentor rating statistics
async function updateMentorRatingStats(db: any, mentorId: ObjectId) {
  try {
    // Calculate new average rating and total reviews
    const reviews = await db.collection(COLLECTIONS.REVIEWS)
      .find({ 
        mentorId: mentorId, 
        isApproved: true 
      })
      .toArray();

    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    const totalReviews = reviews.length;

    // Update mentor profile
    await db.collection(COLLECTIONS.MENTOR_PROFILES).updateOne(
      { userId: mentorId },
      { 
        $set: {
          averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
          totalReviews: totalReviews,
          updatedAt: new Date()
        }
      }
    );

  } catch (error) {
    console.error("Error updating mentor rating stats:", error);
  }
}