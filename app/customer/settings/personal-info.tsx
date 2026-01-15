import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function PersonalInfo() {
    const { user } = useAuthStore();
    const router = useRouter();
    const { t } = useTranslation();

    const [name, setName] = useState(user?.name || "");
    const [email] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            // Simulate API call
            setTimeout(() => {
                Alert.alert(t("common.notice"), t("common.saveSuccess") || "Profile updated successfully");
                setLoading(false);
                router.back();
            }, 1000);
        } catch (e) {
            Alert.alert(t("common.error"), "Failed to update profile");
            setLoading(false);
        }
    };

    const InputField = ({
        label,
        value,
        onChangeText,
        icon,
        placeholder,
        keyboardType = "default",
        editable = true,
    }: {
        label: string;
        value: string;
        onChangeText?: (v: string) => void;
        icon: any;
        placeholder: string;
        keyboardType?: any;
        editable?: boolean;
    }) => (
        <View className="mb-6">
            <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest ml-1 mb-2">
                {label}
            </Text>
            <View
                className={`flex-row items-center bg-white dark:bg-[#1E1E1E] px-4 py-4 rounded-[20px] shadow-sm border border-gray-100 dark:border-gray-800 ${!editable ? "opacity-60" : ""
                    }`}
            >
                <Ionicons name={icon} size={20} color="#C5A35D" />
                <TextInput
                    className="flex-1 ml-3 text-sm font-bold text-[#1A1A1A] dark:text-white"
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    editable={editable}
                />
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
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
                        {t("settings.personalInfo.title")}
                    </Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                        {t("profile.personalInfo") || "Personal Information"}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="items-center mb-8">
                    <View
                        className="w-24 h-24 rounded-full items-center justify-center relative shadow-sm"
                        style={{ backgroundColor: "#C5A35D15" }}
                    >
                        <Ionicons name="person" size={48} color="#C5A35D" />
                        <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 bg-[#C5A35D] rounded-full items-center justify-center border-2 border-white dark:border-[#0F0F0F]">
                            <Ionicons name="camera" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-lg font-black text-[#1A1A1A] dark:text-white mt-4">
                        {name || user?.email?.split("@")[0]}
                    </Text>
                    <Text className="text-gray-400 font-bold text-xs">
                        {t("profile.customer") || "Customer"}
                    </Text>
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
                    icon="mail-outline"
                    placeholder="your@email.com"
                    keyboardType="email-address"
                    editable={false}
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
                        <Text className="text-white font-black text-sm uppercase tracking-widest">
                            {t("settings.personalInfo.update") || "Update Profile"}
                        </Text>
                    )}
                </TouchableOpacity>

                <View className="h-20" />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
