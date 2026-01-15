import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, I18nManager } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as Updates from "expo-updates";

export default function Language() {
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const languages = [
        { code: "en", label: "English", flag: "flag-outline", isRTL: false },
        { code: "fr", label: "Français", flag: "flag-outline", isRTL: false },
        { code: "ar", label: "العربية", flag: "flag-outline", isRTL: true },
    ];

    const changeLanguage = async (lang: { code: string; isRTL: boolean }) => {
        if (i18n.language === lang.code) return;

        await i18n.changeLanguage(lang.code);
        I18nManager.allowRTL(lang.isRTL);
        I18nManager.forceRTL(lang.isRTL);

        Alert.alert(
            t("settings.language.title"),
            t("settings.language.restart") || "App needs to restart to apply RTL changes.",
            [
                {
                    text: "OK",
                    onPress: async () => {
                        try {
                            await Updates.reloadAsync();
                        } catch (e) {
                            console.log("Reload app manually");
                        }
                    },
                },
            ]
        );
    };

    const LanguageItem = ({
        label,
        code,
        flag,
        isSelected,
        onPress,
    }: {
        label: string;
        code: string;
        flag: any;
        isSelected: boolean;
        onPress: () => void;
    }) => (
        <TouchableOpacity
            onPress={onPress}
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
                    name={flag}
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
                        {t("settings.language.title")}
                    </Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                        {t("profile.language") || "Language Selection"}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <SectionTitle title={t("settings.language.select") || "Select Language"} />

                {languages.map((lang) => (
                    <LanguageItem
                        key={lang.code}
                        label={lang.label}
                        code={lang.code}
                        flag={lang.flag}
                        isSelected={i18n.language === lang.code}
                        onPress={() => changeLanguage(lang)}
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
                        {t("settings.language.info") ||
                            "Changing the language will instantly translate the entire interface to your preferred language."}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest ml-1 mb-4">
        {title}
    </Text>
);
