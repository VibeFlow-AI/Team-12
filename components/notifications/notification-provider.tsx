"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'session' | 'review' | 'system' | 'message' | 'promotion';
  title: string;
  message: string;
  data?: any;
  createdAt: Date;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  refetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (session?.user?.id) {
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      setSocket(socketInstance);

      // Handle connection
      socketInstance.on('connect', () => {
        console.log('Connected to notification server');
        setIsConnected(true);
        
        // Authenticate with server
        const token = btoa(JSON.stringify({ userId: session.user.id }));
        socketInstance.emit('authenticate', token);
      });

      // Handle authentication
      socketInstance.on('authenticated', (data: { user: any }) => {
        console.log('Authenticated with notification server', data.user);
      });

      // Handle authentication errors
      socketInstance.on('auth_error', (data: { message: string }) => {
        console.error('Authentication failed:', data.message);
        toast.error('Failed to connect to notification service');
      });

      // Handle disconnection
      socketInstance.on('disconnect', () => {
        console.log('Disconnected from notification server');
        setIsConnected(false);
      });

      // Handle new notifications
      socketInstance.on('new_notification', (notification: Notification) => {
        console.log('New notification received:', notification);
        
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast(notification.title, {
          description: notification.message,
          action: notification.type === 'booking' ? {
            label: 'View',
            onClick: () => {
              // Navigate to booking details
              window.location.href = `/dashboard/sessions/${notification.data?.sessionId}`;
            }
          } : undefined
        });
      });

      // Handle unread notifications on initial load
      socketInstance.on('unread_notifications', (data: { notifications: Notification[], count: number }) => {
        console.log('Unread notifications:', data);
        setNotifications(data.notifications);
        setUnreadCount(data.count);
      });

      // Handle new messages
      socketInstance.on('new_message', (message: any) => {
        console.log('New message received:', message);
        
        toast(`New message from ${message.senderName}`, {
          description: message.content,
          action: {
            label: 'Reply',
            onClick: () => {
              // Open message interface
              window.location.href = `/dashboard/messages/${message.senderId}`;
            }
          }
        });
      });

      // Handle presence updates
      socketInstance.on('presence_update', (data: { userId: string, status: string }) => {
        console.log('Presence update:', data);
        // Update user presence in your UI
      });

      // Handle typing indicators
      socketInstance.on('user_typing', (data: { userId: string, isTyping: boolean }) => {
        console.log('Typing indicator:', data);
        // Show typing indicator in chat
      });

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [session?.user?.id]);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Emit read acknowledgment to socket
        if (socket) {
          socket.emit('notification_read', notificationId);
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [socket]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(n => n.id !== notificationId)
        );
        
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetchNotifications: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}