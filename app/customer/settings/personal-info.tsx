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
    Modal,
} from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input, InputField as GluestackInputField } from "@/components/ui/input";

interface ProfileFormData {
    name: string;
    email: string;
    phone: string;
}

const CustomInputField = ({
    label,
    value,
    onChangeText,
    icon,
    placeholder,
    keyboardType = "default",
    editable = true,
    isPassword = false,
    error = ""
}: {
    label: string;
    value: string;
    onChangeText?: (v: string) => void;
    icon: any;
    placeholder: string;
    keyboardType?: any;
    editable?: boolean;
    isPassword?: boolean;
    error?: string;
}) => (
    <View className="mb-6">
        <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest ml-1 mb-2">
            {label}
        </Text>
        <Input
            variant="outline"
            size="xl"
            isInvalid={!!error}
            isDisabled={!editable}
            className={`flex-row items-center bg-white dark:bg-[#1E1E1E] px-4 rounded-[20px] shadow-sm border ${error ? "border-red-500" : "border-gray-100 dark:border-gray-800"
                } ${!editable ? "opacity-60" : ""}`}
        >
            <Ionicons name={icon} size={20} color={error ? "#ef4444" : "#C5A35D"} />
            <GluestackInputField
                className="flex-1 ml-3 text-sm font-bold text-[#1A1A1A] dark:text-white h-12"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                keyboardType={keyboardType}
                autoCapitalize="none"
                secureTextEntry={isPassword}
            />
        </Input>
        {error ? <Text className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{error}</Text> : null}
    </View>
);

export default function PersonalInfo() {
    const { user, updateProfile } = useAuthStore();
    const router = useRouter();
    const { t } = useTranslation();

    const profileSchema = yup.object().shape({
        name: yup.string().required(t("profile.nameRequired") || "Name is required"),
        email: yup.string().email(t("profile.invalidEmail") || "Invalid email").required(t("profile.emailRequired") || "Email is required"),
        phone: yup.string().matches(/^0[567]\d{8}$/, t("invaild_phone") || "Invalid phone number").required(t("profile.phoneRequired") || "Phone number is required"),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        getValues,
        watch,
    } = useForm<ProfileFormData>({
        resolver: yupResolver(profileSchema) as any,
        defaultValues: {
            name: user?.name || user?.email?.split('@')[0] || "",
            email: user?.email || "",
            phone: user?.phone || "",
        }
    });

    const watchedName = watch("name");
    const [loading, setLoading] = useState(false);

    // Password Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [password, setPassword] = useState("");

    const onSubmit = async (data: ProfileFormData) => {
        // Check if email changed
        if (data.email !== user?.email) {
            setModalVisible(true);
            return;
        }

        // Proceed without password if email hasn't changed
        await performUpdate(data, {});
    };

    const performUpdate = async (formData: ProfileFormData, extraData: any) => {
        setLoading(true);
        try {
            await updateProfile({
                ...formData,
                ...extraData
            });
            Alert.alert(t("common.notice"), t("common.saveSuccess") || "Profile updated successfully");
            setModalVisible(false);
            setPassword("");
            setLoading(false);
        } catch (e: any) {
            console.error(e);
            let message = "Failed to update profile";
            if (e.response?.data?.error) {
                message = e.response.data.error;
            }
            Alert.alert(t("common.error"), message);
            setLoading(false);
        }
    };

    const confirmPassword = () => {
        if (!password) {
            Alert.alert(t("common.error"), t("profile.passwordRequired") || "Password is required");
            return;
        }
        performUpdate(getValues(), { password });
    };

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
                        {watchedName || user?.name || user?.email?.split("@")[0]}
                    </Text>
                    <Text className="text-gray-400 font-bold text-xs">
                        {t("profile.customer") || "Customer"}
                    </Text>
                </View>

                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, value } }) => (
                        <CustomInputField
                            label={t("settings.personalInfo.name")}
                            value={value}
                            onChangeText={onChange}
                            icon="person-outline"
                            placeholder="Your Name"
                            error={errors.name?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                        <CustomInputField
                            label={t("settings.personalInfo.email")}
                            value={value}
                            onChangeText={onChange}
                            icon="mail-outline"
                            placeholder="your@email.com"
                            keyboardType="email-address"
                            error={errors.email?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="phone"
                    render={({ field: { onChange, value } }) => (
                        <CustomInputField
                            label={t("settings.personalInfo.phone")}
                            value={value}
                            onChangeText={onChange}
                            icon="call-outline"
                            placeholder="+213 000 000 000"
                            keyboardType="phone-pad"
                            error={errors.phone?.message}
                        />
                    )}
                />

                <View className="h-10" />

                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
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

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="m-5 bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 w-[90%] shadow-xl">
                        <Text className="text-xl font-black mb-2 text-[#1A1A1A] dark:text-white">
                            {t("profile.confirmPassword") || "Confirm Password"}
                        </Text>
                        <Text className="text-sm text-gray-500 mb-6">
                            {t("profile.confirmPasswordDesc") || "Please enter your password to confirm email change."}
                        </Text>

                        <CustomInputField
                            label={t("auth.password") || "Password"}
                            value={password}
                            onChangeText={setPassword}
                            icon="lock-closed-outline"
                            placeholder="******"
                            isPassword={true}
                        />

                        <View className="flex-row justify-end space-x-3 gap-2">
                            <TouchableOpacity
                                className="px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800"
                                onPress={() => setModalVisible(false)}
                            >
                                <Text className="font-bold text-gray-600 dark:text-gray-300">{t("common.cancel") || "Cancel"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="px-5 py-3 rounded-xl bg-[#C5A35D]"
                                onPress={confirmPassword}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text className="font-black text-white">{t("common.confirm") || "Confirm"}</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}
