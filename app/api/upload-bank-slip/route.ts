import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can upload bank slips
    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Please upload a JPEG, PNG, or PDF file." 
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "File size too large. Maximum size is 10MB." 
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: "eduvibe/bank-slips",
            format: file.type === 'application/pdf' ? 'pdf' : undefined,
            transformation: file.type.startsWith('image/') 
              ? [
                  { quality: "auto:good" },
                  { fetch_format: "auto" },
                  { width: 1200, height: 1600, crop: "limit" }
                ]
              : undefined,
            tags: [
              "bank-slip",
              `user-${session.user.id}`,
              `uploaded-${Date.now()}`
            ]
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });

      const result = uploadResult as any;

      // Log the upload for security/audit purposes
      console.log(`Bank slip uploaded by user ${session.user.id}: ${result.secure_url}`);

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        message: "Bank slip uploaded successfully"
      });

    } catch (cloudinaryError) {
      console.error("Cloudinary error:", cloudinaryError);
      return NextResponse.json({ 
        error: "Failed to upload image. Please try again." 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// Optional: Add a GET endpoint to retrieve upload status or history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's uploaded bank slips from Cloudinary
    const result = await cloudinary.search
      .expression(`folder:eduvibe/bank-slips AND tags:user-${session.user.id}`)
      .sort_by([['created_at', 'desc']])
      .max_results(10)
      .execute();

    return NextResponse.json({
      success: true,
      uploads: result.resources.map((resource: any) => ({
        url: resource.secure_url,
        publicId: resource.public_id,
        createdAt: resource.created_at,
        format: resource.format,
        bytes: resource.bytes
      }))
    });

  } catch (error) {
    console.error("Error fetching uploads:", error);
    return NextResponse.json({ 
      error: "Failed to fetch uploads" 
    }, { status: 500 });
  }
}