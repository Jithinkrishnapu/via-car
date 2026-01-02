# API Error Handling Implementation Guide

## Overview

This guide documents the comprehensive error handling system implemented across all API calls in the ViaCar app. The system provides consistent, user-friendly error messages and proper error propagation.

## Key Features

✅ **Comprehensive Error Handling**: All service functions now properly handle HTTP errors, network issues, and validation errors
✅ **User-Friendly Messages**: Different error types show appropriate alert messages
✅ **Consistent API Response Format**: Standardized error checking across all services
✅ **Proper Error Propagation**: Errors are thrown to be handled by calling components
✅ **Network & Timeout Handling**: Specific handling for connection and timeout issues
✅ **Validation Error Support**: Proper handling of backend validation errors

## Updated Services

### 1. Authentication Service (`src/service/auth.tsx`)
- `handleSendOtp()` - Send OTP with error handling
- `handleVerifyOtp()` - Verify OTP with error handling  
- `handleRegister()` - User registration with error handling
- `handleLogOut()` - Logout with error handling
- `handleVerifyId()` - ID verification with error handling
- `useGetProfileDetails()` - Get profile with error handling
- `getUserStatus()` - Get user status with error handling

### 2. Payment Service (`src/service/payment.ts`)
- `useAuthorizePayment()` - Enhanced payment authorization
- `getPaymentStatus()` - Payment status checking

### 3. Profile Service (`src/service/profile.ts`)
- `useUpdateProfileDetails()` - Profile updates with error handling
- `useGetBankDetails()` - Bank details retrieval
- `useGetTransactions()` - Transaction history with pagination

### 4. Vehicle Service (`src/service/vehicle.tsx`)
- `getBrandList()` - Vehicle brands with error handling
- `getModelList()` - Vehicle models with error handling
- `getVehicleList()` - User vehicles with error handling
- `getVehicleCategoryList()` - Vehicle categories
- `addVehicle()` - Add vehicle with error handling
- `updateVehicle()` - Update vehicle with error handling
- `deleteVehicle()` - Delete vehicle with error handling

### 5. Ride Booking Service (`src/service/ride-booking.tsx`)
- `useCreateRide()` - Create ride with comprehensive error handling
- `useEditRide()` - Edit ride with error handling
- `useGetRideDetails()` - Get ride details
- `useCreateBooking()` - Create booking with error handling
- `searchRide()` - Search rides with error handling
- `placeRoutes()` - Get routes with error handling
- `rideAlert()` - Create ride alerts
- `getRecommendedPrice()` - Get pricing recommendations
- All other booking and ride management functions

### 6. Common Service (`src/service/common.tsx`)
- `usePlacesAutocomplete()` - Places autocomplete with error handling

## Error Handling Utility (`src/utils/apiErrorHandler.ts`)

### Core Functions

#### `apiRequest<T>(url: string, options: RequestInit)`
Enhanced fetch wrapper with comprehensive error handling:
- Handles JSON parsing errors
- Manages non-JSON responses (HTML error pages)
- Provides consistent error format
- Handles network and timeout errors

#### `handleApiError(error: any, context?: string)`
Shows user-friendly error alerts based on error type:
- **400**: Invalid Request - "Please check your input and try again"
- **401**: Authentication Error - "Please log in again to continue"
- **403**: Access Denied - "You do not have permission to perform this action"
- **404**: Not Found - "The requested resource was not found"
- **422**: Validation Error - Shows specific validation messages
- **429**: Too Many Requests - "Please wait a moment before trying again"
- **500**: Server Error - "Something went wrong on our end"
- **502/503/504**: Service Unavailable - "Service temporarily unavailable"

#### `extractValidationErrors(error: any)`
Extracts validation errors from API responses and formats them for display.

#### `showValidationErrors(error: any)`
Shows validation errors in user-friendly format with Alert.

## Usage Examples

### Basic API Call with Error Handling

```typescript
import { handleApiError } from '@/utils/apiErrorHandler';
import { handleSendOtp } from '@/service/auth';

const sendOtp = async () => {
  try {
    setLoading(true);
    const result = await handleSendOtp(formData);
    // Handle success
    console.log('OTP sent successfully:', result);
  } catch (error) {
    // Error is automatically shown to user via Alert
    handleApiError(error, 'Send OTP');
  } finally {
    setLoading(false);
  }
};
```

### Advanced Error Handling with Custom Logic

```typescript
import { extractValidationErrors } from '@/utils/apiErrorHandler';
import { useCreateRide } from '@/service/ride-booking';

const createRide = async () => {
  try {
    setLoading(true);
    const result = await useCreateRide(rideData);
    
    if (result.ok) {
      // Success - navigate or show success message
      router.push('/success');
    }
  } catch (error: any) {
    // Handle specific error types
    if (error.status === 422) {
      // Show validation errors
      const validationErrors = extractValidationErrors(error);
      Alert.alert('Validation Error', validationErrors.join('\n'));
    } else if (error.status === 401) {
      // Handle authentication error
      Alert.alert('Session Expired', 'Please log in again');
      router.push('/login');
    } else {
      // Generic error handling
      handleApiError(error, 'Create Ride');
    }
  } finally {
    setLoading(false);
  }
};
```

### Payment Error Handling Example

```typescript
import { handleApiError, showValidationErrors } from '@/utils/apiErrorHandler';
import { useAuthorizePayment } from '@/service/payment';

const processPayment = async () => {
  try {
    setLoading(true);
    const response = await useAuthorizePayment(paymentData);
    
    // Check for specific payment errors
    if (response?.error || response?.status === 'error') {
      Alert.alert('Payment Error', response?.message || 'Payment failed');
      return;
    }
    
    // Check for validation errors
    if (response?.errors && Array.isArray(response.errors)) {
      showValidationErrors({ body: { errors: response.errors } });
      return;
    }
    
    // Success handling
    if (response?.result?.code === '000.100.110') {
      Alert.alert('Success', 'Payment processed successfully!');
    }
    
  } catch (error) {
    handleApiError(error, 'Payment Processing');
  } finally {
    setLoading(false);
  }
};
```

## Error Types Handled

### 1. Network Errors
- No internet connection
- DNS resolution failures
- Connection timeouts

### 2. HTTP Status Errors
- 400-499: Client errors (validation, authentication, etc.)
- 500-599: Server errors (internal server error, service unavailable)

### 3. Response Format Errors
- Invalid JSON responses
- HTML error pages instead of JSON
- Empty responses

### 4. Validation Errors
- Field-specific validation messages
- Multiple validation errors
- Custom validation rules

### 5. Authentication Errors
- Expired tokens
- Invalid credentials
- Permission denied

## Best Practices

### 1. Always Use Try-Catch
```typescript
try {
  const result = await apiFunction();
  // Handle success
} catch (error) {
  handleApiError(error, 'Context Description');
}
```

### 2. Provide Context
Always provide context when handling errors:
```typescript
handleApiError(error, 'User Registration');
handleApiError(error, 'Load Vehicle List');
```

### 3. Handle Loading States
```typescript
const [loading, setLoading] = useState(false);

const performAction = async () => {
  try {
    setLoading(true);
    await apiFunction();
  } catch (error) {
    handleApiError(error);
  } finally {
    setLoading(false); // Always reset loading state
  }
};
```

### 4. Custom Error Handling for Specific Cases
```typescript
try {
  const result = await apiFunction();
} catch (error: any) {
  if (error.status === 401) {
    // Handle authentication specifically
    router.push('/login');
  } else {
    // Use generic error handling
    handleApiError(error);
  }
}
```

## Migration Notes

### Before (Old Pattern)
```typescript
export const oldApiFunction = async (data) => {
  try {
    const response = await fetch(url, options);
    return response.json(); // ❌ No error checking
  } catch (error) {
    console.log("api error", error); // ❌ Only logging
  }
}
```

### After (New Pattern)
```typescript
export const newApiFunction = async (data): Promise<any> => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error: any) {
    console.error("API function error:", error);
    throw error; // ✅ Propagate error to caller
  }
}
```

## Testing Error Handling

### 1. Network Errors
- Turn off internet connection
- Test timeout scenarios

### 2. Server Errors
- Test with invalid API endpoints
- Test with malformed requests

### 3. Validation Errors
- Submit forms with invalid data
- Test field-specific validations

### 4. Authentication Errors
- Test with expired tokens
- Test with invalid credentials

## Summary

The comprehensive error handling system provides:

1. **Consistent Error Experience**: All API calls now handle errors uniformly
2. **User-Friendly Messages**: Clear, actionable error messages for users
3. **Developer-Friendly Debugging**: Detailed error logging for development
4. **Robust Error Recovery**: Proper error propagation and handling
5. **Network Resilience**: Handles connection issues gracefully
6. **Validation Support**: Clear display of validation errors

All service functions now throw errors that should be caught and handled by the calling components using the provided error handling utilities.