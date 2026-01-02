import { I18nManager, Platform, Alert } from "react-native";
import i18n from "./i18n";

/**
 * Changes the app language with proper RTL handling
 * @param newLanguage - The language code to switch to ('en' or 'ar')
 * @param onComplete - Optional callback after language change
 */
export const changeLanguage = async (
  newLanguage: string,
  onComplete?: () => void
) => {
  try {
    const isRTL = newLanguage === "ar";
    
    // Change language in i18n
    await i18n.changeLanguage(newLanguage);
    
    // Update RTL settings
    if (Platform.OS !== "web") {
      const currentRTL = I18nManager.isRTL;
      
      if (currentRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        
        // On React Native, RTL changes require app reload
        if (Platform.OS === "android" || Platform.OS === "ios") {
          Alert.alert(
            i18n.t("profile.Language"),
            i18n.t("App needs to restart to apply language changes"),
            [
              {
                text: i18n.t("profile.ok"),
                onPress: () => {
                  // Reload the app
                  if (Platform.OS === "android") {
                    const { DevSettings } = require("react-native");
                    DevSettings.reload();
                  }
                  // For iOS, user needs to manually restart
                }
              }
            ]
          );
        }
      }
    } else {
      // Web platform - update document direction
      if (typeof document !== "undefined") {
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
        document.documentElement.lang = newLanguage;
      }
    }
    
    // Call completion callback
    if (onComplete) {
      setTimeout(onComplete, 100);
    }
  } catch (error) {
    console.error("Error changing language:", error);
  }
};

/**
 * Gets the current language display name
 */
export const getCurrentLanguageName = (): string => {
  return i18n.language === "ar" ? "العربية" : "English";
};

/**
 * Gets the opposite language code
 */
export const getOppositeLanguage = (): string => {
  return i18n.language === "en" ? "ar" : "en";
};

/**
 * Gets the opposite language display name
 */
export const getOppositeLanguageName = (): string => {
  return i18n.language === "en" ? "العربية" : "English";
};
