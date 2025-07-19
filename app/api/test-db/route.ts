import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb-alt";
import { getFallbackDatabase } from "@/lib/mongodb-fallback";

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    let db;
    let connectionMethod = "primary";
    
    try {
      db = await getDatabase();
      console.log("Primary connection successful");
    } catch (primaryError) {
      console.log("Primary connection failed, trying fallback...");
      try {
        db = await getFallbackDatabase();
        connectionMethod = "fallback";
        console.log("Fallback connection successful");
      } catch (fallbackError) {
        console.error("Both connections failed");
        return NextResponse.json({
          success: false,
          error: "All database connections failed",
          primaryError: primaryError.message,
          fallbackError: fallbackError.message
        }, { status: 500 });
      }
    }
    
    // Test database operations
    const testResult = await db.admin().ping();
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      connectionMethod,
      pingResult: testResult,
      collections: collections.map(c => c.name),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}