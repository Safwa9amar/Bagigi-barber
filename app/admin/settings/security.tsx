import React, { useState } from "react";
import {
    View,
    Text,
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
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input, InputField as GluestackInputField } from "@/components/ui/input";

interface SecurityFormData {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

const CustomInputField = ({
    label,
    value,
    onChangeText,
    icon,
    placeholder,
    isPassword = true,
    error = ""
}: {
    label: string,
    value: string,
    onChangeText: (v: string) => void,
    icon: any,
    placeholder: string,
    isPassword?: boolean,
    error?: string
}) => (
    <View className="mb-6">
        <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest ml-1 mb-2">{label}</Text>
        <Input
            variant="outline"
            size="xl"
            isInvalid={!!error}
            className={`flex-row items-center bg-white dark:bg-[#1E1E1E] px-4 rounded-[20px] shadow-sm border ${error ? "border-red-500" : "border-gray-100 dark:border-gray-800"}`}
        >
            <Ionicons name={icon} size={20} color={error ? "#ef4444" : "#C5A35D"} />
            <GluestackInputField
                className="flex-1 ml-3 text-sm font-bold text-[#1A1A1A] dark:text-white h-12"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                secureTextEntry={isPassword}
            />
        </Input>
        {error ? <Text className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{error}</Text> : null}
    </View>
);

export default function AdminSecurity() {
    const router = useRouter();
    const { t } = useTranslation();
    const { updateProfile } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const securitySchema = yup.object().shape({
        currentPassword: yup.string().required(t("profile.currentPasswordRequired") || "Current password is required"),
        newPassword: yup.string().min(6, t("profile.passwordTooShort") || "Password must be at least 6 characters").required(t("profile.newPasswordRequired") || "New password is required"),
        confirmNewPassword: yup.string()
            .oneOf([yup.ref('newPassword')], t("profile.passwordsMustMatch") || "Passwords must match")
            .required(t("profile.confirmPasswordRequired") || "Please confirm your new password"),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<SecurityFormData>({
        resolver: yupResolver(securitySchema) as any,
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        }
    });

    const onSubmit = async (data: SecurityFormData) => {
        setLoading(true);
        try {
            await updateProfile({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            Alert.alert(t("common.notice") || "Notice", t("common.saveSuccess") || "Password updated successfully");
            reset();
            setLoading(false);
        } catch (e: any) {
            console.error(e);
            let message = t("profile.failedUpdate") || "Failed to update password";
            if (e.response?.data?.error) {
                message = e.response.data.error;
            }
            Alert.alert(t("common.error") || "Error", message);
            setLoading(false);
        }
    };

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
                    <Text className="text-xl font-black text-[#1A1A1A] dark:text-white">{t("admin.settings.security") || "Security"}</Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{t("profile.changePassword") || "Change Password"}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="mb-8">
                    <Text className="text-sm text-gray-500 mb-6">
                        {t("profile.changePasswordDesc") || "Update your password to keep your account secure."}
                    </Text>

                    <Controller
                        control={control}
                        name="currentPassword"
                        render={({ field: { onChange, value } }) => (
                            <CustomInputField
                                label={t("profile.currentPassword") || "Current Password"}
                                value={value}
                                onChangeText={onChange}
                                icon="lock-closed-outline"
                                placeholder="******"
                                error={errors.currentPassword?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="newPassword"
                        render={({ field: { onChange, value } }) => (
                            <CustomInputField
                                label={t("profile.newPassword") || "New Password"}
                                value={value}
                                onChangeText={onChange}
                                icon="key-outline"
                                placeholder="******"
                                error={errors.newPassword?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="confirmNewPassword"
                        render={({ field: { onChange, value } }) => (
                            <CustomInputField
                                label={t("profile.confirmNewPassword") || "Confirm New Password"}
                                value={value}
                                onChangeText={onChange}
                                icon="checkmark-circle-outline"
                                placeholder="******"
                                error={errors.confirmNewPassword?.message}
                            />
                        )}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                    className="bg-[#C5A35D] p-5 rounded-[24px] items-center justify-center shadow-lg shadow-[#C5A35D]/40"
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-black text-sm uppercase tracking-widest">{t("profile.updatePassword") || "Update Password"}</Text>
                    )}
                </TouchableOpacity>

                <View className="h-20" />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
