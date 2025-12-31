# Notifications API Integration

## Overview
Complete integration of the notifications API with the existing UI. The system now fetches real notifications from your backend API and provides full CRUD functionality.

## API Integration Details

### Base URL
```
http://localhost:8000/api/notifications
```

### Authentication
All API calls include the Bearer token from AsyncStorage:
```typescript
Authorization: `Bearer ${token}`
```

## Files Created/Modified

### New Files
1. **`src/service/notifications.tsx`** - API service layer
2. **`src/hooks/useNotifications.ts`** - Custom hook for notification management

### Modified Files
1. **`src/hooks/useNotificationStore.ts`** - Updated to match API response structure
2. **`src/app/notifications.tsx`** - Integrated with real API data
3. **`src/components/ui/notification-badge.tsx`** - Uses real unread count
4. **`src/lib/en.ts` & `src/lib/ar.ts`** - Added missing translations

## API Endpoints Implemented

### 1. Get Notifications
```typescript
GET /api/notifications?page=1&per_page=10&type=1
```

**Parameters:**
- `page` (optional): Page number for pagination
- `per_page` (optional): Number of notifications per page
- `type` (optional): Filter by notification type

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Your ride from Riyadh to Jeddah has been confirmed.",
      "body": "You're all set! Please be ready at your selected pickup point on time for a smooth journey.",
      "type": 1,
      "type_name": "Ride Confirmation",
      "is_read": false,
      "created_at": "2024-01-15T08:00:00Z",
      "updated_at": "2024-01-15T08:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 25,
    "last_page": 3,
    "has_more_pages": true,
    "from": 1,
    "to": 10
  }
}
```

### 2. Mark Notification as Read
```typescript
POST /api/notifications/{id}/read
```

### 3. Mark All Notifications as Read
```typescript
POST /api/notifications/mark-all-read
```

### 4. Get Unread Count
```typescript
GET /api/notifications/unread-count
```

## Usage Examples

### Basic Usage in Components
```typescript
import { useNotificationData } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markNotificationAsRead,
  } = useNotificationData();

  // Notifications are automatically loaded on mount
  // Use the data in your component
}
```

### Manual API Calls
```typescript
import { getNotifications, markNotificationAsRead } from '@/service/notifications';

// Fetch notifications with parameters
const response = await getNotifications({
  page: 1,
  per_page: 10,
  type: 1
});

// Mark notification as read
await markNotificationAsRead(notificationId);
```

## Features Implemented

### 1. Real-time Data Loading
- Automatic loading on app start
- Pull-to-refresh functionality
- Infinite scroll pagination
- Loading states and error handling

### 2. Notification Management
- Mark individual notifications as read
- Mark all notifications as read
- Real-time unread count updates
- Proper error handling with retry options

### 3. UI Enhancements
- Loading indicators during API calls
- Error messages with retry buttons
- Pull-to-refresh support
- Infinite scroll for pagination
- Empty state handling

### 4. Notification Types
The system supports different notification types:
- **Type 1**: Ride Confirmation (🔔 blue background)
- **Type 2**: Ride Completion (✅ green background)  
- **Type 3**: Ride Cancellation (❌ red background)

### 5. Navigation Integration
- Tapping notifications navigates to relevant screens
- Notification badge shows real unread count
- Proper routing from multiple entry points

## State Management

### Zustand Store Structure
```typescript
interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  currentPage: number;
  totalPages: number;
  hasMorePages: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setNotifications: (notifications: NotificationItem[]) => void;
  addNotifications: (notifications: NotificationItem[]) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  // ... more actions
}
```

### API Response Interface
```typescript
interface NotificationItem {
  id: number;
  title: string;
  body: string;
  type: number;
  type_name: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}
```

## Error Handling

The system includes comprehensive error handling:

1. **Network Errors**: Automatic retry with user feedback
2. **Authentication Errors**: Handled by existing error handler
3. **API Errors**: Display error messages with retry options
4. **Loading States**: Show appropriate loading indicators

## Performance Optimizations

1. **Pagination**: Load notifications in chunks to improve performance
2. **Caching**: Store notifications in Zustand for quick access
3. **Lazy Loading**: Only load notifications when needed
4. **Optimistic Updates**: Update UI immediately for better UX

## Testing the Integration

### 1. API Testing
Test the API endpoints using curl:

```bash
# Get notifications
curl -X 'GET' \
  'http://localhost:8000/api/notifications?page=1&per_page=10&type=1' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Mark as read
curl -X 'POST' \
  'http://localhost:8000/api/notifications/1/read' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### 2. UI Testing
1. Navigate to Profile → Account → Notifications
2. Test pull-to-refresh functionality
3. Test infinite scroll by scrolling to bottom
4. Tap notifications to test navigation
5. Test in both English and Arabic languages

## Troubleshooting

### Common Issues

1. **No notifications loading**
   - Check API endpoint is accessible
   - Verify authentication token is valid
   - Check network connectivity

2. **Pagination not working**
   - Verify `has_more_pages` in API response
   - Check scroll event handling

3. **Unread count not updating**
   - Ensure mark-as-read API calls are successful
   - Check store state updates

### Debug Information
The system logs detailed information for debugging:
- API request/response details
- Error messages and stack traces
- Store state changes

## Next Steps

1. **Push Notification Integration**: Connect with FCM to add new notifications to store
2. **Background Sync**: Implement background notification fetching
3. **Notification Settings**: Add user preferences for notification types
4. **Deep Linking**: Implement deep links from push notifications

The integration is now complete and production-ready!