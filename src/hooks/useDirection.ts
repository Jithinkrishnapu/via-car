import { useTranslation } from "react-i18next";
import { I18nManager, Platform } from "react-native";
import { useEffect, useState } from "react";

export function useDirection() {
  const { i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(i18n.language === "ar");

  // Sync RTL state with language changes
  useEffect(() => {
    const newIsRTL = i18n.language === "ar";
    setIsRTL(newIsRTL);

    // Update platform-specific RTL settings
    if (Platform.OS !== "web") {
      if (I18nManager.isRTL !== newIsRTL) {
        I18nManager.allowRTL(newIsRTL);
        I18nManager.forceRTL(newIsRTL);
      }
    } else {
      if (typeof document !== "undefined") {
        document.documentElement.dir = newIsRTL ? "rtl" : "ltr";
        document.documentElement.lang = i18n.language;
      }
    }
  }, [i18n.language]);

  // Helper to swap values based on direction
  function swap<T>(ltrValue: T, rtlValue: T): T {
    return isRTL ? rtlValue : ltrValue;
  }

  return { isRTL, swap };
}
