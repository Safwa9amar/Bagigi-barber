import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";

export default function AdminAppearance() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colorScheme, setColorScheme } = useColorScheme();

    const themes = [
        { id: 'light', label: t("settings.appearance.light"), icon: 'sunny-outline' },
        { id: 'dark', label: t("settings.appearance.dark"), icon: 'moon-outline' },
        { id: 'system', label: t("settings.appearance.system"), icon: 'settings-outline' },
    ];

    return (
        <View className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]">
            <View className="pt-14 px-5 pb-6 bg-white dark:bg-[#0F0F0F] flex-row items-center border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1E1E1E] items-center justify-center">
                    <Ionicons name="arrow-back" size={20} color="#1A1A1A" className="dark:text-white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-black text-[#1A1A1A] dark:text-white">{t("settings.appearance.title")}</Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{t("settings.appearance.subtitle")}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest ml-1 mb-4">{t("profile.appearance")}</Text>

                {themes.map((theme) => (
                    <TouchableOpacity
                        key={theme.id}
                        onPress={() => setColorScheme(theme.id as any)}
                        className={`flex-row items-center p-5 bg-white dark:bg-[#1E1E1E] mb-3 rounded-[24px] border shadow-sm ${colorScheme === theme.id ? 'border-[#C5A35D]' : 'border-gray-100 dark:border-gray-800'}`}
                    >
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${colorScheme === theme.id ? 'bg-[#C5A35D]10' : 'bg-gray-50 dark:bg-[#121212]'}`} style={{ backgroundColor: colorScheme === theme.id ? '#C5A35D15' : undefined }}>
                            <Ionicons name={theme.icon as any} size={20} color={colorScheme === theme.id ? "#C5A35D" : "#9CA3AF"} />
                        </View>
                        <Text className={`flex-1 ml-4 text-sm font-black ${colorScheme === theme.id ? 'text-[#C5A35D]' : 'text-[#1A1A1A] dark:text-white'}`}>
                            {theme.label}
                        </Text>
                        {colorScheme === theme.id && <Ionicons name="checkmark-circle" size={20} color="#C5A35D" />}
                    </TouchableOpacity>
                ))}

                <View className="mt-8 p-5 bg-[#C5A35D]10 rounded-[24px] border border-[#C5A35D]20" style={{ backgroundColor: '#C5A35D08' }}>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="information-circle-outline" size={20} color="#C5A35D" />
                        <Text className="ml-2 text-[#C5A35D] font-black text-xs uppercase tracking-widest">{t("admin.dashboard.proTip")}</Text>
                    </View>
                    <Text className="text-gray-500 dark:text-gray-400 text-[11px] font-bold leading-5">
                        {t("settings.appearance.info")}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
