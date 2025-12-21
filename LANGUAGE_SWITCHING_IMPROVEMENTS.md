# Language Switching Improvements

## Overview
Fixed RTL (Right-to-Left) switching and timing issues for smooth language transitions between English and Arabic.

## Changes Made

### 1. Enhanced i18n Configuration (`src/lib/i18n.ts`)
- Added proper initialization with saved language preference
- Separated RTL update logic into dedicated `updateRTL()` function
- Added `I18nManager.allowRTL()` for better RTL support
- Implemented proper async initialization with `initI18n()` export
- Added `react.useSuspense: false` to prevent rendering issues
- Set document language attribute for better accessibility

### 2. Improved useDirection Hook (`src/hooks/useDirection.ts`)
- Added state management for RTL to ensure proper re-renders
- Synchronized RTL state with language changes using useEffect
- Added `I18nManager.allowRTL()` before `forceRTL()` for stability
- Set document language attribute on web platform
- Improved swap function reliability

### 3. Created Language Utilities (`src/lib/languageUtils.ts`)
New utility functions for smooth language switching:
- `changeLanguage()` - Handles language change with proper RTL updates
- `getCurrentLanguageName()` - Returns current language display name
- `getOppositeLanguage()` - Returns opposite language code
- `getOppositeLanguageName()` - Returns opposite language display name
- Includes app reload prompt for React Native when RTL changes

### 4. Updated Root Layout (`src/app/_layout.tsx`)
- Added i18n initialization before app renders
- Added loading state to wait for i18n readiness
- Prevents rendering issues during language initialization
- Imported Platform and I18nManager for proper setup

### 5. Enhanced User Profile Screen (`src/app/(tabs)/user-profile.tsx`)
- Added language switcher button in Account tab
- Shows current language with display name
- Confirmation dialog before language change
- Uses new language utility functions
- Refreshes profile after language change
- Smooth transition with proper timing

### 6. Added Missing Translations
Added to both `en.ts` and `ar.ts`:
- Bank Account / الحساب البنكي
- Transactions / المعاملات
- Terms & Conditions / الشروط والأحكام
- Privacy Policy / سياسة الخصوصية
- Delete Vehicle / حذف المركبة
- Select Vehicle / اختر المركبة
- Language / اللغة
- Select Language / اختر اللغة
- App needs to restart message

### 7. Fixed Screens Not Using Translations
- `src/app/(publish)/dropoff-selected.tsx` - Fixed vehicle selection text
- `src/app/(publish)/add-city.tsx` - Fixed "Add a new city" text
- `src/app/(publish)/edit-city.tsx` - Fixed "Add a new city" text

## How It Works

### Language Switching Flow:
1. User taps Language option in Profile > Account tab
2. Confirmation dialog shows with target language name
3. On confirmation, `changeLanguage()` is called
4. Language is changed in i18n
5. RTL settings are updated for platform
6. On React Native, app reload prompt appears (if RTL changed)
7. On Web, direction changes immediately
8. Profile refreshes to show updated UI

### RTL Handling:
- **Web**: Updates `document.documentElement.dir` and `lang` attributes
- **React Native**: Uses `I18nManager.allowRTL()` and `forceRTL()`
- **Android/iOS**: Prompts for app reload when RTL changes (required by platform)

## Benefits

1. **Smooth Transitions**: Proper timing and state management prevent UI glitches
2. **Persistent Language**: Language preference saved and restored on app restart
3. **Proper RTL Support**: Full RTL layout support for Arabic
4. **User Confirmation**: Prevents accidental language changes
5. **Better UX**: Shows current language and provides clear feedback
6. **Platform Optimized**: Different handling for Web vs Native platforms
7. **Type Safe**: Full TypeScript support with proper types

## Testing Recommendations

1. Test language switching on both Web and Native platforms
2. Verify RTL layout changes correctly for Arabic
3. Check that language preference persists after app restart
4. Test all screens to ensure translations are working
5. Verify icons and UI elements flip correctly in RTL mode
6. Test with different screen sizes and orientations

## Future Improvements

1. Add more languages (e.g., French, Spanish)
2. Implement language detection based on device settings
3. Add smooth animations during language transitions
4. Create language selection screen for first-time users
5. Add language-specific fonts for better typography
