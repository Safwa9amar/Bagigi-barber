import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";

export default function Appearance() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colorScheme, setColorScheme } = useColorScheme();

    const options = [
        { label: t("settings.appearance.system"), value: "system", icon: "phone-portrait-outline" },
        { label: t("settings.appearance.light"), value: "light", icon: "sunny-outline" },
        { label: t("settings.appearance.dark"), value: "dark", icon: "moon-outline" },
    ];

    const AppearanceItem = ({
        label,
        value,
        icon,
        isSelected,
    }: {
        label: string;
        value: string;
        icon: any;
        isSelected: boolean;
    }) => (
        <TouchableOpacity
            onPress={() => setColorScheme(value as "light" | "dark" | "system")}
            className={`flex-row items-center p-5 bg-white dark:bg-[#1E1E1E] mb-3 rounded-[24px] shadow-sm border ${isSelected
                    ? "border-[#C5A35D]"
                    : "border-gray-100 dark:border-gray-800"
                }`}
        >
            <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: isSelected ? "#C5A35D20" : "#C5A35D10" }}
            >
                <Ionicons
                    name={icon}
                    size={20}
                    color={isSelected ? "#C5A35D" : "#9CA3AF"}
                />
            </View>
            <Text
                className={`flex-1 ml-4 text-sm font-black ${isSelected ? "text-[#C5A35D]" : "text-[#1A1A1A] dark:text-white"
                    }`}
            >
                {label}
            </Text>
            {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color="#C5A35D" />
            )}
        </TouchableOpacity>
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
                        {t("settings.appearance.title")}
                    </Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                        {t("profile.appearance") || "App Theme"}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest ml-1 mb-4">
                    {t("settings.appearance.subtitle") || "Choose your preference"}
                </Text>

                {options.map((option) => (
                    <AppearanceItem
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        icon={option.icon}
                        isSelected={colorScheme === option.value}
                    />
                ))}

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
                        {t("settings.appearance.info") ||
                            "Changing the appearance will affect how the application looks for you. You can choose between light, dark, or system default themes."}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
