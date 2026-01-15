import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function Notifications() {
    const router = useRouter();
    const { t } = useTranslation();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [promoEnabled, setPromoEnabled] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.header} className="bg-white dark:bg-background-muted">
                <TouchableOpacity onPress={() => router.replace('/customer/Profile')} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} className="text-typography-900 dark:text-typography-white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} className="text-typography-900 dark:text-typography-white">{t("settings.notifications.title")}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.item} className="border-outline-300">
                    <Text style={styles.itemText} className="text-typography-900 dark:text-typography-white">{t("settings.notifications.push")}</Text>
                    <Switch
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                        trackColor={{ false: "#333", true: "#D4AF37" }}
                        thumbColor={pushEnabled ? "#fff" : "#f4f3f4"}
                    />
                </View>
                <View style={styles.item} className="border-outline-300">
                    <Text style={styles.itemText} className="text-typography-900 dark:text-typography-white">{t("settings.notifications.email")}</Text>
                    <Switch
                        value={emailEnabled}
                        onValueChange={setEmailEnabled}
                        trackColor={{ false: "#333", true: "#D4AF37" }}
                        thumbColor={emailEnabled ? "#fff" : "#f4f3f4"}
                    />
                </View>
                <View style={styles.item} className="border-outline-300">
                    <Text style={styles.itemText} className="text-typography-900 dark:text-typography-white">{t("settings.notifications.promo")}</Text>
                    <Switch
                        value={promoEnabled}
                        onValueChange={setPromoEnabled}
                        trackColor={{ false: "#333", true: "#D4AF37" }}
                        thumbColor={promoEnabled ? "#fff" : "#f4f3f4"}
                    />
                </View>
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
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    itemText: { fontSize: 16 }
});
