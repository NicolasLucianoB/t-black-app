// Central API service that combines all services
// This provides a unified interface for the app

export { authService } from './auth';
export { databaseService } from './database';
export { analytics, messaging, onMessageListener, requestPermissionAndGetToken } from './firebase';
export { notificationService } from './notifications';
export { storageService } from './storage';

// Re-export supabase client when ready
// export { supabase } from './supabase';

// API endpoints and configuration
export const API_CONFIG = {
  timeout: 10000, // 10 seconds
  retries: 3,
};

// Generic API response type
export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  loading?: boolean;
}
