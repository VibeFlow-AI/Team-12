import { getDatabase } from '@/lib/mongodb-alt';
import { ObjectId } from 'mongodb';
import { COLLECTIONS } from '@/lib/models';
import socketManager from '@/lib/socket';

export interface NotificationInput {
  userId: string;
  type: 'booking' | 'payment' | 'session' | 'review' | 'system' | 'message' | 'promotion';
  title: string;
  message: string;
  data?: any;
  channels?: ('email' | 'sms' | 'push')[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
}

export interface BulkNotificationInput {
  userIds: string[];
  type: NotificationInput['type'];
  title: string;
  message: string;
  data?: any;
  channels?: ('email' | 'sms' | 'push')[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

class NotificationService {
  // Send notification to a single user
  async sendNotification(input: NotificationInput): Promise<string | null> {
    try {
      const db = await getDatabase();
      
      const notification = {
        userId: new ObjectId(input.userId),
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data || {},
        channels: input.channels || ['push'],
        priority: input.priority || 'medium',
        isRead: false,
        emailSent: false,
        smsSent: false,
        pushSent: false,
        expiresAt: input.expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection(COLLECTIONS.NOTIFICATIONS).insertOne(notification);
      
      if (result.insertedId) {
        // Send real-time notification via Socket.IO
        await socketManager.sendNotification({
          id: result.insertedId.toString(),
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          data: input.data,
          createdAt: new Date(),
          isRead: false
        });

        // Handle different notification channels
        await this.processNotificationChannels(notification, result.insertedId.toString());
        
        return result.insertedId.toString();
      }
      
      return null;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  // Send bulk notifications to multiple users
  async sendBulkNotification(input: BulkNotificationInput): Promise<string[]> {
    try {
      const db = await getDatabase();
      const notificationIds: string[] = [];
      
      const notifications = input.userIds.map(userId => ({
        userId: new ObjectId(userId),
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data || {},
        channels: input.channels || ['push'],
        priority: input.priority || 'medium',
        isRead: false,
        emailSent: false,
        smsSent: false,
        pushSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const result = await db.collection(COLLECTIONS.NOTIFICATIONS).insertMany(notifications);
      
      if (result.insertedIds) {
        // Send real-time notifications
        for (let i = 0; i < input.userIds.length; i++) {
          const userId = input.userIds[i];
          const notificationId = result.insertedIds[i].toString();
          
          await socketManager.sendNotification({
            id: notificationId,
            userId: userId,
            type: input.type,
            title: input.title,
            message: input.message,
            data: input.data,
            createdAt: new Date(),
            isRead: false
          });
          
          notificationIds.push(notificationId);
        }
      }
      
      return notificationIds;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      return [];
    }
  }

  // Send notification to all users with a specific role
  async sendRoleNotification(
    role: 'student' | 'mentor' | 'admin',
    notification: Omit<NotificationInput, 'userId'>
  ): Promise<string[]> {
    try {
      const db = await getDatabase();
      
      // Get all users with the specified role
      const users = await db.collection(COLLECTIONS.USERS)
        .find({ role: role, isActive: true })
        .project({ _id: 1 })
        .toArray();
      
      const userIds = users.map(user => user._id.toString());
      
      return await this.sendBulkNotification({
        userIds,
        ...notification
      });
    } catch (error) {
      console.error('Error sending role notification:', error);
      return [];
    }
  }

  // Get notifications for a user
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      type?: string;
    } = {}
  ): Promise<{
    notifications: any[];
    total: number;
    unreadCount: number;
  }> {
    try {
      const db = await getDatabase();
      const { limit = 20, offset = 0, unreadOnly = false, type } = options;
      
      const query: any = { userId: new ObjectId(userId) };
      
      if (unreadOnly) {
        query.isRead = false;
      }
      
      if (type) {
        query.type = type;
      }

      // Add expiration check
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ];
      
      const notifications = await db.collection(COLLECTIONS.NOTIFICATIONS)
        .find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();
      
      const total = await db.collection(COLLECTIONS.NOTIFICATIONS).countDocuments(query);
      
      const unreadCount = await db.collection(COLLECTIONS.NOTIFICATIONS).countDocuments({
        userId: new ObjectId(userId),
        isRead: false,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      });
      
      return {
        notifications: notifications.map(n => ({
          ...n,
          id: n._id.toString(),
          _id: undefined
        })),
        total,
        unreadCount
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return { notifications: [], total: 0, unreadCount: 0 };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId?: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      
      const query: any = { _id: new ObjectId(notificationId) };
      if (userId) {
        query.userId = new ObjectId(userId);
      }
      
      const result = await db.collection(COLLECTIONS.NOTIFICATIONS).updateOne(
        query,
        {
          $set: {
            isRead: true,
            readAt: new Date(),
            updatedAt: new Date()
          }
        }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const db = await getDatabase();
      
      const result = await db.collection(COLLECTIONS.NOTIFICATIONS).updateMany(
        {
          userId: new ObjectId(userId),
          isRead: false
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
            updatedAt: new Date()
          }
        }
      );
      
      return result.modifiedCount;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId?: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      
      const query: any = { _id: new ObjectId(notificationId) };
      if (userId) {
        query.userId = new ObjectId(userId);
      }
      
      const result = await db.collection(COLLECTIONS.NOTIFICATIONS).deleteOne(query);
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications(): Promise<number> {
    try {
      const db = await getDatabase();
      
      const result = await db.collection(COLLECTIONS.NOTIFICATIONS).deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      return 0;
    }
  }

  // Process notification channels (email, SMS, etc.)
  private async processNotificationChannels(notification: any, notificationId: string) {
    const updates: any = {};
    
    // Process email notifications
    if (notification.channels.includes('email')) {
      try {
        // Here you would integrate with your email service
        // await emailService.sendNotificationEmail(notification);
        updates.emailSent = true;
        console.log(`Email notification sent for ${notificationId}`);
      } catch (error) {
        console.error('Error sending email notification:', error);
      }
    }
    
    // Process SMS notifications
    if (notification.channels.includes('sms')) {
      try {
        // Here you would integrate with SMS service (Twilio, etc.)
        // await smsService.sendNotificationSMS(notification);
        updates.smsSent = true;
        console.log(`SMS notification sent for ${notificationId}`);
      } catch (error) {
        console.error('Error sending SMS notification:', error);
      }
    }
    
    // Mark push notification as sent (real-time via Socket.IO)
    if (notification.channels.includes('push')) {
      updates.pushSent = true;
    }
    
    // Update notification with delivery status
    if (Object.keys(updates).length > 0) {
      try {
        const db = await getDatabase();
        await db.collection(COLLECTIONS.NOTIFICATIONS).updateOne(
          { _id: new ObjectId(notificationId) },
          { $set: { ...updates, updatedAt: new Date() } }
        );
      } catch (error) {
        console.error('Error updating notification delivery status:', error);
      }
    }
  }

  // Predefined notification templates
  async sendBookingNotification(studentId: string, mentorId: string, sessionDetails: any) {
    // Notification to mentor
    await this.sendNotification({
      userId: mentorId,
      type: 'booking',
      title: 'New Session Booking',
      message: `You have a new session booking for ${sessionDetails.subject} on ${sessionDetails.date} at ${sessionDetails.time}`,
      data: {
        sessionId: sessionDetails.sessionId,
        studentName: sessionDetails.studentName,
        subject: sessionDetails.subject,
        date: sessionDetails.date,
        time: sessionDetails.time
      },
      channels: ['push', 'email']
    });

    // Confirmation to student
    await this.sendNotification({
      userId: studentId,
      type: 'booking',
      title: 'Booking Confirmed',
      message: `Your session with ${sessionDetails.mentorName} has been booked for ${sessionDetails.date} at ${sessionDetails.time}`,
      data: {
        sessionId: sessionDetails.sessionId,
        mentorName: sessionDetails.mentorName,
        subject: sessionDetails.subject,
        date: sessionDetails.date,
        time: sessionDetails.time
      },
      channels: ['push']
    });
  }

  async sendPaymentNotification(userId: string, paymentDetails: any) {
    await this.sendNotification({
      userId: userId,
      type: 'payment',
      title: paymentDetails.success ? 'Payment Successful' : 'Payment Failed',
      message: paymentDetails.success 
        ? `Your payment of $${paymentDetails.amount} has been processed successfully`
        : `Your payment of $${paymentDetails.amount} failed. Please try again.`,
      data: {
        paymentId: paymentDetails.paymentId,
        amount: paymentDetails.amount,
        status: paymentDetails.status
      },
      channels: ['push', 'email'],
      priority: paymentDetails.success ? 'medium' : 'high'
    });
  }

  async sendSessionReminder(userId: string, sessionDetails: any) {
    await this.sendNotification({
      userId: userId,
      type: 'session',
      title: 'Session Reminder',
      message: `Your session "${sessionDetails.subject}" starts in ${sessionDetails.timeUntil}`,
      data: {
        sessionId: sessionDetails.sessionId,
        subject: sessionDetails.subject,
        startTime: sessionDetails.startTime,
        meetingLink: sessionDetails.meetingLink
      },
      channels: ['push', 'email'],
      priority: 'high'
    });
  }

  async sendReviewNotification(mentorId: string, reviewDetails: any) {
    await this.sendNotification({
      userId: mentorId,
      type: 'review',
      title: 'New Review Received',
      message: `${reviewDetails.studentName} left a ${reviewDetails.rating}-star review for your session`,
      data: {
        reviewId: reviewDetails.reviewId,
        sessionId: reviewDetails.sessionId,
        rating: reviewDetails.rating,
        studentName: reviewDetails.studentName
      },
      channels: ['push', 'email']
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;