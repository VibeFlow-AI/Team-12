import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDatabase } from "@/lib/mongodb-alt";
import { getFallbackDatabase } from "@/lib/mongodb-fallback";
import { emailService } from "@/app/email/service";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get database connection with fallback logic
    let db;
    try {
      db = await getDatabase();
    } catch (dbError) {
      console.error("Primary database connection failed, trying fallback...", dbError);
      try {
        db = await getFallbackDatabase();
      } catch (fallbackError) {
        console.error("Fallback database connection also failed:", fallbackError);
        return NextResponse.json(
          { error: "Database connection failed. Please try again later." },
          { status: 503 }
        );
      }
    }
    
    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send welcome email (don't block response if email fails)
    emailService.sendWelcomeEmail({ name, email, role }).catch(error => {
      console.error('Failed to send welcome email:', error);
    });

    return NextResponse.json({
      message: "User created successfully",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}