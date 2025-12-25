import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

/**
 * FontProvider component that manages global font switching based on language
 * This component updates the HTML lang attribute for web and manages font switching
 */
export function FontProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update HTML lang attribute for web platform
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  return <>{children}</>;
}

export default FontProvider;