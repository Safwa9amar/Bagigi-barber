import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function DeveloperInfo() {
    const router = useRouter();
    const { t } = useTranslation();

    const handleLink = (url: string) => {
        Linking.openURL(url);
    };

    const InfoItem = ({ icon, label, value, onPress }: { icon: any, label: string, value: string, onPress?: () => void }) => (
        <TouchableOpacity
            disabled={!onPress}
            onPress={onPress}
            className="flex-row items-center p-5 bg-white dark:bg-[#1E1E1E] mb-3 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800"
        >
            <View className="w-10 h-10 rounded-full items-center justify-center bg-[#C5A35D]10" style={{ backgroundColor: '#C5A35D10' }}>
                <Ionicons name={icon} size={20} color="#C5A35D" />
            </View>
            <View className="flex-1 ml-4">
                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{label}</Text>
                <Text className="text-sm font-black text-[#1A1A1A] dark:text-white mt-1">{value}</Text>
            </View>
            {onPress && <Ionicons name="open-outline" size={18} color="#9CA3AF" />}
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]">
            {/* Header */}
            <View className="pt-14 px-5 pb-6 bg-white dark:bg-[#0F0F0F] flex-row items-center border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1E1E1E] items-center justify-center">
                    <Ionicons name="arrow-back" size={20} color="#1A1A1A" className="dark:text-white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-black text-[#1A1A1A] dark:text-white">{t("profile.developerInfo")}</Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{t("profile.support") || "Developer Details"}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="items-center mb-8 mt-4">
                    <View className="w-24 h-24 rounded-full bg-[#C5A35D]20 items-center justify-center shadow-sm" style={{ backgroundColor: '#C5A35D15' }}>
                        <Ionicons name="code-slash" size={48} color="#C5A35D" />
                    </View>
                    <Text className="text-2xl font-black text-[#1A1A1A] dark:text-white mt-4">Hassani Hamza</Text>
                    <Text className="text-[#C5A35D] font-black text-[10px] uppercase tracking-widest tracking-widest mt-1">Full-Stack Developer</Text>
                </View>

                <InfoItem
                    icon="person-outline"
                    label="Name"
                    value="Hassani Hamza"
                />

                <InfoItem
                    icon="call-outline"
                    label="Phone Numbers"
                    value="0674 02 02 44 / 0697 19 97 74"
                    onPress={() => handleLink("tel:0674020244")}
                />

                <InfoItem
                    icon="mail-outline"
                    label="Email Address"
                    value="hassanih97@gmail.com"
                    onPress={() => handleLink("mailto:hassanih97@gmail.com")}
                />

                <InfoItem
                    icon="globe-outline"
                    label="Portfolio"
                    value="hamza-safwan.netlify.app"
                    onPress={() => handleLink("https://hamza-safwan.netlify.app/")}
                />

                <View className="mt-8 p-6 rounded-[32px] bg-[#C5A35D] items-center shadow-lg shadow-[#C5A35D]/40">
                    <Text className="text-white font-black text-sm uppercase tracking-widest text-center">Transforming ideas into digital reality</Text>
                    <Text className="text-white/80 font-bold text-[10px] mt-2 text-center">Available for new projects and collaborations</Text>
                </View>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
