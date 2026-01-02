import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// For push notifications, we'll use Expo's push notification service
// which works with both Expo Go and standalone apps

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  // Check if we're running in a standalone app (not Expo Go)
  static isStandaloneApp(): boolean {
    // appOwnership is deprecated, use executionEnvironment instead
    return Constants.executionEnvironment === 'standalone';
  }

  // Request notification permissions
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Get Expo push token
  static async getExpoPushToken(): Promise<string | null> {
    try {
      // Check if we have permission first
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('No notification permissions - cannot get push token');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      
      console.log('Expo Push Token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting Expo push token:', error);
      return null;
    }
  }

  // Initialize notification listeners
  static initializeNotifications(
    onNotificationReceived?: (notification: any) => void,
    onNotificationOpened?: (notification: any) => void
  ) {
    const cleanupFunctions: (() => void)[] = [];

    // Set up Expo notification listeners
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });
    cleanupFunctions.push(() => notificationListener.remove());

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      if (onNotificationOpened) {
        onNotificationOpened(response.notification);
      }
    });
    cleanupFunctions.push(() => responseListener.remove());

    // Return cleanup function
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }

  // Send push notification via your backend
  // Note: You'll need to implement a backend service that uses the Expo push API
  // or Firebase Admin SDK to send notifications to the Expo push tokens
  static async sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data,
      };

      // This would typically be sent to your backend API
      // which then forwards it to Expo's push service
      console.log('Push notification to send:', message);
      
      // For development/testing, you can send directly to Expo's API:
      // await fetch('https://exp.host/--/api/v2/push/send', {
      //   method: 'POST',
      //   headers: {
      //     Accept: 'application/json',
      //     'Accept-encoding': 'gzip, deflate',
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(message),
      // });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Get badge count (iOS)
  static async getBadgeCount(): Promise<number> {
    if (Platform.OS === 'ios') {
      return await Notifications.getBadgeCountAsync();
    }
    return 0;
  }

  // Set badge count (iOS)
  static async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
    }
  }

  // Clear all notifications
  static async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Test notification functionality (works in Expo Go)
  static async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Notifications Working!',
          body: 'This is a test notification from your ViaCar app',
          data: { test: true },
        },
        trigger: { seconds: 1 },
      });
      console.log('Test notification scheduled');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  // Get notification status for debugging
  static async getNotificationStatus(): Promise<object> {
    const permissions = await Notifications.getPermissionsAsync();
    const pushToken = await this.getExpoPushToken();
    
    return {
      standaloneApp: this.isStandaloneApp(),
      executionEnvironment: Constants.executionEnvironment,
      expoPermissions: permissions,
      pushToken: pushToken ? 'Available' : 'Not available',
      platform: Platform.OS,
    };
  }
}
