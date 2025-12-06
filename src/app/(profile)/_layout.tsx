import { Stack } from 'expo-router';

export default function ProfileLayout() {
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
