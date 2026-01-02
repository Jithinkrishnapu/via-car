import { Stack, router } from 'expo-router';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export default function BookingLayout() {
  // Booking requires authentication - users need to be logged in to book rides
  useEffect(() => {
    const checkAuth = async () => {
      const raw = await useAsyncStorage("userDetails").getItem();
      const token = raw ? JSON.parse(raw).token : "";
      if (!token) {
        router.replace("/login");
      }
    };
    // checkAuth();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
