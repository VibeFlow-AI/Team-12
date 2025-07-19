import { NextRequest, NextResponse } from "next/server";
import { withAuth, validateRequest } from "@/lib/auth-middleware";
import FileUploadService from "@/lib/file-upload";
import { getDatabase } from "@/lib/mongodb-alt";
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/models";
import { z } from "zod";

// Upload validation schema
const uploadSchema = z.object({
  category: z.enum(['avatar', 'document', 'certificate', 'bankSlip']),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

// POST - Upload file
async function uploadFileHandler(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];
    const metadata = formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : {};

    if (!file) {
      return NextResponse.json({ 
        error: "No file provided" 
      }, { status: 400 });
    }

    // Validate request data
    const validation = validateRequest({ category, tags, metadata }, uploadSchema);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.errors 
      }, { status: 400 });
    }

    // Validate file before upload
    const fileValidation = FileUploadService.validateFile(file, category as any);
    if (!fileValidation.valid) {
      return NextResponse.json({ 
        error: fileValidation.error 
      }, { status: 400 });
    }

    // Upload file to Cloudinary
    const uploadResult = await FileUploadService.uploadFile(
      file,
      category as any,
      user.id,
      { tags }
    );

    if (!uploadResult.success) {
      return NextResponse.json({ 
        error: uploadResult.error 
      }, { status: 500 });
    }

    // Save file record to database
    const db = await getDatabase();
    const fileRecord = {
      userId: new ObjectId(user.id),
      category: category,
      filename: file.name,
      originalName: file.name,
      url: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      format: uploadResult.format,
      size: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
      metadata: metadata,
      tags: tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection(COLLECTIONS.FILES || 'files').insertOne(fileRecord);

    // Update user avatar if uploading avatar
    if (category === 'avatar') {
      await db.collection(COLLECTIONS.USERS).updateOne(
        { _id: new ObjectId(user.id) },
        { 
          $set: { 
            avatar: uploadResult.secureUrl,
            updatedAt: new Date()
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      file: {
        id: result.insertedId.toString(),
        url: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
        filename: file.name,
        format: uploadResult.format,
        size: uploadResult.bytes,
        category: category
      },
      message: "File uploaded successfully"
    });

  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ 
      error: "Failed to upload file" 
    }, { status: 500 });
  }
}

// GET - Get user's uploaded files
async function getUserFilesHandler(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = await getDatabase();
    
    const query: any = { userId: new ObjectId(user.id) };
    if (category) {
      query.category = category;
    }

    const files = await db.collection(COLLECTIONS.FILES || 'files')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const total = await db.collection(COLLECTIONS.FILES || 'files').countDocuments(query);

    return NextResponse.json({
      success: true,
      files: files.map(file => ({
        ...file,
        id: file._id.toString(),
        _id: undefined
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error("Error fetching user files:", error);
    return NextResponse.json({ 
      error: "Failed to fetch files" 
    }, { status: 500 });
  }
}

export const POST = withAuth(uploadFileHandler);
export const GET = withAuth(getUserFilesHandler);