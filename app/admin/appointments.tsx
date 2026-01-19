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
  Modal,
  Platform,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { admin as adminApi, services as servicesApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore } from "@/store/useBookingStore";
import { useFocusEffect } from "expo-router";

interface Booking {
  id: string;
  userId?: string;
  user?: {
    id: string;
    email: string;
    phone: string;
  };
  guestName?: string;
  guestPhone?: string;
  isWalkIn: boolean;
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

interface Service {
  id: string;
  name: string;
  category: string;
}

export default function AdminAppointments() {
  const { t } = useTranslation();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Walk-in modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Time editing state
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newTime, setNewTime] = useState<string>("");
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

  const fetchServices = async () => {
    try {
      const res = await servicesApi.getAll();
      setServices(res.data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchServices();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings(false);
  };

  const { resetNewBookingCount } = useBookingStore();

  useFocusEffect(
    useCallback(() => {
      resetNewBookingCount();
      fetchBookings(false); // Refresh list when focusing
    }, [fetchBookings, resetNewBookingCount])
  );

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await adminApi.updateBookingStatus(id, { status: newStatus });
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

  const handleCreateWalkIn = async () => {
    if (!selectedServiceId || !guestName) {
      Alert.alert(t("common.error"), "Please fill in guest name and select a service");
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminApi.createWalkIn({
        serviceId: selectedServiceId,
        guestName,
        guestPhone
      });

      if (res.success) {
        setShowWalkInModal(false);
        setGuestName("");
        setGuestPhone("");
        setSelectedServiceId("");
        fetchBookings(false);
        Alert.alert(t("common.success"), "Walk-in added successfully");
      }
    } catch (error) {
      console.error("Failed to add walk-in:", error);
      Alert.alert(t("common.error"), "Failed to add walk-in client");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotifyUser = async (id: string) => {
    try {
      const res = await adminApi.notifyUser(id);
      if (res.success) {
        Alert.alert(t("common.success"), t("admin.appointments.notificationSent"));
      }
    } catch (error: any) {
      console.error("Failed to notify user:", error);
      Alert.alert(t("common.error"), error.response?.data?.error || "Failed to send notification");
    }
  };

  const handleUpdateTime = async () => {
    if (!selectedBookingId) return;

    try {
      const isoString = selectedDate.toISOString();
      const res = await adminApi.updateBookingStatus(selectedBookingId, { estimatedAt: isoString });
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === selectedBookingId ? { ...b, estimatedAt: isoString } : b))
        );
        setShowTimeModal(false);
        setSelectedBookingId("");
        Alert.alert(t("common.success"), t("admin.appointments.timeUpdated"));
      }
    } catch (error) {
      console.error("Failed to update time:", error);
      Alert.alert(t("common.error"), "Failed to update appointment time");
    }
  };

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = selectedStatus === "all" || b.status === selectedStatus;
    const q = searchQuery.toLowerCase();

    // Check user info
    const userMatch = b.user ? (
      b.user.email.toLowerCase().includes(q) ||
      b.user.phone.includes(q)
    ) : false;

    // Check guest info
    const guestMatch = b.isWalkIn ? (
      b.guestName?.toLowerCase().includes(q) ||
      b.guestPhone?.includes(q)
    ) : false;

    const serviceMatch = b.service.name.toLowerCase().includes(q);

    return matchesStatus && (userMatch || guestMatch || serviceMatch);
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
          <View className="flex-row items-center mb-1">
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mr-2">
              {item.service.category}
            </Text>
            {item.isWalkIn && (
              <View className="bg-[#C5A35D]10 px-2 py-0.5 rounded-md" style={{ backgroundColor: '#C5A35D15' }}>
                <Text className="text-[#C5A35D] text-[8px] font-black uppercase">Walk-in</Text>
              </View>
            )}
          </View>
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
          <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">{item.isWalkIn ? t("admin.appointments.info.guest") : t("admin.appointments.info.client")}</Text>
          <Text className="text-[#1A1A1A] dark:text-white font-extrabold text-sm">
            {item.isWalkIn ? item.guestName : item.user?.email.split('@')[0]}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs">{item.isWalkIn ? (item.guestPhone || '--') : item.user?.phone}</Text>
        </View>
        <View className="flex-row gap-2">
          {!item.isWalkIn && (
            <TouchableOpacity
              onPress={() => router.push(`/admin/messages/${item.userId}`)}
              className="w-10 h-10 bg-gray-50 dark:bg-[#1E1E1E] rounded-full items-center justify-center border border-gray-200 dark:border-gray-700"
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#C5A35D" />
            </TouchableOpacity>
          )}
          {(item.user?.phone || item.guestPhone) && (
            <TouchableOpacity
              onPress={() => handleCall(item.isWalkIn ? item.guestPhone! : item.user!.phone)}
              className="w-10 h-10 bg-gray-50 dark:bg-[#1E1E1E] rounded-full items-center justify-center border border-gray-200 dark:border-gray-700"
            >
              <Ionicons name="call" size={18} color="#C5A35D" />
            </TouchableOpacity>
          )}
          {!item.isWalkIn && item.status === 'PENDING' && (
            <TouchableOpacity
              onPress={() => handleNotifyUser(item.id)}
              className="w-10 h-10 bg-gray-50 dark:bg-[#1E1E1E] rounded-full items-center justify-center border border-gray-200 dark:border-gray-700"
            >
              <Ionicons name="notifications" size={18} color="#C5A35D" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              setSelectedBookingId(item.id);
              setSelectedDate(item.estimatedAt ? new Date(item.estimatedAt) : new Date());
              setShowTimeModal(true);
            }}
            className="w-10 h-10 bg-gray-50 dark:bg-[#1E1E1E] rounded-full items-center justify-center border border-gray-200 dark:border-gray-700"
          >
            <Ionicons name="time" size={18} color="#C5A35D" />
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
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-black text-[#1A1A1A] dark:text-white">
            {t("tabs.appointments")}
          </Text>
          <TouchableOpacity
            onPress={() => setShowWalkInModal(true)}
            className="bg-[#C5A35D] px-4 py-2 rounded-full flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-black text-xs uppercase ml-1">
              {t("admin.appointments.addWalkIn")}
            </Text>
          </TouchableOpacity>
        </View>

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

      {/* Walk-in Modal */}
      <Modal
        visible={showWalkInModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWalkInModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-[#0F0F0F] rounded-t-[40px] p-6 pb-12">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-[#1A1A1A] dark:text-white">
                {t("admin.appointments.addWalkIn")}
              </Text>
              <TouchableOpacity onPress={() => setShowWalkInModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-5">
                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2 ml-1">
                  {t("admin.appointments.guestName")}
                </Text>
                <TextInput
                  value={guestName}
                  onChangeText={setGuestName}
                  placeholder="John Doe"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 dark:bg-[#1E1E1E] p-4 rounded-2xl text-gray-900 dark:text-white font-bold border border-gray-100 dark:border-gray-800"
                />
              </View>

              <View className="mb-5">
                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2 ml-1">
                  {t("admin.appointments.guestPhone")}
                </Text>
                <TextInput
                  value={guestPhone}
                  onChangeText={setGuestPhone}
                  placeholder="06..."
                  keyboardType="phone-pad"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 dark:bg-[#1E1E1E] p-4 rounded-2xl text-gray-900 dark:text-white font-bold border border-gray-100 dark:border-gray-800"
                />
              </View>

              <View className="mb-8">
                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2 ml-1">
                  {t("admin.appointments.info.service")}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {services.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      onPress={() => setSelectedServiceId(service.id)}
                      className={`px-4 py-3 rounded-xl border ${selectedServiceId === service.id
                        ? 'bg-[#C5A35D] border-[#C5A35D]'
                        : 'bg-gray-50 dark:bg-[#1E1E1E] border-gray-100 dark:border-gray-800'
                        }`}
                    >
                      <Text className={`font-bold text-xs ${selectedServiceId === service.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                        {service.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleCreateWalkIn}
                disabled={submitting}
                className="bg-[#C5A35D] py-4 rounded-2xl items-center shadow-lg shadow-[#C5A35D]/30"
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-black uppercase tracking-widest">
                    {t("common.save") || "Confirm Walk-in"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Edit Modal */}
      <Modal
        visible={showTimeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-[#0F0F0F] rounded-t-[40px] p-6 pb-12">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-[#1A1A1A] dark:text-white">
                {t("admin.appointments.updateTime")}
              </Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2 ml-1">
                {t("admin.appointments.info.time")}
              </Text>

              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-gray-50 dark:bg-[#1E1E1E] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 mb-3"
              >
                <Text className="text-gray-900 dark:text-white font-bold">
                  {format(selectedDate, "MMM dd, yyyy")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="bg-gray-50 dark:bg-[#1E1E1E] p-4 rounded-2xl border border-gray-100 dark:border-gray-800"
              >
                <Text className="text-gray-900 dark:text-white font-bold">
                  {format(selectedDate, "HH:mm")}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setSelectedDate(date);
                  }}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowTimePicker(false);
                    if (date) setSelectedDate(date);
                  }}
                />
              )}
            </View>

            <TouchableOpacity
              onPress={handleUpdateTime}
              className="bg-[#C5A35D] py-4 rounded-2xl items-center shadow-lg shadow-[#C5A35D]/30"
            >
              <Text className="text-white font-black uppercase tracking-widest">
                {t("common.save") || "Update Time"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
