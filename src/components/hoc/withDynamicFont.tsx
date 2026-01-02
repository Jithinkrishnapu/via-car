import React from 'react';
import { useTranslation } from 'react-i18next';
import { replaceFontClasses } from '@/utils/fontUtils';

/**
 * Higher-order component that automatically replaces hardcoded font classes
 * with language-appropriate font classes
 */
export function withDynamicFont<P extends { className?: string }>(
  WrappedComponent: React.ComponentType<P>
) {
  return function DynamicFontComponent(props: P) {
    const { i18n } = useTranslation();
    
    // Replace font classes in className if it exists
    const updatedProps = {
      ...props,
      ...(props.className && {
        className: replaceFontClasses(props.className, i18n.language)
      })
    };
    
    return <WrappedComponent {...updatedProps} />;
  };
}

/**
 * Hook to get dynamic font classes based on current language
 */
export function useDynamicFont() {
  const { i18n } = useTranslation();
  
  return {
    language: i18n.language,
    isArabic: i18n.language === 'ar',
    replaceFontClasses: (className: string) => replaceFontClasses(className, i18n.language),
  };
}