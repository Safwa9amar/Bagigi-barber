import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function PersonalInfo() {
    const { user } = useAuthStore();
    const router = useRouter();
    const { t } = useTranslation();

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");

    const handleSave = () => {
        // Ideally call API to update profile here
        Alert.alert(t("common.notice"), t("common.saveSuccess") || "Profile information updated.");
        router.back();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header} className="bg-white dark:bg-background-muted">
                <TouchableOpacity onPress={() => router.replace('/customer/Profile')} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} className="text-typography-900 dark:text-typography-white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} className="text-typography-900 dark:text-typography-white">{t("settings.personalInfo.title")}</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveText}>{t("common.save")}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label} className="text-typography-500 dark:text-typography-400">{t("settings.personalInfo.name")}</Text>
                    <TextInput
                        style={styles.input}
                        className="bg-gray-100 dark:bg-[#1A1A1A] text-typography-900 dark:text-typography-white border-outline-300"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#666"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label} className="text-typography-500 dark:text-typography-400">{t("settings.personalInfo.email")}</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        className="bg-gray-200 dark:bg-[#1A1A1A] text-typography-500 dark:text-typography-400 border-outline-300"
                        value={email}
                        editable={false}
                    />
                    <Text style={styles.helperText}>Email cannot be changed.</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label} className="text-typography-500 dark:text-typography-400">{t("settings.personalInfo.phone")}</Text>
                    <TextInput
                        style={styles.input}
                        className="bg-gray-100 dark:bg-[#1A1A1A] text-typography-900 dark:text-typography-white border-outline-300"
                        value={phone}
                        onChangeText={setPhone}
                        placeholderTextColor="#666"
                        keyboardType="phone-pad"
                    />
                </View>
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
    saveText: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
    content: { padding: 20 },
    inputGroup: { marginBottom: 25 },
    label: { marginBottom: 8, fontSize: 14 },
    input: {
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16
    },
    disabledInput: { opacity: 0.6 },
    helperText: { color: '#666', fontSize: 12, marginTop: 5 }
});
