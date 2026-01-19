import { View, Text } from "react-native";
import React, { useCallback } from "react";
import { Slot, useFocusEffect, useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, I18nManager } from "react-native";

const AuthLayout = () => {
  const { user } = useAuthStore();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      router.replace(
        user.role === "ADMIN"
          ? "/admin"
          : user.role === "USER"
            ? "/customer/home"
            : "/guest"
      );
    }, [user])
  );
  const { i18n, t } = useTranslation();

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
