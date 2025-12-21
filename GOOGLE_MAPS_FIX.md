# Google Maps iOS Fix & Geocoding Rate Limit Solution

## Issues Fixed

### 1. Google Maps SDK Not Working on iOS
**Problem**: Google Maps was working on Android but failing on iOS.

**Root Causes**:
- Missing `GoogleService-Info.plist` file referenced in `app.json`
- Duplicate API key configuration causing conflicts
- API key configured in 3 different places

**Solution**:
- ✅ Removed Firebase dependency from `app.json` (not needed for Google Maps only)
- ✅ Removed duplicate `GMSApiKey` from `Info.plist`
- ✅ Kept single API key initialization in `AppDelegate.swift`
- ✅ Rebuilt iOS project with `pod install`

### 2. Geocoding Rate Limit Exceeded
**Problem**: "Geocoding rate limit exceeded - too many requests" error when using the map.

**Root Cause**:
- `reverseGeocodeAsync` was called on every map drag/movement
- No rate limiting or caching implemented
- Multiple simultaneous requests overwhelming the API

**Solution**:
- ✅ Created centralized `GeocodingService` with built-in rate limiting
- ✅ Implemented debouncing (800ms delay after user stops dragging)
- ✅ Added caching to avoid repeated requests for same location
- ✅ Graceful fallback to coordinates when geocoding fails
- ✅ Rate limit: minimum 1 second between requests

## Files Modified

### Configuration Files
- `app.json` - Removed `googleServicesFile` reference
- `ios/ViaCar/Info.plist` - Removed duplicate `GMSApiKey`

### New Files
- `src/services/geocodingService.ts` - Centralized geocoding service with rate limiting

### Updated Components
- `src/components/common/location-picker-component.tsx` - Uses new geocoding service with debouncing
- `src/components/common/location-search.tsx` - Added error handling for geocoding failures

## How It Works

### Geocoding Service Features

1. **Rate Limiting**: Enforces minimum 1 second between API requests
2. **Caching**: Stores results for 5 minutes to avoid duplicate requests
3. **Debouncing**: Waits 800ms after user stops dragging before geocoding
4. **Fallback**: Shows coordinates if geocoding fails or rate limit is hit
5. **Singleton Pattern**: Single instance shared across all components

### Usage Example

```typescript
import { geocodingService } from '@/services/geocodingService';

const result = await geocodingService.reverseGeocode(latitude, longitude);
console.log(result.address); // Formatted address or coordinates
console.log(result.success); // true if geocoding succeeded
```

## Testing

1. **iOS Build**: Successfully builds and runs on iOS simulator
2. **Map Display**: Google Maps loads correctly on iOS
3. **Location Picker**: Debounced geocoding prevents rate limit errors
4. **Fallback**: Shows coordinates when geocoding fails

## API Key Configuration

Current configuration (single source of truth):
- **Location**: `ios/ViaCar/AppDelegate.swift`
- **Method**: `GMSServices.provideAPIKey("YOUR_API_KEY")`
- **Android**: `android/app/src/main/AndroidManifest.xml` (meta-data tag)

## Rate Limit Best Practices

1. **Don't geocode on every map movement** - Use debouncing
2. **Cache results** - Avoid repeated requests for same location
3. **Implement fallbacks** - Show coordinates when geocoding fails
4. **Use centralized service** - Consistent rate limiting across app
5. **Monitor usage** - Check Google Cloud Console for quota usage

## Future Improvements

- [ ] Implement exponential backoff for failed requests
- [ ] Add offline caching with AsyncStorage
- [ ] Monitor and log geocoding quota usage
- [ ] Consider using Google Places API for better address formatting
- [ ] Add user feedback when rate limit is hit

## Related Documentation

- [Google Maps Platform Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
