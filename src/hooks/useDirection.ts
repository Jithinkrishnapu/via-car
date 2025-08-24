import { useTranslation } from "react-i18next";
import { I18nManager, Platform } from "react-native";
import { useEffect } from "react";

export function useDirection() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // On language change, update I18nManager (for React Native) and document.dir (for web)
  useEffect(() => {
    if (Platform.OS !== "web") {
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
        // Optionally, reload the app if needed for direction change
      }
    } else {
      if (typeof document !== "undefined") {
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
      }
    }
  }, [isRTL]);

  // Helper to swap values
  function swap<T>(ltrValue: T, rtlValue: T): T {
    return isRTL ? rtlValue : ltrValue;
  }

  return { isRTL, swap };
}
