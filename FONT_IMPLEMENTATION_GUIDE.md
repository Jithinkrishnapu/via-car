# Font Implementation Guide

This guide explains how the dynamic font system has been implemented in your ViaCar app to automatically switch between Arabic (Cairo) and English (Kanit) fonts based on the current language.

## What's Been Implemented

### 1. Global Font System
- **CSS Variables**: Added `--font-primary` and `--font-secondary` CSS custom properties that change based on language
- **Automatic Switching**: Fonts automatically switch when language changes
- **Tailwind Integration**: Updated Tailwind config to use CSS variables for font families

### 2. Components Created

#### FontProvider (`src/components/providers/FontProvider.tsx`)
- Manages global font switching
- Updates HTML lang attribute for web platform
- Automatically integrated into the app layout

#### Enhanced Text Component (`src/components/common/text.tsx`)
- Now accepts `fontWeight` prop ('light', 'regular', 'medium', 'bold')
- Automatically applies correct font based on current language
- Maintains existing functionality while adding font switching

#### Font Utilities (`src/utils/fontUtils.ts`)
- `getFontClass()`: Get Tailwind classes for specific language/weight
- `replaceFontClasses()`: Replace hardcoded font classes with dynamic ones
- `getFontStyle()`: Get React Native style objects for fonts

#### HOC for Dynamic Fonts (`src/components/hoc/withDynamicFont.tsx`)
- `withDynamicFont()`: HOC to wrap components for automatic font switching
- `useDynamicFont()`: Hook for manual font class replacement

### 3. Font Configuration

#### Tailwind Config Updates
```javascript
fontFamily: {
  sans: ["var(--font-primary)", "Kanit", ...],
  alt: ["var(--font-secondary)", "Cairo", ...],
}
```

#### Global CSS Updates
```css
:root {
  --font-primary: 'Kanit', ui-sans-serif, system-ui, sans-serif;
  --font-secondary: 'Inter', ui-sans-serif, system-ui, sans-serif;
}

html[lang="ar"] {
  --font-primary: 'Cairo', ui-sans-serif, system-ui, sans-serif;
  --font-secondary: 'Cairo', ui-sans-serif, system-ui, sans-serif;
}
```

## How to Use

### 1. Using the Enhanced Text Component
```tsx
import Text from '@/components/common/text';

// Basic usage (automatically applies correct font)
<Text fontSize={16}>Hello World</Text>

// With font weight
<Text fontSize={16} fontWeight="medium">Bold Text</Text>
<Text fontSize={14} fontWeight="light">Light Text</Text>
```

### 2. Using Font Utilities in Custom Components
```tsx
import { useDynamicFont } from '@/components/hoc/withDynamicFont';

function MyComponent() {
  const { replaceFontClasses, isArabic } = useDynamicFont();
  
  const className = replaceFontClasses("text-lg font-[Kanit-Medium]");
  
  return <div className={className}>Dynamic Font Text</div>;
}
```

### 3. Using HOC for Existing Components
```tsx
import { withDynamicFont } from '@/components/hoc/withDynamicFont';

const MyComponent = ({ className }) => (
  <div className={className}>Content</div>
);

export default withDynamicFont(MyComponent);
```

### 4. Manual Font Class Replacement
```tsx
import { getFontClass } from '@/utils/fontUtils';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  const fontClass = getFontClass(i18n.language, 'medium');
  
  return <div className={`text-lg ${fontClass}`}>Text</div>;
}
```

## Migration Guide

### For Existing Components

#### Replace Hardcoded Font Classes
**Before:**
```tsx
<Text className="font-[Kanit-Medium] text-lg">Hello</Text>
```

**After:**
```tsx
<Text fontSize={18} fontWeight="medium">Hello</Text>
```

#### For Components with className
**Before:**
```tsx
<div className="text-lg font-[Kanit-Regular]">Content</div>
```

**After:**
```tsx
import { useDynamicFont } from '@/components/hoc/withDynamicFont';

function MyComponent() {
  const { replaceFontClasses } = useDynamicFont();
  const className = replaceFontClasses("text-lg font-[Kanit-Regular]");
  
  return <div className={className}>Content</div>;
}
```

### Automatic Migration
The system includes utilities to automatically replace common font patterns:
- `font-[Kanit-Light]` → `font-sans font-light` (English) / `font-alt font-light` (Arabic)
- `font-[Kanit-Regular]` → `font-sans font-normal` (English) / `font-alt font-normal` (Arabic)
- `font-[Kanit-Medium]` → `font-sans font-medium` (English) / `font-alt font-medium` (Arabic)

## Font Families Used

### English (Default)
- **Primary**: Kanit (Light, Regular, Medium, Bold)
- **Secondary**: Inter

### Arabic
- **Primary**: Cairo (Light, Regular, Medium, Bold)
- **Secondary**: Cairo

## Testing

1. **Language Switching**: Change language in app settings and verify fonts switch
2. **Web Platform**: Check that HTML lang attribute updates
3. **React Native**: Verify fonts display correctly on mobile
4. **RTL Support**: Ensure RTL layout works with Arabic fonts

## Troubleshooting

### Fonts Not Switching
1. Check if FontProvider is properly wrapped around the app
2. Verify CSS variables are being updated in browser dev tools
3. Ensure font files are properly loaded

### Performance Issues
1. Font switching is optimized to use CSS variables
2. No re-rendering of components when language changes
3. Fonts are cached by the browser/platform

### Missing Fonts
1. Ensure Cairo and Kanit fonts are properly installed/loaded
2. Check font file paths in your project
3. Verify font names match exactly in CSS

## Next Steps

1. **Test thoroughly** with both languages
2. **Update remaining components** to use the new Text component
3. **Add font loading optimization** if needed
4. **Consider adding more font weights** if required by design

The font system is now fully implemented and ready to use throughout your application!