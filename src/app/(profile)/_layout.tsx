import { Stack, router } from 'expo-router';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export default function ProfileLayout() {
  // Check authentication on layout mount
  // Profile-related screens require authentication
  useEffect(() => {
    const checkAuth = async () => {
      const raw = await useAsyncStorage("userDetails").getItem();
      const token = raw ? JSON.parse(raw).token : "";
      if (!token) {
        router.replace("/login");
      }
    };
    checkAuth();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="add-vehicles" />
      <Stack.Screen name="edit-vehicle" />
      <Stack.Screen name="vehicle-category" />
      <Stack.Screen name="vehicle-model" />
      <Stack.Screen name="vehicle-color" />
      <Stack.Screen name="bank" />
      <Stack.Screen name="transactions" />
      <Stack.Screen name="payment" />
    </Stack>
  );
}
