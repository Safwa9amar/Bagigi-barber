import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminProfile() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user, setUser } = useAuthStore();

    const [name, setName] = useState(user?.email.split('@')[0] || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            // In a real app, we would call an API to update the profile
            // For now, we simulate success and update the local store if needed
            // Actually, since this is a management app, we assume the user role is ADMIN
            setTimeout(() => {
                Alert.alert("Success", "Profile updated successfully");
                setLoading(false);
            }, 1000);
        } catch (e) {
            Alert.alert("Error", "Failed to update profile");
            setLoading(false);
        }
    };

    const InputField = ({ label, value, onChangeText, icon, placeholder, keyboardType = 'default' }: { label: string, value: string, onChangeText: (v: string) => void, icon: any, placeholder: string, keyboardType?: any }) => (
        <View className="mb-6">
            <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest ml-1 mb-2">{label}</Text>
            <View className="flex-row items-center bg-white dark:bg-[#1E1E1E] px-4 py-4 rounded-[20px] shadow-sm border border-gray-100 dark:border-gray-800">
                <Ionicons name={icon} size={20} color="#C5A35D" />
                <TextInput
                    className="flex-1 ml-3 text-sm font-bold text-[#1A1A1A] dark:text-white"
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                />
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View className="pt-14 px-5 pb-6 bg-white dark:bg-[#0F0F0F] flex-row items-center border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1E1E1E] items-center justify-center">
                    <Ionicons name="arrow-back" size={20} color="#1A1A1A" className="dark:text-white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-black text-[#1A1A1A] dark:text-white">{t("settings.personalInfo.title")}</Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{t("admin.profile.personalInfo") || "Personal Information"}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="items-center mb-8">
                    <View className="w-24 h-24 rounded-full bg-[#C5A35D]20 items-center justify-center relative shadow-sm" style={{ backgroundColor: '#C5A35D15' }}>
                        <Ionicons name="person" size={48} color="#C5A35D" />
                        <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 bg-[#C5A35D] rounded-full items-center justify-center border-2 border-white dark:border-[#0F0F0F]">
                            <Ionicons name="camera" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-lg font-black text-[#1A1A1A] dark:text-white mt-4">{name}</Text>
                    <Text className="text-gray-400 font-bold text-xs">{t("admin.profile.admin") || "Administrator"}</Text>
                </View>

                <InputField
                    label={t("settings.personalInfo.name")}
                    value={name}
                    onChangeText={setName}
                    icon="person-outline"
                    placeholder="Your Name"
                />
                <InputField
                    label={t("settings.personalInfo.email")}
                    value={email}
                    onChangeText={setEmail}
                    icon="mail-outline"
                    placeholder="your@email.com"
                    keyboardType="email-address"
                />
                <InputField
                    label={t("settings.personalInfo.phone")}
                    value={phone}
                    onChangeText={setPhone}
                    icon="call-outline"
                    placeholder="+213 000 000 000"
                    keyboardType="phone-pad"
                />

                <View className="h-10" />

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    className="bg-[#C5A35D] p-5 rounded-[24px] items-center justify-center shadow-lg shadow-[#C5A35D]/40"
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-black text-sm uppercase tracking-widest">{t("settings.personalInfo.update") || "Update Profile"}</Text>
                    )}
                </TouchableOpacity>

                <View className="h-20" />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
