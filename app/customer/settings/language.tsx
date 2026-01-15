import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, I18nManager, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as Updates from 'expo-updates';

export default function Language() {
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const languages = [
        { code: 'en', label: 'English', isRTL: false },
        { code: 'fr', label: 'Français', isRTL: false },
        { code: 'ar', label: 'العربية', isRTL: true },
    ];

    const changeLanguage = async (lang: { code: string; isRTL: boolean }) => {
        await i18n.changeLanguage(lang.code);

        // Always enforce RTL settings and restart to align with user request
        I18nManager.allowRTL(lang.isRTL);
        I18nManager.forceRTL(lang.isRTL);

        Alert.alert(
            t("settings.language.title"),
            t("settings.language.restart"),
            [
                {
                    text: "OK",
                    onPress: async () => {
                        try {
                            await Updates.reloadAsync();
                        } catch (e) {
                            console.log("Reload app manually");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container} className="bg-background-light dark:bg-background-dark">
            <View style={styles.header} className="bg-white dark:bg-background-muted shadow-sm dark:shadow-none">
                <TouchableOpacity onPress={() => router.replace('/customer/Profile')} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} className="color-typography-900 dark:color-typography-white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} className="text-typography-900 dark:text-typography-white">{t("settings.language.title")}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {languages.map(lang => (
                    <TouchableOpacity
                        key={lang.code}
                        className="flex-row justify-between items-center py-5 border-b border-outline-300 dark:border-outline-300"
                        onPress={() => changeLanguage(lang)}
                    >
                        <Text className={`text-base text-typography-900 dark:text-typography-white ${i18n.language === lang.code ? 'font-bold' : ''}`}>
                            {lang.label}
                        </Text>
                        {i18n.language === lang.code && (
                            <Ionicons name="checkmark" size={20} color="#D4AF37" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },
});
