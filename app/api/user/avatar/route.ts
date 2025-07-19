import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/models";

// DELETE - Remove user avatar
async function removeAvatarHandler(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    const db = await getDatabase();
    
    // Update user to remove avatar
    const result = await db.collection(COLLECTIONS.USERS).updateOne(
      { _id: new ObjectId(user.id) },
      { 
        $unset: { avatar: "" },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Avatar removed successfully"
    });

  } catch (error) {
    console.error("Error removing avatar:", error);
    return NextResponse.json({ 
      error: "Failed to remove avatar" 
    }, { status: 500 });
  }
}

// GET - Get user avatar info
async function getAvatarHandler(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    const db = await getDatabase();
    
    const userData = await db.collection(COLLECTIONS.USERS).findOne(
      { _id: new ObjectId(user.id) },
      { projection: { avatar: 1, name: 1 } }
    );

    if (!userData) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      avatar: userData.avatar || null,
      name: userData.name || "User"
    });

  } catch (error) {
    console.error("Error fetching avatar:", error);
    return NextResponse.json({ 
      error: "Failed to fetch avatar" 
    }, { status: 500 });
  }
}

export const GET = withAuth(getAvatarHandler);
export const DELETE = withAuth(removeAvatarHandler);