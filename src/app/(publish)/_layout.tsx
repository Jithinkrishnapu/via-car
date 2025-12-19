import { Stack } from 'expo-router';

export default function PublishLayout() {
  // Publishing layout doesn't need auth guard here since the pickup tab 
  // already handles the complex onboarding flow for publishing users
  // The pickup tab will redirect to login if needed and handle all onboarding steps
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="upload-document" />
      <Stack.Screen name="pickup-selected" />
      <Stack.Screen name="publish-ride" />
      <Stack.Screen name="ride-details" />
    </Stack>
  );
}
