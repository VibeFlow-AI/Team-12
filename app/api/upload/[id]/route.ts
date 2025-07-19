import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import FileUploadService from "@/lib/file-upload";
import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/models";

// DELETE - Delete a file
async function deleteFileHandler(
  request: NextRequest, 
  user: any
): Promise<NextResponse> {
  try {
    // Extract file ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const fileId = pathSegments[pathSegments.length - 1];

    if (!ObjectId.isValid(fileId)) {
      return NextResponse.json({ 
        error: "Invalid file ID" 
      }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Find the file record
    const file = await db.collection(COLLECTIONS.FILES || 'files').findOne({
      _id: new ObjectId(fileId),
      userId: new ObjectId(user.id)
    });

    if (!file) {
      return NextResponse.json({ 
        error: "File not found" 
      }, { status: 404 });
    }

    // Delete from Cloudinary
    const deleted = await FileUploadService.deleteFile(
      file.publicId, 
      file.category === 'document' ? 'raw' : 'image'
    );

    if (!deleted) {
      console.warn(`Failed to delete file from Cloudinary: ${file.publicId}`);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    await db.collection(COLLECTIONS.FILES || 'files').deleteOne({
      _id: new ObjectId(fileId)
    });

    // If it was an avatar, clear the user's avatar field
    if (file.category === 'avatar') {
      await db.collection(COLLECTIONS.USERS).updateOne(
        { _id: new ObjectId(user.id) },
        { 
          $unset: { avatar: "" },
          $set: { updatedAt: new Date() }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully"
    });

  } catch (error) {
    console.error("File deletion error:", error);
    return NextResponse.json({ 
      error: "Failed to delete file" 
    }, { status: 500 });
  }
}

// GET - Get file details
async function getFileHandler(
  request: NextRequest, 
  user: any
): Promise<NextResponse> {
  try {
    // Extract file ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const fileId = pathSegments[pathSegments.length - 1];

    if (!ObjectId.isValid(fileId)) {
      return NextResponse.json({ 
        error: "Invalid file ID" 
      }, { status: 400 });
    }

    const db = await getDatabase();
    
    const file = await db.collection(COLLECTIONS.FILES || 'files').findOne({
      _id: new ObjectId(fileId),
      userId: new ObjectId(user.id)
    });

    if (!file) {
      return NextResponse.json({ 
        error: "File not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      file: {
        ...file,
        id: file._id.toString(),
        _id: undefined
      }
    });

  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json({ 
      error: "Failed to fetch file" 
    }, { status: 500 });
  }
}

export const GET = withAuth(getFileHandler);
export const DELETE = withAuth(deleteFileHandler);