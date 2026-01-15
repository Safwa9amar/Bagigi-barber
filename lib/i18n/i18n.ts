import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { I18nManager } from "react-native";
import * as SecureStore from 'expo-secure-store';
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";
import "intl-pluralrules";

const resources = {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
};

const LANGUAGE_KEY = 'user-language';

const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: async (callback: (lang: string) => void) => {
        try {
            const savedLanguage = await SecureStore.getItemAsync(LANGUAGE_KEY);
            if (savedLanguage) {
                if (savedLanguage === 'ar') {
                    I18nManager.allowRTL(true);
                    if (!I18nManager.isRTL) {
                        I18nManager.forceRTL(true);
                    }
                } else {
                    I18nManager.allowRTL(false);
                    if (I18nManager.isRTL) {
                        I18nManager.forceRTL(false);
                    }
                }
                callback(savedLanguage);
                return;
            }
        } catch (error) {
            console.log('Error reading language', error);
        }

        // Fallback to device locale
        const locales = getLocales();
        const deviceLanguage = locales[0]?.languageCode || "en";
        const isRTL = locales[0]?.textDirection === 'rtl';

        if (isRTL) {
            I18nManager.allowRTL(true);
            I18nManager.forceRTL(true);
            callback("ar");
        } else {
            // Check if device language is supported, else default to English
            const supportedLanguages = ['en', 'fr', 'ar'];
            callback(supportedLanguages.includes(deviceLanguage) ? deviceLanguage : "en");
        }
    },
    init: () => { },
    cacheUserLanguage: async (language: string) => {
        try {
            await SecureStore.setItemAsync(LANGUAGE_KEY, language);
        } catch (error) {
            console.log('Error saving language', error);
        }
    }
};

i18n
    .use(initReactI18next)
    .use(languageDetector as any)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
        compatibilityJSON: 'v3',
        react: {
            useSuspense: false // simple handling for now
        }
    });

export default i18n;
