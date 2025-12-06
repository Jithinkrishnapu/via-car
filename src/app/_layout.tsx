import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useNotifications } from '@/hooks/useNotifications';
import { router } from 'expo-router';

export default function RootLayout() {
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
      console.log('FCM Token ready:', fcmToken);
      // TODO: Send this token to your backend to store it
      // This allows your backend to send push notifications to this device
      // Example: await sendTokenToBackend(fcmToken);
    }
  }, [fcmToken]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="bank-save" options={{ headerShown: false }} />
      <Stack.Screen name="add-vehicles" options={{ headerShown: false }} />
      <Stack.Screen name="pending-verification" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(booking)" options={{ headerShown: false }} />
      <Stack.Screen name="(publish)" options={{ headerShown: false }} />
      <Stack.Screen name="(profile)" options={{ headerShown: false }} />
    </Stack>
  );
}
