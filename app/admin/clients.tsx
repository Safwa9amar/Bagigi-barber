import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { admin as adminApi } from "@/lib/api";

interface Client {
  id: string;
  email: string;
  phone: string;
  verified: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  _count: {
    bookings: number;
  };
}

export default function AdminClients() {
  const { t } = useTranslation();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchClients = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await adminApi.getAllClients();
      if (res.success) {
        setClients(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      Alert.alert(t("common.error"), t("common.loadingError") || "Failed to load clients");
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClients(false);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const filteredClients = clients.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.email.toLowerCase().includes(query) ||
      c.phone.includes(query)
    );
  });

  const renderClientCard = ({ item }: { item: Client }) => (
    <View className="bg-white dark:bg-[#1E1E1E] mb-4 p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1">
          <Text className="text-[#1A1A1A] dark:text-white text-lg font-black mb-1">
            {item.email.split('@')[0]}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs font-bold">
            {item.email}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => router.push(`/admin/messages/${item.id}`)}
            className="w-10 h-10 bg-gray-50 dark:bg-[#2C2C2C] rounded-full items-center justify-center border border-gray-200 dark:border-gray-700"
          >
            <Ionicons name="chatbubble-ellipses" size={18} color="#C5A35D" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleCall(item.phone)}
            className="w-10 h-10 bg-gray-50 dark:bg-[#2C2C2C] rounded-full items-center justify-center border border-gray-200 dark:border-gray-700"
          >
            <Ionicons name="call" size={18} color="#C5A35D" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="h-[1px] bg-gray-50 dark:bg-gray-800 mb-4" />

      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">{t("admin.clients.stats.joined")}</Text>
          <Text className="text-gray-700 dark:text-gray-300 font-bold text-xs">
            {format(new Date(item.createdAt), "MMM d, yyyy")}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">{t("admin.clients.stats.bookings")}</Text>
          <View className="bg-[#C5A35D] px-3 py-1 rounded-full">
            <Text className="text-white font-black text-xs">
              {item._count.bookings}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-row items-center">
        <Ionicons name="phone-portrait-outline" size={14} color="#9CA3AF" />
        <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1 font-bold">
          {item.phone}
        </Text>
        {item.emailConfirmed && (
          <View className="flex-row items-center ml-4">
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text className="text-[#10B981] text-[10px] font-bold ml-1 uppercase">Verified</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]">
      <View className="pt-14 px-5 pb-4 bg-white dark:bg-[#0F0F0F]">
        <View className="flex-row items-center bg-gray-100 dark:bg-[#1E1E1E] px-4 py-3 rounded-[20px] mb-4">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder={t("admin.clients.searchPlaceholder")}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="ml-3 flex-1 text-gray-900 dark:text-white font-bold"
          />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#C5A35D" />
        </View>
      ) : (
        <FlatList
          data={filteredClients}
          renderItem={renderClientCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C5A35D" />
          }
          ListEmptyComponent={
            <View className="items-center justify-center pt-20">
              <Ionicons name="people-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-400 font-bold mt-4 text-lg">
                {t("admin.clients.noClients")}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
