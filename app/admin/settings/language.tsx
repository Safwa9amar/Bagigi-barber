import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminLanguage() {
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const languages = [
        { id: 'en', label: 'English', detail: 'United States', flag: '🇺🇸' },
        { id: 'fr', label: 'Français', detail: 'France', flag: '🇫🇷' },
        { id: 'ar', label: 'العربية', detail: 'Algeria', flag: '🇩🇿' },
    ];

    const changeLanguage = async (code: string) => {
        try {
            await i18n.changeLanguage(code);
            await AsyncStorage.setItem("user-language", code);
            // No need for alert if it's instant, but helps feedback
        } catch (error) {
            Alert.alert("Error", "Failed to change language");
        }
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]">
            <View className="pt-14 px-5 pb-6 bg-white dark:bg-[#0F0F0F] flex-row items-center border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1E1E1E] items-center justify-center">
                    <Ionicons name="arrow-back" size={20} color="#1A1A1A" className="dark:text-white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-black text-[#1A1A1A] dark:text-white">{t("settings.language.title")}</Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{t("settings.language.subtitle")}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest ml-1 mb-4">{t("settings.language.select")}</Text>

                {languages.map((lang) => (
                    <TouchableOpacity
                        key={lang.id}
                        onPress={() => changeLanguage(lang.id)}
                        className={`flex-row items-center p-5 bg-white dark:bg-[#1E1E1E] mb-3 rounded-[24px] border shadow-sm ${i18n.language === lang.id ? 'border-[#C5A35D]' : 'border-gray-100 dark:border-gray-800'}`}
                    >
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${i18n.language === lang.id ? 'bg-[#C5A35D]10' : 'bg-gray-50 dark:bg-[#121212]'}`} style={{ backgroundColor: i18n.language === lang.id ? '#C5A35D15' : undefined }}>
                            <Text style={{ fontSize: 20 }}>{lang.flag}</Text>
                        </View>
                        <View className="flex-1 ml-4">
                            <Text className={`text-sm font-black ${i18n.language === lang.id ? 'text-[#C5A35D]' : 'text-[#1A1A1A] dark:text-white'}`}>
                                {lang.label}
                            </Text>
                            <Text className="text-gray-400 text-[10px] font-bold mt-0.5">{lang.detail}</Text>
                        </View>
                        {i18n.language === lang.id && <Ionicons name="checkmark-circle" size={20} color="#C5A35D" />}
                    </TouchableOpacity>
                ))}

                <View className="mt-8 p-5 bg-[#C5A35D]10 rounded-[24px] border border-[#C5A35D]20" style={{ backgroundColor: '#C5A35D08' }}>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="globe-outline" size={20} color="#C5A35D" />
                        <Text className="ml-2 text-[#C5A35D] font-black text-xs uppercase tracking-widest">{t("profile.language")}</Text>
                    </View>
                    <Text className="text-gray-500 dark:text-gray-400 text-[11px] font-bold leading-5">
                        {t("settings.language.info")}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
