import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb-alt';
import { ObjectId } from 'mongodb';
import { COLLECTIONS } from '@/lib/models';

export interface SocketUser {
  id: string;
  name: string;
  role: string;
  socketId: string;
}

export interface NotificationData {
  id: string;
  type: 'booking' | 'payment' | 'session' | 'review' | 'system' | 'message' | 'promotion';
  title: string;
  message: string;
  data?: any;
  userId: string;
  createdAt: Date;
  isRead: boolean;
}

class SocketManager {
  private io: SocketIOServer | null = null;
  private connectedUsers = new Map<string, SocketUser>();

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', async (token: string) => {
        try {
          // In a real implementation, you would verify the JWT token
          // For now, we'll simulate user authentication
          const user = await this.authenticateSocket(socket, token);
          if (user) {
            this.connectedUsers.set(user.id, {
              ...user,
              socketId: socket.id
            });
            
            socket.join(`user_${user.id}`);
            socket.join(`role_${user.role}`);
            
            socket.emit('authenticated', { user });
            console.log(`User authenticated: ${user.name} (${user.role})`);

            // Send unread notifications
            await this.sendUnreadNotifications(user.id);
          }
        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('auth_error', { message: 'Authentication failed' });
        }
      });

      // Handle notification acknowledgment
      socket.on('notification_read', async (notificationId: string) => {
        try {
          await this.markNotificationAsRead(notificationId);
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      });

      // Handle real-time messaging
      socket.on('send_message', async (data: {
        recipientId: string;
        message: string;
        sessionId?: string;
      }) => {
        try {
          await this.handleMessage(socket, data);
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { recipientId: string }) => {
        this.io?.to(`user_${data.recipientId}`).emit('user_typing', {
          userId: this.getUserBySocketId(socket.id)?.id,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data: { recipientId: string }) => {
        this.io?.to(`user_${data.recipientId}`).emit('user_typing', {
          userId: this.getUserBySocketId(socket.id)?.id,
          isTyping: false
        });
      });

      // Handle presence updates
      socket.on('update_presence', (status: 'online' | 'away' | 'busy') => {
        const user = this.getUserBySocketId(socket.id);
        if (user) {
          this.broadcastPresenceUpdate(user.id, status);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        const user = this.getUserBySocketId(socket.id);
        if (user) {
          this.connectedUsers.delete(user.id);
          this.broadcastPresenceUpdate(user.id, 'offline');
        }
      });
    });

    return this.io;
  }

  private async authenticateSocket(socket: any, token: string): Promise<SocketUser | null> {
    // This is a simplified authentication - in production, verify JWT token
    try {
      // For demonstration, we'll extract user info from a session-like token
      // In real implementation, decode and verify JWT
      const db = await getDatabase();
      
      // Simulate token verification
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const user = await db.collection(COLLECTIONS.USERS).findOne({
        _id: new ObjectId(decoded.userId)
      });

      if (user) {
        return {
          id: user._id.toString(),
          name: user.name,
          role: user.role,
          socketId: socket.id
        };
      }
    } catch (error) {
      console.error('Socket authentication error:', error);
    }
    
    return null;
  }

  private getUserBySocketId(socketId: string): SocketUser | undefined {
    for (const [userId, user] of this.connectedUsers) {
      if (user.socketId === socketId) {
        return user;
      }
    }
    return undefined;
  }

  private async sendUnreadNotifications(userId: string) {
    try {
      const db = await getDatabase();
      const notifications = await db.collection(COLLECTIONS.NOTIFICATIONS)
        .find({
          userId: new ObjectId(userId),
          isRead: false
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

      if (notifications.length > 0) {
        this.io?.to(`user_${userId}`).emit('unread_notifications', {
          notifications: notifications.map(n => ({
            ...n,
            id: n._id.toString(),
            _id: undefined
          })),
          count: notifications.length
        });
      }
    } catch (error) {
      console.error('Error sending unread notifications:', error);
    }
  }

  private async markNotificationAsRead(notificationId: string) {
    try {
      const db = await getDatabase();
      await db.collection(COLLECTIONS.NOTIFICATIONS).updateOne(
        { _id: new ObjectId(notificationId) },
        { 
          $set: { 
            isRead: true,
            readAt: new Date(),
            updatedAt: new Date()
          }
        }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  private async handleMessage(socket: any, data: {
    recipientId: string;
    message: string;
    sessionId?: string;
  }) {
    try {
      const sender = this.getUserBySocketId(socket.id);
      if (!sender) return;

      const db = await getDatabase();
      
      // Save message to database
      const messageRecord = {
        senderId: new ObjectId(sender.id),
        receiverId: new ObjectId(data.recipientId),
        content: data.message,
        type: 'text',
        sessionId: data.sessionId ? new ObjectId(data.sessionId) : undefined,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection(COLLECTIONS.MESSAGES).insertOne(messageRecord);

      // Send message to recipient
      this.io?.to(`user_${data.recipientId}`).emit('new_message', {
        id: result.insertedId.toString(),
        senderId: sender.id,
        senderName: sender.name,
        content: data.message,
        sessionId: data.sessionId,
        createdAt: new Date(),
        isRead: false
      });

      // Confirm to sender
      socket.emit('message_sent', {
        id: result.insertedId.toString(),
        recipientId: data.recipientId,
        content: data.message
      });

    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  }

  private broadcastPresenceUpdate(userId: string, status: string) {
    // Broadcast to all connected users that this user's presence changed
    this.io?.emit('presence_update', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  // Public methods for sending notifications
  async sendNotification(notification: NotificationData) {
    if (!this.io) return;

    try {
      const db = await getDatabase();
      
      // Save notification to database
      const notificationRecord = {
        userId: new ObjectId(notification.userId),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        isRead: false,
        channels: ['push'], // Real-time notification
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection(COLLECTIONS.NOTIFICATIONS).insertOne(notificationRecord);

      // Send real-time notification
      this.io.to(`user_${notification.userId}`).emit('new_notification', {
        id: result.insertedId.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: new Date(),
        isRead: false
      });

      // Send to specific role channels if needed
      const user = this.connectedUsers.get(notification.userId);
      if (user) {
        this.io.to(`role_${user.role}`).emit('role_notification', {
          id: result.insertedId.toString(),
          type: notification.type,
          title: notification.title,
          message: notification.message,
          targetRole: user.role
        });
      }

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async sendToRole(role: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`role_${role}`).emit(event, data);
  }

  async sendToUser(userId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`user_${userId}`).emit(event, data);
  }

  getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

export const socketManager = new SocketManager();
export default socketManager;