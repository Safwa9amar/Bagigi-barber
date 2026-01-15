import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminSettings() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert(
            t("profile.logoutConfirm") || "Logout",
            t("profile.logoutConfirmMessage") || "Are you sure you want to logout?",
            [
                { text: t("common.cancel") || "Cancel", style: "cancel" },
                {
                    text: t("profile.logout") || "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace("/login");
                    }
                },
            ]
        );
    };

    const SettingItem = ({ icon, label, onPress, color = "#1A1A1A", detail }: { icon: any, label: string, onPress: () => void, color?: string, detail?: string }) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center p-5 bg-white dark:bg-[#1E1E1E] mb-3 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800"
        >
            <View className="w-10 h-10 rounded-full items-center justify-center bg-[#C5A35D]10" style={{ backgroundColor: '#C5A35D10' }}>
                <Ionicons name={icon} size={20} color="#C5A35D" />
            </View>
            <View className="flex-1 ml-4">
                <Text className="text-sm font-black text-[#1A1A1A] dark:text-white">{label}</Text>
                {detail && <Text className="text-gray-400 text-[10px] font-bold mt-0.5">{detail}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]">
            <View className="pt-14 px-5 pb-6 bg-white dark:bg-[#0F0F0F]">
                <Text className="text-2xl font-black text-[#1A1A1A] dark:text-white mb-2">{t("tabs.settings") || "Settings"}</Text>
                <Text className="text-gray-400 font-bold text-xs">{t("admin.settings.manageDesc") || "Manage your business and account"}</Text>
            </View>

            <ScrollView className="flex-1 pt-4 px-4" showsVerticalScrollIndicator={false}>
                <View className="mb-8">
                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest ml-1 mb-3">{t("admin.settings.shopManagement")}</Text>
                    <SettingItem
                        icon="time-outline"
                        label={t("admin.settings.workingHours")}
                        detail={t("admin.settings.workingHoursDesc")}
                        onPress={() => router.push("/admin/settings/hours")}
                    />
                    <SettingItem
                        icon="cut-outline"
                        label={t("tabs.services")}
                        detail={t("admin.settings.servicesDesc")}
                        onPress={() => router.push("/admin/services")}
                    />
                </View>

                <View className="mb-8">
                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest ml-1 mb-3">{t("admin.settings.account")}</Text>
                    <SettingItem
                        icon="person-outline"
                        label={t("settings.personalInfo.title")}
                        detail={user?.email}
                        onPress={() => router.push("/admin/settings/profile")}
                    />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        label={t("admin.settings.security")}
                        detail={t("admin.settings.securityDesc")}
                        onPress={() => { }}
                    />
                </View>

                <View className="mb-8">
                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest ml-1 mb-3">{t("admin.settings.appPreferences")}</Text>
                    <SettingItem
                        icon="color-palette-outline"
                        label={t("settings.appearance.title")}
                        detail={t("settings.appearance.subtitle")}
                        onPress={() => router.push("/admin/settings/appearance")}
                    />
                    <SettingItem
                        icon="language-outline"
                        label={t("settings.language.title")}
                        detail={t("settings.language.subtitle")}
                        onPress={() => router.push("/admin/settings/language")}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center p-5 bg-white dark:bg-[#1E1E1E] mb-20 rounded-[24px] shadow-sm border border-red-50 dark:border-red-900/10"
                >
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-red-50 dark:bg-red-900/10">
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    </View>
                    <Text className="flex-1 ml-4 text-sm font-black text-red-500">{t("profile.logout") || "Logout"}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#EF444490" />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
