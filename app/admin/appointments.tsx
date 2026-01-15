import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
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
import { useAuthStore } from "@/store/useAuthStore";

interface Booking {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    phone: string;
  };
  serviceId: string;
  service: {
    id: string;
    name: string;
    category: string;
    priceFrom: number;
    duration: number;
  };
  duration: number;
  position: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  estimatedAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAppointments() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const statuses = [
    { id: "all", label: t("admin.appointments.status.all") },
    { id: "PENDING", label: t("admin.appointments.status.pending") },
    { id: "IN_PROGRESS", label: t("admin.appointments.status.inProgress") },
    { id: "DONE", label: t("admin.appointments.status.done") },
    { id: "CANCELLED", label: t("admin.appointments.status.cancelled") },
  ];

  const fetchBookings = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await adminApi.getAllBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      Alert.alert(t("common.error"), t("common.loadingError") || "Failed to load bookings");
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await adminApi.updateBookingStatus(id, newStatus);
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus as any } : b))
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      Alert.alert(t("common.error"), t("admin.services.saveError"));
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = selectedStatus === "all" || b.status === selectedStatus;
    const matchesSearch =
      b.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.user.phone.includes(searchQuery) ||
      b.service.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "#C5A35D";
      case "IN_PROGRESS": return "#3B82F6";
      case "DONE": return "#10B981";
      case "CANCELLED": return "#EF4444";
      default: return "#9CA3AF";
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <View className="bg-white dark:bg-[#1E1E1E] mb-4 p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
            {item.service.category}
          </Text>
          <Text className="text-[#1A1A1A] dark:text-white text-xl font-black mb-1">
            {item.service.name}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1 font-bold">
              {item.duration} min • {item.estimatedAt ? format(new Date(item.estimatedAt), "HH:mm") : "--:--"}
            </Text>
          </View>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${getStatusColor(item.status)}20` }}
        >
          <Text
            className="text-[10px] font-black uppercase"
            style={{ color: getStatusColor(item.status) }}
          >
            {t(`admin.appointments.status.${item.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`)}
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-gray-50 dark:bg-gray-800 mb-4" />

      <View className="flex-row justify-between items-center mb-5">
        <View>
          <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">{t("admin.appointments.info.client")}</Text>
          <Text className="text-[#1A1A1A] dark:text-white font-extrabold text-sm">{item.user.email.split('@')[0]}</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs">{item.user.phone}</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => router.push(`/admin/messages/${item.userId}`)}
            className="w-10 h-10 bg-gray-50 dark:bg-[#1E1E1E] rounded-full items-center justify-center border border-gray-200 dark:border-gray-700"
          >
            <Ionicons name="chatbubble-ellipses" size={18} color="#C5A35D" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleCall(item.user.phone)}
            className="w-10 h-10 bg-gray-50 dark:bg-[#1E1E1E] rounded-full items-center justify-center border border-gray-200 dark:border-gray-700"
          >
            <Ionicons name="call" size={18} color="#C5A35D" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row gap-2">
        {item.status === 'PENDING' && (
          <>
            <TouchableOpacity
              onPress={() => updateStatus(item.id, 'IN_PROGRESS')}
              className="flex-1 bg-[#C5A35D] py-3 rounded-xl items-center"
            >
              <Text className="text-white font-black text-xs uppercase">{t("admin.appointments.actions.start")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updateStatus(item.id, 'CANCELLED')}
              className="flex-1 bg-gray-50 dark:bg-[#2C2C2C] py-3 rounded-xl items-center border border-gray-200 dark:border-gray-700"
            >
              <Text className="text-gray-600 dark:text-gray-400 font-bold text-xs uppercase">{t("admin.appointments.actions.cancel")}</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'IN_PROGRESS' && (
          <>
            <TouchableOpacity
              onPress={() => updateStatus(item.id, 'DONE')}
              className="flex-1 bg-[#10B981] py-3 rounded-xl items-center"
            >
              <Text className="text-white font-black text-xs uppercase">{t("admin.appointments.actions.finish")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updateStatus(item.id, 'PENDING')}
              className="flex-1 bg-gray-50 dark:bg-[#2C2C2C] py-3 rounded-xl items-center border border-gray-200 dark:border-gray-700"
            >
              <Text className="text-gray-600 dark:text-gray-400 font-bold text-xs uppercase">{t("admin.appointments.actions.revert")}</Text>
            </TouchableOpacity>
          </>
        )}
        {(item.status === 'DONE' || item.status === 'CANCELLED') && (
          <TouchableOpacity
            onPress={() => updateStatus(item.id, 'PENDING')}
            className="flex-1 bg-gray-50 dark:bg-[#2C2C2C] py-3 rounded-xl items-center border border-gray-200 dark:border-gray-700"
          >
            <Text className="text-gray-600 dark:text-gray-400 font-bold text-xs uppercase">{t("admin.appointments.actions.revert")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]">
      <View className="pt-14 px-5 pb-4 bg-white dark:bg-[#0F0F0F]">

        <View className="flex-row items-center bg-gray-100 dark:bg-[#1E1E1E] px-4 py-3 rounded-[20px] mb-6">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder={t("admin.appointments.searchPlaceholder")}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="ml-3 flex-1 text-gray-900 dark:text-white font-bold"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {statuses.map((status) => (
            <TouchableOpacity
              key={status.id}
              onPress={() => setSelectedStatus(status.id)}
              className={`mr-3 px-5 py-2 rounded-full border ${selectedStatus === status.id
                ? 'bg-[#C5A35D] border-[#C5A35D]'
                : 'bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-gray-800'
                }`}
            >
              <Text className={`font-black text-xs uppercase ${selectedStatus === status.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                }`}>
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#C5A35D" />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C5A35D" />
          }
          ListEmptyComponent={
            <View className="items-center justify-center pt-20">
              <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-400 font-bold mt-4 text-lg">
                {t("admin.appointments.noBookings")}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
