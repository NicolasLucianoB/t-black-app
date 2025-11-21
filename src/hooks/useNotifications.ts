// Smart notification hooks for easy integration across components

import { useCallback, useState } from 'react';
import { notificationManager } from '../services/notificationManager';
import { notificationService } from '../services/notifications';

export const useBookingNotifications = () => {
  const [isScheduling, setIsScheduling] = useState(false);

  const scheduleBookingNotifications = useCallback(
    async (bookingId: string, date: string, time: string, barberName: string) => {
      try {
        setIsScheduling(true);
        await notificationManager.scheduleBookingReminder(bookingId, date, time, barberName);
        await notificationManager.notifyBookingConfirmed(barberName, date, time);
      } catch (error) {
        console.error('Failed to schedule booking notifications:', error);
      } finally {
        setIsScheduling(false);
      }
    },
    [],
  );

  const cancelBooking = useCallback(async (barberName: string, date: string, time: string) => {
    try {
      await notificationManager.notifyBookingCancelled(barberName, date, time);
    } catch (error) {
      console.error('Failed to send cancellation notification:', error);
    }
  }, []);

  return {
    scheduleBookingNotifications,
    cancelBooking,
    isScheduling,
  };
};

export const useCartNotifications = () => {
  const [cartTimer, setCartTimer] = useState<NodeJS.Timeout | null>(null);

  const notifyItemAdded = useCallback(
    async (itemName: string, itemType: 'product' | 'course') => {
      try {
        await notificationManager.notifyItemAddedToCart(itemName, itemType);

        // Schedule cart abandonment notification
        if (cartTimer) clearTimeout(cartTimer);

        const timer = setTimeout(async () => {
          await notificationManager.notifyCartAbandonment();
        }, 3600000); // 1 hour

        setCartTimer(timer);
      } catch (error) {
        console.error('Failed to send cart notification:', error);
      }
    },
    [cartTimer],
  );

  const notifyPurchaseCompleted = useCallback(
    async (totalValue: number, itemCount: number) => {
      try {
        // Clear cart abandonment timer
        if (cartTimer) {
          clearTimeout(cartTimer);
          setCartTimer(null);
        }

        await notificationManager.notifyPurchaseCompleted(totalValue, itemCount);
      } catch (error) {
        console.error('Failed to send purchase notification:', error);
      }
    },
    [cartTimer],
  );

  const clearCartTimer = useCallback(() => {
    if (cartTimer) {
      clearTimeout(cartTimer);
      setCartTimer(null);
    }
  }, [cartTimer]);

  return {
    notifyItemAdded,
    notifyPurchaseCompleted,
    clearCartTimer,
  };
};

export const useCourseNotifications = () => {
  const notifyCourseAccess = useCallback(async (courseName: string) => {
    try {
      await notificationManager.notifyCourseAccess(courseName);
    } catch (error) {
      console.error('Failed to send course access notification:', error);
    }
  }, []);

  const updateCourseProgress = useCallback(async (courseName: string, progressPercent: number) => {
    try {
      await notificationManager.notifyCourseProgress(courseName, progressPercent);
    } catch (error) {
      console.error('Failed to send course progress notification:', error);
    }
  }, []);

  const scheduleStudyReminder = useCallback(async () => {
    try {
      await notificationManager.scheduleStudyReminder();
    } catch (error) {
      console.error('Failed to schedule study reminder:', error);
    }
  }, []);

  return {
    notifyCourseAccess,
    updateCourseProgress,
    scheduleStudyReminder,
  };
};

export const useProfileNotifications = () => {
  const notifyProfileUpdated = useCallback(async () => {
    try {
      await notificationManager.notifyProfileUpdated();
    } catch (error) {
      console.error('Failed to send profile update notification:', error);
    }
  }, []);

  const notifyAvatarUpdated = useCallback(async () => {
    try {
      await notificationManager.notifyAvatarUpdated();
    } catch (error) {
      console.error('Failed to send avatar update notification:', error);
    }
  }, []);

  const scheduleProfileCompletion = useCallback(async () => {
    try {
      await notificationManager.scheduleProfileCompletion();
    } catch (error) {
      console.error('Failed to schedule profile completion reminder:', error);
    }
  }, []);

  return {
    notifyProfileUpdated,
    notifyAvatarUpdated,
    scheduleProfileCompletion,
  };
};

export const useMarketingNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeWelcomeFlow = useCallback(async () => {
    if (isInitialized) return;

    try {
      await notificationManager.scheduleWelcomeSequence();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize welcome flow:', error);
    }
  }, [isInitialized]);

  const sendSpecialOffer = useCallback(async (discount: number, category: string) => {
    try {
      await notificationManager.notifySpecialOffer(discount, category);
    } catch (error) {
      console.error('Failed to send special offer notification:', error);
    }
  }, []);

  const scheduleBirthdayWish = useCallback(async (birthdayDate: Date) => {
    try {
      await notificationManager.scheduleBirthdayWish(birthdayDate);
    } catch (error) {
      console.error('Failed to schedule birthday wish:', error);
    }
  }, []);

  return {
    initializeWelcomeFlow,
    sendSpecialOffer,
    scheduleBirthdayWish,
    isInitialized,
  };
};

export const useSystemNotifications = () => {
  const notifyAppUpdate = useCallback(async () => {
    try {
      await notificationManager.notifyAppUpdate();
    } catch (error) {
      console.error('Failed to send app update notification:', error);
    }
  }, []);

  const scheduleMaintenanceWarning = useCallback(async (maintenanceDate: Date) => {
    try {
      await notificationManager.scheduleMaintenanceWarning(maintenanceDate);
    } catch (error) {
      console.error('Failed to schedule maintenance warning:', error);
    }
  }, []);

  return {
    notifyAppUpdate,
    scheduleMaintenanceWarning,
  };
};

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    marketing: true,
    reminders: true,
    promotions: true,
    bookings: true,
    courses: true,
    system: true,
  });

  const updatePreferences = useCallback(
    async (newPrefs: Partial<typeof preferences>) => {
      const updated = { ...preferences, ...newPrefs };
      setPreferences(updated);

      try {
        // Apply new preferences to notification scheduling
        await notificationManager.scheduleSmartNotifications({
          marketing: updated.marketing,
          reminders: updated.reminders,
          promotions: updated.promotions,
        });
      } catch (error) {
        console.error('Failed to update notification preferences:', error);
      }
    },
    [preferences],
  );

  const disableAllNotifications = useCallback(async () => {
    try {
      await notificationService.cancelAllNotifications();
      setPreferences({
        marketing: false,
        reminders: false,
        promotions: false,
        bookings: false,
        courses: false,
        system: false,
      });
    } catch (error) {
      console.error('Failed to disable all notifications:', error);
    }
  }, []);

  return {
    preferences,
    updatePreferences,
    disableAllNotifications,
  };
};
