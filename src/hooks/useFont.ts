import { useTranslation } from "react-i18next";

export type FontWeight = 'light' | 'regular' | 'medium' | 'bold';

export function useFont() {
  const { i18n } = useTranslation();
  
  const isArabic = i18n.language === 'ar';
  
  /**
   * Get the appropriate font family based on current language and weight
   */
  const getFont = (weight: FontWeight = 'regular'): string => {
    if (isArabic) {
      // Arabic fonts (Cairo family)
      switch (weight) {
        case 'light':
          return 'font-alt'; // Cairo Light
        case 'regular':
          return 'font-alt'; // Cairo Regular
        case 'medium':
          return 'font-alt'; // Cairo Medium
        case 'bold':
          return 'font-alt'; // Cairo Bold
        default:
          return 'font-alt';
      }
    } else {
      // English fonts (Kanit family)
      switch (weight) {
        case 'light':
          return 'font-sans'; // Kanit Light
        case 'regular':
          return 'font-sans'; // Kanit Regular
        case 'medium':
          return 'font-sans'; // Kanit Medium
        case 'bold':
          return 'font-sans'; // Kanit Bold
        default:
          return 'font-sans';
      }
    }
  };

  /**
   * Get font class with specific weight for current language
   */
  const getFontClass = (weight: FontWeight = 'regular'): string => {
    const baseFont = getFont(weight);
    
    if (isArabic) {
      // For Arabic, use Cairo with appropriate weight
      switch (weight) {
        case 'light':
          return `${baseFont} font-light`;
        case 'regular':
          return `${baseFont} font-normal`;
        case 'medium':
          return `${baseFont} font-medium`;
        case 'bold':
          return `${baseFont} font-bold`;
        default:
          return `${baseFont} font-normal`;
      }
    } else {
      // For English, use Kanit with appropriate weight
      switch (weight) {
        case 'light':
          return `${baseFont} font-light`;
        case 'regular':
          return `${baseFont} font-normal`;
        case 'medium':
          return `${baseFont} font-medium`;
        case 'bold':
          return `${baseFont} font-bold`;
        default:
          return `${baseFont} font-normal`;
      }
    }
  };

  return {
    isArabic,
    getFont,
    getFontClass,
    // Convenience methods for common weights
    light: getFontClass('light'),
    regular: getFontClass('regular'),
    medium: getFontClass('medium'),
    bold: getFontClass('bold'),
  };
}