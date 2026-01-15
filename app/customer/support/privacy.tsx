import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function Privacy() {
    const router = useRouter();
    const { t } = useTranslation();

    const sections = t("support.privacy.sections", { returnObjects: true }) as Array<{ title: string; content: string }>;

    return (
        <View style={styles.container} className="bg-background-light dark:bg-background-dark">
            <View style={styles.header} className="bg-white dark:bg-background-muted shadow-sm dark:shadow-none">
                <TouchableOpacity onPress={() => router.replace('/customer/Profile')} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} className="color-typography-900 dark:color-typography-white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} className="text-typography-900 dark:text-typography-white">{t("support.privacy.title")}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.intro} className="text-typography-900 dark:text-typography-white">{t("support.privacy.intro")}</Text>
                <View style={{ height: 20 }} />
                {Array.isArray(sections) && sections.map((section, index) => (
                    <View key={index} style={{ marginBottom: 20 }}>
                        <Text style={styles.heading} className="text-typography-900 dark:text-typography-white">{section.title}</Text>
                        <Text style={styles.text}>{section.content}</Text>
                    </View>
                ))}
            </ScrollView>
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
    intro: { fontSize: 16, marginBottom: 10 },
    heading: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    text: { color: '#9CA3AF', fontSize: 14, lineHeight: 22 }
});
