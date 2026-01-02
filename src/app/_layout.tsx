import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useNotifications } from '@/hooks/usePushNotifications';
import { router } from 'expo-router';
import { initI18n } from '@/lib/i18n';
import { I18nManager, Platform, View } from 'react-native';
import GlobalSnackbar from '@/components/ui/snackbar';
import FontProvider from '@/components/providers/FontProvider';

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);

  // Initialize i18n before rendering
  useEffect(() => {
    const init = async () => {
      await initI18n();
      setI18nReady(true);
    };
    init();
  }, []);

  // Handle notification received while app is in foreground
  const handleNotificationReceived = (notification: any) => {
    console.log('Notification received in foreground:', notification);
    // You can show a custom in-app notification here
    // or update your app state
  };

  // Handle notification tap (when user taps on notification)
  const handleNotificationOpened = (notification: any) => {
    console.log('Notification opened:', notification);
    
    // Navigate based on notification data
    const data = notification.data || notification.request?.content?.data;
    
    if (data?.screen) {
      // Navigate to specific screen based on notification data
      router.push(data.screen);
    } else if (data?.rideId) {
      // Example: Navigate to ride details
      router.push(`/(booking)/ride?id=${data.rideId}`);
    }
  };

  // Initialize notifications
  const { fcmToken, permissionGranted } = useNotifications(
    handleNotificationReceived,
    handleNotificationOpened
  );

  useEffect(() => {
    if (fcmToken) {
      console.log('✅ FCM Token ready:', fcmToken);
      
      // Send token to your backend
      sendTokenToBackend(fcmToken);
      
      // For testing: You can copy this token and use it to send test notifications
      alert(`FCM Token Generated!\n\nToken: ${fcmToken.substring(0, 50)}...`);
    } else {
      // Log notification status for debugging
      import('@/services/notificationService').then(({ NotificationService }) => {
        NotificationService.getNotificationStatus().then(status => {
          console.log('📱 Notification Status:', status);
        });
      });
    }
  }, [fcmToken]);

  // Function to send FCM token to your backend
  const sendTokenToBackend = async (token: string) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('YOUR_API_ENDPOINT/users/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_USER_TOKEN', // Add user authentication
        },
        body: JSON.stringify({
          fcmToken: token,
          platform: Platform.OS,
        }),
      });
      
      if (response.ok) {
        console.log('✅ FCM token sent to backend successfully');
      } else {
        console.error('❌ Failed to send FCM token to backend');
      }
    } catch (error) {
      console.error('❌ Error sending FCM token:', error);
    }
  };

  // Wait for i18n to be ready
  if (!i18nReady) {
    return null;
  }

  return (
    <FontProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="bank-save" options={{ headerShown: false }} />
          <Stack.Screen name="add-vehicles" options={{ headerShown: false }} />
          <Stack.Screen name="pending-verification" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(booking)" options={{ headerShown: false }} />
          <Stack.Screen name="(publish)" options={{ headerShown: false }} />
          <Stack.Screen name="(profile)" options={{ headerShown: false }} />
        </Stack>
        
        {/* Global Snackbar - appears on top of all screens */}
        <GlobalSnackbar />
      </View>
    </FontProvider>
  );
}
