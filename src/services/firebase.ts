// Simplified Firebase service for Expo/React Native notifications
// Using only Expo Notifications (no Firebase SDK needed for basic functionality)
import * as Notifications from 'expo-notifications';

// Firebase configuration (for future use if needed)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase Cloud Messaging for React Native/Expo
export const firebaseNotificationService = {
  // Get FCM registration token for Expo
  async getExpoToken(): Promise<string | null> {
    try {
      // Get Expo push token (works with Firebase)
      const token = (await Notifications.getExpoPushTokenAsync()).data;

      return token;
    } catch (error) {
      console.log('Error getting Expo token:', error);
      return null;
    }
  },

  // Store token in Supabase for sending notifications
  async storeToken(userId: string, token: string) {
    try {
      // This will be integrated with Supabase later

      return true;
    } catch (error) {
      console.log('Error storing token:', error);
      return false;
    }
  },

  // Handle notification received
  handleNotificationReceived: (notification: any) => {

  },

  // Handle notification response (user tapped)
  handleNotificationResponse: (response: any) => {

    // Navigate to specific screen based on notification data
  },
};

// Legacy exports for compatibility
export const messaging = null;
export const analytics = null;
export const requestPermissionAndGetToken = firebaseNotificationService.getExpoToken;
export const onMessageListener = () => new Promise(() => { });

// Mock app export (no Firebase SDK needed)
export default { name: 'expo-notifications-only' };
