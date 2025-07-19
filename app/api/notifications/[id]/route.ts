import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import notificationService from "@/lib/notification-service";

// PATCH - Mark notification as read
async function markAsReadHandler(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    // Extract notification ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const notificationId = pathSegments[pathSegments.length - 1];
    
    const success = await notificationService.markAsRead(notificationId, user.id);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: "Notification marked as read"
      });
    } else {
      return NextResponse.json({ 
        error: "Notification not found or access denied" 
      }, { status: 404 });
    }

  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json({ 
      error: "Failed to mark notification as read" 
    }, { status: 500 });
  }
}

// DELETE - Delete notification
async function deleteNotificationHandler(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    // Extract notification ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const notificationId = pathSegments[pathSegments.length - 1];
    
    const success = await notificationService.deleteNotification(notificationId, user.id);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: "Notification deleted successfully"
      });
    } else {
      return NextResponse.json({ 
        error: "Notification not found or access denied" 
      }, { status: 404 });
    }

  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ 
      error: "Failed to delete notification" 
    }, { status: 500 });
  }
}

export const PATCH = withAuth(markAsReadHandler);
export const DELETE = withAuth(deleteNotificationHandler);