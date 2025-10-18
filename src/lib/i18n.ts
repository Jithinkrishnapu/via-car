import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en";
import ar from "./ar";

const resources = {
  en: { translation: en, index: en.login, components: en.components },
  ar: { translation: ar, index: ar.index,    components: ar.components },
};

/* ---------- helpers ---------- */
const getSavedLanguage = async () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem("language");
  } else {
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      return await AsyncStorage.getItem("language");
    } catch {
      return null;
    }
  }
};

const setSavedLanguage = async (lng: string) => {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem("language", lng);
  } else {
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.setItem("language", lng);
    } catch {}
  }
};

/* ---------- init ---------- */
(async () => {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: "en",               // ← ALWAYS start in English
      fallbackLng: "en",
      ns: ["translation", "index", "components"],
      defaultNS: "translation",
      interpolation: { escapeValue: false },
    });

  i18n.on("languageChanged", (lng) => {
    setSavedLanguage(lng);    // persist choice for later sessions
    if (typeof window !== "undefined" && window.document) {
      window.document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    } else {
      try {
        const { I18nManager, Platform } = require("react-native");
        if (Platform.OS !== "web") I18nManager.forceRTL(lng === "ar");
      } catch {}
    }
  });
})();

export default i18n;