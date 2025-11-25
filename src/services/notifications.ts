// Push notification service using Expo Notifications
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { firebaseNotificationService } from './firebase';

// Configure how notifications are handled
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const notificationService = {
  // Register for push notifications and get token
  async registerForPushNotifications(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      try {
        // Get Expo token (compatible with Firebase)
        token = (await Notifications.getExpoPushTokenAsync()).data;


        // Also get Firebase token for advanced features
        const firebaseToken = await firebaseNotificationService.getExpoToken();
        if (firebaseToken) {

        }
      } catch (error) {
        console.log('❌ Error getting push token:', error);
      }
    } else {
      console.warn('⚠️ Must use physical device for Push Notifications');
      // For simulator, return mock token for testing
      token = 'simulator-mock-token';
    }

    return token;
  },

  // Schedule a local notification
  async scheduleLocalNotification(notification: NotificationData, triggerSeconds?: number) {
    const trigger = triggerSeconds
      ? {
          seconds: triggerSeconds,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL as const, // Explicitly cast as const
        }
      : null;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      },
      trigger,
    });
  },

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Cancel specific notification
  async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  // Get badge count
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  },

  // Set badge count
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  },

  // Add notification listeners
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  },

  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void,
  ) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  },

  // Remove listeners
  removeNotificationSubscription(subscription: { remove: () => void }) {
    subscription.remove();
  },
};
