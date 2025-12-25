/**
 * Font utility functions for dynamic font switching
 */

/**
 * Get the appropriate font class based on language and weight
 * @param language - Current language ('en' or 'ar')
 * @param weight - Font weight ('light', 'regular', 'medium', 'bold')
 * @returns Tailwind font class
 */
export function getFontClass(language: string, weight: 'light' | 'regular' | 'medium' | 'bold' = 'regular'): string {
  const isArabic = language === 'ar';
  
  if (isArabic) {
    // Use Cairo font for Arabic
    switch (weight) {
      case 'light':
        return 'font-alt font-light';
      case 'regular':
        return 'font-alt font-normal';
      case 'medium':
        return 'font-alt font-medium';
      case 'bold':
        return 'font-alt font-bold';
      default:
        return 'font-alt font-normal';
    }
  } else {
    // Use Kanit font for English
    switch (weight) {
      case 'light':
        return 'font-sans font-light';
      case 'regular':
        return 'font-sans font-normal';
      case 'medium':
        return 'font-sans font-medium';
      case 'bold':
        return 'font-sans font-bold';
      default:
        return 'font-sans font-normal';
    }
  }
}

/**
 * Replace hardcoded Kanit font classes with dynamic font classes
 * @param className - Original className string
 * @param language - Current language
 * @returns Updated className string
 */
export function replaceFontClasses(className: string, language: string): string {
  const isArabic = language === 'ar';
  
  // Replace specific Kanit font classes
  let updatedClassName = className
    .replace(/font-\[Kanit-Light\]/g, isArabic ? 'font-alt font-light' : 'font-sans font-light')
    .replace(/font-\[Kanit-Regular\]/g, isArabic ? 'font-alt font-normal' : 'font-sans font-normal')
    .replace(/font-\[Kanit-Medium\]/g, isArabic ? 'font-alt font-medium' : 'font-sans font-medium')
    .replace(/font-\[Kanit-Bold\]/g, isArabic ? 'font-alt font-bold' : 'font-sans font-bold');
  
  return updatedClassName;
}

/**
 * Get font style object for React Native StyleSheet
 * @param language - Current language
 * @param weight - Font weight
 * @returns Style object with fontFamily
 */
export function getFontStyle(language: string, weight: 'light' | 'regular' | 'medium' | 'bold' = 'regular') {
  const isArabic = language === 'ar';
  
  if (isArabic) {
    switch (weight) {
      case 'light':
        return { fontFamily: 'Cairo-Light' };
      case 'regular':
        return { fontFamily: 'Cairo-Regular' };
      case 'medium':
        return { fontFamily: 'Cairo-Medium' };
      case 'bold':
        return { fontFamily: 'Cairo-Bold' };
      default:
        return { fontFamily: 'Cairo-Regular' };
    }
  } else {
    switch (weight) {
      case 'light':
        return { fontFamily: 'Kanit-Light' };
      case 'regular':
        return { fontFamily: 'Kanit-Regular' };
      case 'medium':
        return { fontFamily: 'Kanit-Medium' };
      case 'bold':
        return { fontFamily: 'Kanit-Bold' };
      default:
        return { fontFamily: 'Kanit-Regular' };
    }
  }
}