import { Stack } from 'expo-router';

export default function PublishLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="upload-document" />
      <Stack.Screen name="pickup-selected" />
      <Stack.Screen name="publish-ride" />
      <Stack.Screen name="ride-details" />
    </Stack>
  );
}
