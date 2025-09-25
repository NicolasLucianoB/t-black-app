// Notification related types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'course' | 'order' | 'system' | 'promotion';
  read: boolean;
  data?: Record<string, any>; // Additional data for the notification
  createdAt: string;
}

export interface PushNotificationToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  active: boolean;
  createdAt: string;
}

// For sending notifications
export interface SendNotificationData {
  userIds: string[];
  title: string;
  message: string;
  type: 'booking' | 'course' | 'order' | 'system' | 'promotion';
  data?: Record<string, any>;
}
