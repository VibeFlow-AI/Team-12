import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/models";

// GET single review
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract review ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const reviewId = pathSegments[pathSegments.length - 1];

    if (!ObjectId.isValid(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Get review with related information
    const review = await db.collection(COLLECTIONS.REVIEWS)
      .aggregate([
        { $match: { _id: new ObjectId(reviewId) } },
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
            isPublic: 1,
            isApproved: 1,
            createdAt: 1,
            updatedAt: 1,
            student: {
              _id: "$student._id",
              name: "$student.name",
              avatar: "$student.avatar"
            },
            mentor: {
              _id: "$mentor._id",
              name: "$mentor.name",
              avatar: "$mentor.avatar"
            },
            session: {
              _id: "$session._id",
              subject: "$session.subject",
              duration: "$session.duration",
              sessionDate: "$session.sessionDate"
            }
          }
        }
      ]).toArray();

    if (review.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const reviewData = review[0];

    // Check access permissions
    const canAccess = 
      reviewData.isPublic || 
      session.user.id === reviewData.student._id.toString() ||
      session.user.id === reviewData.mentor._id.toString() ||
      session.user.role === "admin";

    if (!canAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      review: {
        ...reviewData,
        id: reviewData._id.toString(),
        _id: undefined
      }
    });

  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update review (for mentor responses or review edits)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract review ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const reviewId = pathSegments[pathSegments.length - 1];

    if (!ObjectId.isValid(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    const body = await request.json();
    const { mentorResponse, rating, comment, wouldRecommend, skills, isPublic } = body;

    const db = await getDatabase();
    
    // Get the review first
    const review = await db.collection(COLLECTIONS.REVIEWS).findOne({
      _id: new ObjectId(reviewId)
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    // Check permissions based on user role
    if (session.user.id === review.mentorId.toString()) {
      // Mentor can only add/update their response
      if (mentorResponse !== undefined) {
        updateData.mentorResponse = mentorResponse;
        updateData.mentorResponseDate = new Date();
      }
    } else if (session.user.id === review.studentId.toString()) {
      // Student can update their own review (within reasonable time limit)
      const daysSinceReview = (new Date().getTime() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceReview > 7) {
        return NextResponse.json({ 
          error: "Reviews can only be edited within 7 days of creation" 
        }, { status: 403 });
      }

      // Student can update review content
      if (rating !== undefined) updateData.rating = rating;
      if (comment !== undefined) updateData.comment = comment;
      if (wouldRecommend !== undefined) updateData.wouldRecommend = wouldRecommend;
      if (skills !== undefined) updateData.skills = skills;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
    } else if (session.user.role === "admin") {
      // Admin can update anything
      if (mentorResponse !== undefined) {
        updateData.mentorResponse = mentorResponse;
        updateData.mentorResponseDate = new Date();
      }
      if (rating !== undefined) updateData.rating = rating;
      if (comment !== undefined) updateData.comment = comment;
      if (wouldRecommend !== undefined) updateData.wouldRecommend = wouldRecommend;
      if (skills !== undefined) updateData.skills = skills;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
    } else {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Validate rating if provided
    if (updateData.rating !== undefined && (updateData.rating < 1 || updateData.rating > 5)) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const result = await db.collection(COLLECTIONS.REVIEWS).updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }

    // If rating was updated, recalculate mentor stats
    if (updateData.rating !== undefined) {
      await updateMentorRatingStats(db, review.mentorId);
    }

    // Create notification if mentor responded
    if (updateData.mentorResponse && session.user.id === review.mentorId.toString()) {
      await db.collection(COLLECTIONS.NOTIFICATIONS).insertOne({
        userId: review.studentId,
        type: "review",
        title: "Mentor Responded to Your Review",
        message: `${session.user.name} responded to your review.`,
        data: {
          reviewId: reviewId,
          mentorName: session.user.name
        },
        isRead: false,
        channels: ["email", "push"],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      message: "Review updated successfully"
    });

  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE review
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract review ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const reviewId = pathSegments[pathSegments.length - 1];

    if (!ObjectId.isValid(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Get the review first
    const review = await db.collection(COLLECTIONS.REVIEWS).findOne({
      _id: new ObjectId(reviewId)
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check permissions
    const canDelete = 
      session.user.id === review.studentId.toString() ||
      session.user.role === "admin";

    if (!canDelete) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Students can only delete within 24 hours
    if (session.user.id === review.studentId.toString() && session.user.role !== "admin") {
      const hoursSinceReview = (new Date().getTime() - review.createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceReview > 24) {
        return NextResponse.json({ 
          error: "Reviews can only be deleted within 24 hours of creation" 
        }, { status: 403 });
      }
    }

    const result = await db.collection(COLLECTIONS.REVIEWS).deleteOne({
      _id: new ObjectId(reviewId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }

    // Recalculate mentor rating stats
    await updateMentorRatingStats(db, review.mentorId);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper function to update mentor rating statistics
async function updateMentorRatingStats(db: any, mentorId: ObjectId) {
  try {
    const reviews = await db.collection(COLLECTIONS.REVIEWS)
      .find({ 
        mentorId: mentorId, 
        isApproved: true 
      })
      .toArray();

    if (reviews.length === 0) {
      // No reviews left, reset stats
      await db.collection(COLLECTIONS.MENTOR_PROFILES).updateOne(
        { userId: mentorId },
        { 
          $set: {
            averageRating: 0,
            totalReviews: 0,
            updatedAt: new Date()
          }
        }
      );
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    const totalReviews = reviews.length;

    await db.collection(COLLECTIONS.MENTOR_PROFILES).updateOne(
      { userId: mentorId },
      { 
        $set: {
          averageRating: Math.round(averageRating * 100) / 100,
          totalReviews: totalReviews,
          updatedAt: new Date()
        }
      }
    );

  } catch (error) {
    console.error("Error updating mentor rating stats:", error);
  }
}