import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function HelpCenter() {
    const router = useRouter();
    const { t } = useTranslation();

    const faqs = t("support.helpCenter.faqs", { returnObjects: true }) as Array<{ q: string; a: string }>;

    return (
        <View style={styles.container} className="bg-background-light dark:bg-background-dark">
            <View style={styles.header} className="bg-white dark:bg-background-muted shadow-sm dark:shadow-none">
                <TouchableOpacity onPress={() => router.replace('/customer/Profile')} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} className="color-typography-900 dark:color-typography-white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} className="text-typography-900 dark:text-typography-white">{t("support.helpCenter.title")}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionHeader}>{t("support.helpCenter.faqTitle")}</Text>
                {Array.isArray(faqs) && faqs.map((item, index) => (
                    <View key={index} style={styles.card} className="bg-white dark:bg-background-muted border-outline-300 dark:border-gray-800">
                        <Text style={styles.question} className="text-typography-900 dark:text-typography-white">{item.q}</Text>
                        <Text style={styles.answer}>{item.a}</Text>
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
    sectionHeader: { color: '#D4AF37', fontSize: 16, marginBottom: 15, fontWeight: '600' },
    card: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
    },
    question: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    answer: { color: '#9CA3AF', fontSize: 14, lineHeight: 20 }
});
