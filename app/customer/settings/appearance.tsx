import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";

export default function Appearance() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colorScheme, setColorScheme } = useColorScheme();

    const options = [
        { label: t("settings.appearance.system"), value: 'system' },
        { label: t("settings.appearance.light"), value: 'light' },
        { label: t("settings.appearance.dark"), value: 'dark' },
    ];

    return (
        <View style={styles.container} className="bg-background-light dark:bg-background-dark">
            <View style={styles.header} className="bg-white dark:bg-background-muted">
                <TouchableOpacity onPress={() => router.replace('/customer/Profile')} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} className="color-typography-900 dark:color-typography-white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} className="text-typography-900 dark:text-typography-white">{t("settings.appearance.title")}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        className="flex-row justify-between items-center py-5 border-b border-outline-300"
                        onPress={() => setColorScheme(option.value as 'light' | 'dark' | 'system')}
                    >
                        <Text className="text-base text-typography-900 dark:text-typography-white">
                            {option.label}
                        </Text>
                        {colorScheme === option.value && (
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
