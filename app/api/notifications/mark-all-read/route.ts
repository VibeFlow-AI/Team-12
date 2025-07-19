import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import notificationService from "@/lib/notification-service";

// POST - Mark all notifications as read for the user
async function markAllAsReadHandler(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    const count = await notificationService.markAllAsRead(user.id);
    
    return NextResponse.json({
      success: true,
      message: `Marked ${count} notifications as read`,
      count
    });

  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json({ 
      error: "Failed to mark all notifications as read" 
    }, { status: 500 });
  }
}

export const POST = withAuth(markAllAsReadHandler);