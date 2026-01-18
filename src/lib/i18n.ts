import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager, Platform } from "react-native";
import en from "./en";
import ar from "./ar";

const resources = {
  en: { translation: en, components: en.components, profile: en.profile, booking: en.booking },
  ar: { translation: ar, components: ar.components, profile: ar.profile, booking: ar.booking },
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

/* ---------- RTL handler ---------- */
const updateRTL = (lng: string) => {
  const isRTL = lng === "ar";
  
  if (typeof window !== "undefined" && window.document) {
    // Web platform
    window.document.documentElement.dir = isRTL ? "rtl" : "ltr";
    window.document.documentElement.lang = lng;
    
    // Update CSS custom properties for font switching
    const root = window.document.documentElement;
    if (lng === "ar") {
      root.style.setProperty('--font-primary', "'Cairo', ui-sans-serif, system-ui, sans-serif");
      root.style.setProperty('--font-secondary', "'Cairo', ui-sans-serif, system-ui, sans-serif");
    } else {
      root.style.setProperty('--font-primary', "'Kanit', ui-sans-serif, system-ui, sans-serif");
      root.style.setProperty('--font-secondary', "'Inter', ui-sans-serif, system-ui, sans-serif");
    }
  } else if (Platform.OS !== "web") {
    // React Native platform
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }
  }
};

/* ---------- init ---------- */
let isInitialized = false;

const initI18n = async () => {
  if (isInitialized) return;
  
  const savedLang = await getSavedLanguage();
  const initialLang = "en"; // Force English
  
  // Set RTL before i18n initialization
  updateRTL(initialLang);
  
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLang,
      fallbackLng: "en",
      ns: ["translation", "components", "profile", "booking"],
      defaultNS: "translation",
      interpolation: { escapeValue: false },
      react: {
        useSuspense: false,
      },
    });

  i18n.on("languageChanged", (lng) => {
    setSavedLanguage(lng);
    updateRTL(lng);
  });
  
  isInitialized = true;
};

// Initialize immediately
initI18n();

export default i18n;
export { initI18n };