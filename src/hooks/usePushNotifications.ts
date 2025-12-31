import { useEffect, useState } from 'react';
import { NotificationService } from '@/services/notificationService';

export function useNotifications(
  onNotificationReceived?: (notification: any) => void,
  onNotificationOpened?: (notification: any) => void
) {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setupNotifications = async () => {
      // Request permissions
      const granted = await NotificationService.requestPermissions();
      setPermissionGranted(granted);

      if (granted) {
        // Get Expo push token (since the service uses Expo)
        const token = await NotificationService.getExpoPushToken();
        setFcmToken(token);

        // Initialize notification listeners
        cleanup = NotificationService.initializeNotifications(
          onNotificationReceived,
          onNotificationOpened
        );
      }
    };

    setupNotifications();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [onNotificationReceived, onNotificationOpened]);

  return {
    fcmToken,
    permissionGranted,
  };
}