import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { Slot, Redirect, useNavigation } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, I18nManager } from "react-native";

const AuthLayout = () => {
  const { user, _hasHydrated } = useAuthStore();
  const { i18n } = useTranslation();
  const navigation = useNavigation();

  // 1. Wait for Zustand to hydrate from AsyncStorage before making any
  //    navigation decisions — avoids flashing the login screen on Android.
  if (!_hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#C5A35D" />
      </View>
    );
  }

  // 2. Authenticated user: send to their role-specific screen.
  if (user) {
    const route =
      user.role === "ADMIN"
        ? "/admin"
        : user.role === "USER"
          ? "/customer/home"
          : "/guest";
    return <Redirect href={route} />;
  }

  // 3. Guest with no navigation history = cold start landed here (Android issue).
  //    Redirect to home so guests can browse without logging in.
  //    If canGoBack() is true the guest intentionally pressed "Login / Register",
  //    so we fall through and show the auth screens normally.
  if (!navigation.canGoBack()) {
    return <Redirect href="/customer/home" />;
  }

  const changeLanguage = async (lang: string) => {
    if (i18n.language === lang) return;
    await i18n.changeLanguage(lang);
    const isRTL = lang === "ar";
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  };

  return (
    <View style={{ flex: 1 }}>
      <View className="absolute top-12 right-6 z-50 flex-row bg-gray-100 dark:bg-[#1E1E1E] rounded-full p-1 border border-gray-200 dark:border-gray-800">
        {["en", "fr", "ar"].map((lang) => (
          <TouchableOpacity
            key={lang}
            onPress={() => changeLanguage(lang)}
            className={`px-3 py-1.5 rounded-full ${i18n.language === lang ? "bg-[#C5A35D]" : "bg-transparent"}`}
          >
            <Text
              className={`text-xs font-bold uppercase ${i18n.language === lang ? "text-white" : "text-gray-500 dark:text-gray-400"}`}
            >
              {lang}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Slot />
    </View>
  );
};

export default AuthLayout;

