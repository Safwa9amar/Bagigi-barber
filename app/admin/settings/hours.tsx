import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { admin as adminApi } from "@/lib/api";

interface WorkingDay {
    id: string;
    day: number;
    startTime: string;
    endTime: string;
    isOpen: boolean;
}

const dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

export default function AdminHours() {
    const router = useRouter();
    const { t } = useTranslation();
    const [hours, setHours] = useState<WorkingDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchHours = useCallback(async () => {
        try {
            const res = await adminApi.getWorkingHours();
            if (res.success) {
                setHours(res.data);
            }
        } catch (e) {
            console.error("Failed to fetch hours", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHours();
    }, [fetchHours]);

    const handleToggle = async (item: WorkingDay) => {
        setUpdating(item.id);
        try {
            const res = await adminApi.updateWorkingHours(item.id, {
                ...item,
                isOpen: !item.isOpen
            });
            if (res.success) {
                setHours(prev => prev.map(h => h.id === item.id ? res.data : h));
            }
        } catch (e) {
            Alert.alert("Error", "Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    const handleTimeChange = async (item: WorkingDay, type: 'start' | 'end', value: string) => {
        // Basic HH:mm validation
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) return;

        setUpdating(item.id);
        try {
            const data = {
                startTime: type === 'start' ? value : item.startTime,
                endTime: type === 'end' ? value : item.endTime,
                isOpen: item.isOpen
            };
            const res = await adminApi.updateWorkingHours(item.id, data);
            if (res.success) {
                setHours(prev => prev.map(h => h.id === item.id ? res.data : h));
            }
        } catch (e) {
            Alert.alert("Error", "Failed to update time");
        } finally {
            setUpdating(null);
        }
    };

    const renderDay = (item: WorkingDay) => (
        <View key={item.id} className="bg-white dark:bg-[#1E1E1E] p-5 rounded-[24px] mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <View className="flex-row justify-between items-center mb-4">
                <View>
                    <Text className="text-lg font-black text-[#1A1A1A] dark:text-white">
                        {t(`admin.hours.days.${item.day}`)}
                    </Text>
                    <Text className={`text-[10px] font-bold uppercase tracking-widest ${item.isOpen ? 'text-green-500' : 'text-red-500'}`}>
                        {item.isOpen ? t("admin.hours.open") : t("admin.hours.closed")}
                    </Text>
                </View>
                <Switch
                    value={item.isOpen}
                    onValueChange={() => handleToggle(item)}
                    trackColor={{ false: "#E5E7EB", true: "#C5A35D50" }}
                    thumbColor={item.isOpen ? "#C5A35D" : "#F3F4F6"}
                />
            </View>

            {item.isOpen && (
                <View className="flex-row items-center gap-3">
                    <View className="flex-1 bg-gray-50 dark:bg-[#121212] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                        <Text className="text-[10px] text-gray-400 font-black uppercase mb-1">{t("admin.hours.startTime")}</Text>
                        <TextInput
                            className="text-[#1A1A1A] dark:text-white font-bold"
                            value={item.startTime}
                            onChangeText={(val) => handleTimeChange(item, 'start', val)}
                            placeholder="09:00"
                            keyboardType="numbers-and-punctuation"
                        />
                    </View>
                    <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
                    <View className="flex-1 bg-gray-50 dark:bg-[#121212] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                        <Text className="text-[10px] text-gray-400 font-black uppercase mb-1">{t("admin.hours.endTime")}</Text>
                        <TextInput
                            className="text-[#1A1A1A] dark:text-white font-bold"
                            value={item.endTime}
                            onChangeText={(val) => handleTimeChange(item, 'end', val)}
                            placeholder="18:00"
                            keyboardType="numbers-and-punctuation"
                        />
                    </View>
                </View>
            )}

            {updating === item.id && (
                <View className="absolute inset-0 bg-white/50 dark:bg-black/20 items-center justify-center rounded-[24px]">
                    <ActivityIndicator color="#C5A35D" />
                </View>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]">
            <View className="pt-14 px-5 pb-6 bg-white dark:bg-[#0F0F0F] flex-row items-center border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1E1E1E] items-center justify-center">
                    <Ionicons name="arrow-back" size={20} color="#1A1A1A" className="dark:text-white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-black text-[#1A1A1A] dark:text-white">{t("admin.hours.title")}</Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{t("admin.hours.subtitle")}</Text>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#C5A35D" />
                </View>
            ) : (
                <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                    {hours.map(renderDay)}
                    <View className="h-20" />
                </ScrollView>
            )}
        </View>
    );
}
