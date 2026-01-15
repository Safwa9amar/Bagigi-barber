import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function Notifications() {
    const router = useRouter();
    const { t } = useTranslation();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [promoEnabled, setPromoEnabled] = useState(false);

    const NotificationItem = ({
        label,
        icon,
        value,
        onValueChange,
    }: {
        label: string;
        icon: any;
        value: boolean;
        onValueChange: (v: boolean) => void;
    }) => (
        <View className="flex-row items-center p-5 bg-white dark:bg-[#1E1E1E] mb-3 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
            <View
                className="w-10 h-10 rounded-full items-center justify-center bg-[#C5A35D]10"
                style={{ backgroundColor: "#C5A35D10" }}
            >
                <Ionicons name={icon} size={20} color="#C5A35D" />
            </View>
            <Text className="flex-1 ml-4 text-sm font-black text-[#1A1A1A] dark:text-white">
                {label}
            </Text>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: "#333", true: "#C5A35D" }}
                thumbColor={value ? "#fff" : "#f4f3f4"}
            />
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]">
            {/* Header */}
            <View className="pt-14 px-5 pb-6 bg-white dark:bg-[#0F0F0F] flex-row items-center border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-4 w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1E1E1E] items-center justify-center"
                >
                    <Ionicons
                        name="arrow-back"
                        size={20}
                        color="#1A1A1A"
                        className="dark:text-white"
                    />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-black text-[#1A1A1A] dark:text-white">
                        {t("settings.notifications.title")}
                    </Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                        {t("profile.notifications") || "Manage Alerts"}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest ml-1 mb-4">
                    {t("settings.notifications.preferences") || "Preferences"}
                </Text>

                <NotificationItem
                    label={t("settings.notifications.push")}
                    icon="notifications-outline"
                    value={pushEnabled}
                    onValueChange={setPushEnabled}
                />
                <NotificationItem
                    label={t("settings.notifications.email")}
                    icon="mail-outline"
                    value={emailEnabled}
                    onValueChange={setEmailEnabled}
                />
                <NotificationItem
                    label={t("settings.notifications.promo")}
                    icon="gift-outline"
                    value={promoEnabled}
                    onValueChange={setPromoEnabled}
                />

                <View
                    className="mt-6 p-5 rounded-[24px] bg-[#C5A35D10] border border-[#C5A35D20]"
                    style={{ backgroundColor: "#C5A35D10" }}
                >
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="information-circle-outline" size={20} color="#C5A35D" />
                        <Text className="ml-2 text-[#C5A35D] font-black text-[10px] uppercase tracking-widest">
                            {t("common.info") || "Information"}
                        </Text>
                    </View>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs leading-5">
                        {t("settings.notifications.info") ||
                            "Choose which notifications you wish to receive. We recommend keeping push notifications on for important booking updates."}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
