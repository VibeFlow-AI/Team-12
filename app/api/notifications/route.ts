import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import notificationService from "@/lib/notification-service";

// GET - Get user notifications
async function getNotificationsHandler(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') || undefined;

    const result = await notificationService.getUserNotifications(user.id, {
      limit,
      offset,
      unreadOnly,
      type
    });

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ 
      error: "Failed to fetch notifications" 
    }, { status: 500 });
  }
}

// POST - Create a new notification (admin only)
async function createNotificationHandler(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    // Only admins can create notifications manually
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ 
        error: "Access denied" 
      }, { status: 403 });
    }

    const body = await request.json();
    const { userId, type, title, message, data, channels, priority } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ 
        error: "Missing required fields: userId, type, title, message" 
      }, { status: 400 });
    }

    const notificationId = await notificationService.sendNotification({
      userId,
      type,
      title,
      message,
      data,
      channels: channels || ['push'],
      priority: priority || 'medium'
    });

    if (notificationId) {
      return NextResponse.json({
        success: true,
        notificationId,
        message: "Notification sent successfully"
      });
    } else {
      return NextResponse.json({ 
        error: "Failed to send notification" 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ 
      error: "Failed to create notification" 
    }, { status: 500 });
  }
}

export const GET = withAuth(getNotificationsHandler);
export const POST = withAuth(createNotificationHandler);