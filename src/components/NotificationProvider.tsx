// Notification Provider to initialize notifications system
import React, { useEffect } from 'react';
import { useAdvancedNotifications } from '../hooks/useAdvancedNotifications';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { isReady, token } = useAdvancedNotifications();

  useEffect(() => {
    if (isReady && token) {
      console.log('Notification system initialized');
    }
  }, [isReady, token]);

  return <>{children}</>;
}
