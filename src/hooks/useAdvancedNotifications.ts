// Advanced notifications hook integrating Expo + Firebase
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { firebaseNotificationService } from '../services/firebase';
import { notificationManager } from '../services/notificationManager';
import { notificationService } from '../services/notifications';

interface NotificationState {
  token: string | null;
  firebaseToken: string | null;
  isRegistered: boolean;
  permission: 'granted' | 'denied' | 'undetermined';
  lastNotification: any;
}

export function useAdvancedNotifications() {
  const [state, setState] = useState<NotificationState>({
    token: null,
    firebaseToken: null,
    isRegistered: false,
    permission: 'undetermined',
    lastNotification: null,
  });

  useEffect(() => {
    let isMounted = true;

    // Initialize notifications
    const initializeNotifications = async () => {
      try {


        // 1. Register for basic notifications
        const token = await notificationService.registerForPushNotifications();

        // 2. Get Firebase token for advanced features
        const firebaseToken = await firebaseNotificationService.getExpoToken();

        if (isMounted) {
          setState((prev) => ({
            ...prev,
            token,
            firebaseToken,
            isRegistered: !!token,
            permission: token ? 'granted' : 'denied',
          }));

          if (token) {

          }
        }
      } catch (error) {
        console.log('Error initializing notifications:', error);
        if (isMounted) {
          setState((prev) => ({ ...prev, permission: 'denied' }));
        }
      }
    };

    // Initialize
    initializeNotifications();

    // Listen for incoming notifications
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {

      setState((prev) => ({ ...prev, lastNotification: notification }));
      firebaseNotificationService.handleNotificationReceived(notification);
    });

    // Listen for notification interactions
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {

      firebaseNotificationService.handleNotificationResponse(response);
    });

    // Cleanup
    return () => {
      isMounted = false;
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // Smart notification methods
  const notifications = {
    // Send local notification
    async sendLocal(title: string, body: string, data?: any) {
      return await notificationService.scheduleLocalNotification({
        title,
        body,
        data,
      });
    },

    // Schedule booking reminder
    async scheduleBookingReminder(
      bookingId: string,
      date: string,
      time: string,
      barberName: string,
    ) {
      return await notificationManager.scheduleBookingReminder(bookingId, date, time, barberName);
    },

    // Send course notification
    async sendCourseUpdate(courseTitle: string, progressPercent: number = 50) {
      return await notificationManager.notifyCourseProgress(courseTitle, progressPercent);
    },

    // Send product notification
    async sendProductUpdate(productName: string) {
      return await notificationManager.notifyItemAddedToCart(productName, 'product');
    },

    // Welcome notification
    async sendWelcome() {
      return await notificationManager.scheduleWelcomeSequence();
    },

    // Test notification
    async sendTest() {
      return await notificationService.scheduleLocalNotification({
        title: '🎉 T-Black Studio',
        body: 'Sistema de notificações funcionando perfeitamente!',
        data: { type: 'test', timestamp: new Date().toISOString() },
      });
    },
  };

  return {
    ...state,
    notifications,
    isReady: state.isRegistered && state.permission === 'granted',
  };
}
