// i18n.ts
// Simple translation system for English and French
import enNavigation from "@/locales/en/navigation.json";
import enLogin from "@/locales/en/login.json";

export const translations = {
  en: {
    navigation: enNavigation,
    login: enLogin,
    // Add more types as needed
  },
};

export type Language = keyof typeof translations;

// Simple language selector (could be improved with context or device locale)
export let currentLanguage: Language = "en";
export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
};

// Helper to flatten all translation objects for a language
function getFlatTranslations(lang: Language): Record<string, string> {
  const langObj = translations[lang];
  return Object.values(langObj).reduce(
    (acc, obj) => ({
      ...acc,
      ...obj,
    }),
    {}
  );
}

// Usage: t("home")
export function t(key: string) {
  const flat = getFlatTranslations(currentLanguage);
  return flat[key] || key;
}
