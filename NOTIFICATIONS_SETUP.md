# Firebase Push Notifications Setup

## Overview
This app now supports Firebase Cloud Messaging (FCM) for push notifications in both foreground and background states.

## What's Been Set Up

### 1. Packages Installed
- `@react-native-firebase/messaging` - Firebase Cloud Messaging
- `expo-notifications` - Expo notifications API

### 2. Files Created
- `src/services/notificationService.ts` - Core notification service
- `src/hooks/useNotifications.ts` - React hook for easy notification integration
- `src/app/_layout.tsx` - Root layout with notification handling

### 3. Configuration Updated
- `app.json` - Added Firebase and notification plugins, Android permissions

## How It Works

### Foreground Notifications
When the app is open, notifications are received and displayed using Expo's notification system.

### Background Notifications
When the app is in the background, FCM handles the notification display automatically.

### Notification Tap Handling
When a user taps a notification, the app opens and navigates based on the notification data.

## Usage Example

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { fcmToken, permissionGranted } = useNotifications(
    (notification) => {
      // Handle foreground notification
      console.log('Received:', notification);
    },
    (notification) => {
      // Handle notification tap
      console.log('Opened:', notification);
    }
  );

  // Send fcmToken to your backend
  useEffect(() => {
    if (fcmToken) {
      // POST to your API
      sendTokenToBackend(fcmToken);
    }
  }, [fcmToken]);
}
```

## Sending Notifications from Backend

### Using Firebase Admin SDK (Node.js)

```javascript
const admin = require('firebase-admin');

// Send to specific device
await admin.messaging().send({
  token: userFcmToken,
  notification: {
    title: 'New Ride Request',
    body: 'You have a new ride request from John',
  },
  data: {
    rideId: '12345',
    screen: '/(booking)/ride',
  },
  android: {
    priority: 'high',
  },
  apns: {
    payload: {
      aps: {
        sound: 'default',
      },
    },
  },
});
```

### Using REST API

```bash
curl -X POST https://fcm.googleapis.com/v1/projects/via-car-1c79a/messages:send \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "USER_FCM_TOKEN",
      "notification": {
        "title": "New Ride Request",
        "body": "You have a new ride request"
      },
      "data": {
        "rideId": "12345",
        "screen": "/(booking)/ride"
      }
    }
  }'
```

## Topic Subscriptions

Subscribe users to topics for broadcast notifications:

```typescript
import { NotificationService } from '@/services/notificationService';

// Subscribe to driver notifications
await NotificationService.subscribeToTopic('drivers');

// Subscribe to rider notifications
await NotificationService.subscribeToTopic('riders');

// Unsubscribe
await NotificationService.unsubscribeFromTopic('drivers');
```

Send to topic from backend:

```javascript
await admin.messaging().send({
  topic: 'drivers',
  notification: {
    title: 'System Update',
    body: 'New features available!',
  },
});
```

## Next Steps

1. **iOS Setup** (if not done):
   - Add `GoogleService-Info.plist` to `ios/` directory
   - Enable Push Notifications capability in Xcode
   - Upload APNs certificate to Firebase Console

2. **Android Setup** (already done):
   - `google-services.json` is already in `android/app/`

3. **Backend Integration**:
   - Create an API endpoint to receive and store FCM tokens
   - Update `src/app/_layout.tsx` to send token to your backend
   - Implement notification sending logic in your backend

4. **Test Notifications**:
   - Use Firebase Console to send test notifications
   - Test foreground, background, and quit states

## Testing

### From Firebase Console
1. Go to Firebase Console > Cloud Messaging
2. Click "Send your first message"
3. Enter title and body
4. Click "Send test message"
5. Paste your FCM token (logged in console)

### Programmatically
```typescript
// Test local notification
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Test Notification',
    body: 'This is a test',
    data: { screen: '/(tabs)/pickup' },
  },
  trigger: null,
});
```

## Troubleshooting

### Notifications not received
- Check permissions are granted
- Verify FCM token is generated
- Check Firebase Console for delivery status
- Ensure google-services.json is up to date

### iOS notifications not working
- Verify APNs certificate is uploaded to Firebase
- Check Push Notifications capability is enabled
- Ensure GoogleService-Info.plist is added

### Android notifications not working
- Verify google-services.json is in android/app/
- Check POST_NOTIFICATIONS permission is granted (Android 13+)
- Rebuild the app after adding google-services.json

## Rebuild Required

After this setup, you need to rebuild your native apps:

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

For EAS Build:
```bash
eas build --platform android
eas build --platform ios
```
