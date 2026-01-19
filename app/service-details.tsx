import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams, useNavigation } from "expo-router";
import { services as servicesApi, booking } from "@/lib/api";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/useAuthStore";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
};

type Service = {
  id: string;
  name: string;
  image: string;
  category: string;
  duration: string;
  price_from: string;
  price_to?: string;
  description?: string;
  is_vip?: boolean;
  rating?: number;
  reviews_count?: number;
  reviews?: Review[];
};

export default function BookServiceScreen() {
  const navigation = useNavigation();
  const params = useGlobalSearchParams();
  const { user, token } = useAuthStore();
  const { t } = useTranslation();

  // State
  const [service, setService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [estimation, setEstimation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServiceDetails();
    if (selectedDate) await fetchEstimate();
    setRefreshing(false);
  };

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const data = await servicesApi.getById(params.id as string);
      setService(data);
    } catch (error) {
      console.error("Error fetching service details:", error);
    } finally {
      if (!selectedDate) setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDetails();
  }, [params.id]);

  const today = new Date().toISOString().split("T")[0];

  // Fetch estimate when date changes
  useEffect(() => {
    if (selectedDate && params.id) {
      fetchEstimate();
    }
  }, [selectedDate]);

  const fetchEstimate = async () => {
    try {
      setLoading(true);
      const res = await booking.estimate({
        serviceId: params.id as string,
        date: selectedDate,
      });
      setEstimation(res);
    } catch (error: any) {
      console.error(error);
      setEstimation(null);
      // Don't alert if it's just "shop closed" as that's expected for some days
      if (error.response?.status !== 400) {
        Alert.alert(t("common.notice"), error.response?.data?.error || t("serviceDetails.fetchEstimateError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate) {
      Alert.alert(t("serviceDetails.selectDate"), t("serviceDetails.selectDateAlert"));
      return;
    }
    try {
      setBookingLoading(true);
      const res = await booking.create({
        serviceId: params.id as string,
        date: selectedDate,
      });

      Alert.alert(
        t("serviceDetails.successTitle"),
        res.message || t("serviceDetails.successMsg"),
        [
          {
            text: t("common.ok"), onPress: () => {
              fetchEstimate(); // Refresh to show current status
            }
          }
        ]
      );
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.error;
      // Handle the localized error code from backend
      if (errorMsg && errorMsg.includes('.')) {
        Alert.alert(t("common.error"), t(errorMsg));
      } else {
        Alert.alert(t("common.error"), errorMsg || t("serviceDetails.bookingFailed"));
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSubmittingReview = async () => {
    if (!service) return;
    try {
      setSubmittingReview(true);
      await servicesApi.addReview(service.id, {
        rating: newRating,
        comment: newComment.trim() || undefined
      });

      Alert.alert(t("common.notice"), t("serviceDetails.reviewSuccess"));
      setNewComment("");
      fetchServiceDetails(); // Refresh to show new review
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        t("common.error"),
        error.response?.data?.error === "You have already reviewed this service"
          ? t("serviceDetails.alreadyReviewed")
          : t("serviceDetails.reviewError")
      );
    } finally {
      setSubmittingReview(false);
    }
  };


  if (!service && loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} className="bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (!service) return null;

  const isAlreadyBooked = !!estimation?.userBooking;

  return (
    <View className="bg-background-light dark:bg-background-dark" style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
      >
        {/* Header Image */}
        <View>
          <Image
            source={{ uri: process.env.EXPO_PUBLIC_API_URL + service.image }}
            style={styles.image}
          />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="bg-background-light dark:bg-background-dark" style={styles.content}>
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Text style={styles.category}>{service.category?.toUpperCase()}</Text>
                {service.is_vip && (
                  <View className="bg-[#D4AF37]/20 px-2 py-0.5 rounded-md border border-[#D4AF37]/30">
                    <Text className="text-[#D4AF37] text-[10px] font-bold">VIP</Text>
                  </View>
                )}
              </View>
              <Text style={styles.title} className="text-typography-900 dark:text-typography-white">{service.name}</Text>
            </View>
            <View className="items-end">
              <Text className="text-[#D4AF37] font-black text-xl">
                {service.price_from} {t("common.currency")}
              </Text>
              {service.price_to && (
                <Text className="text-gray-400 text-xs line-through">
                  ~{service.price_to}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={18} color="#D4AF37" />
              <Text style={styles.infoText}>
                {service.duration || "45 min"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="star" size={18} color="#D4AF37" />
              <Text style={styles.infoText}>
                {service.rating?.toFixed(1) || "0.0"} {t("serviceDetails.reviews", { count: service.reviews_count || 0 })}
              </Text>
            </View>
          </View>

          {service.description && (
            <View className="mt-6">
              <Text className="text-gray-500 dark:text-gray-400 leading-6 text-sm">
                {service.description}
              </Text>
            </View>
          )}

          <View style={styles.divider} className="bg-outline-300 dark:bg-outline-200" />

          {/* Date Selection - Always visible so user can check other days */}
          <Text style={styles.sectionTitle} className="text-typography-900 dark:text-typography-white">{t("serviceDetails.selectDate")}</Text>

          <TouchableOpacity
            onPress={() => setShowCalendar(true)}
            className="flex-row items-center justify-between p-4 bg-white dark:bg-background-muted rounded-2xl border border-outline-300 dark:border-gray-800 mb-4"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#C5A35D]20 items-center justify-center mr-3" style={{ backgroundColor: '#C5A35D15' }}>
                <Ionicons name="calendar-outline" size={20} color="#D4AF37" />
              </View>
              <Text className="text-typography-900 dark:text-typography-white font-bold">
                {selectedDate ? format(new Date(selectedDate), 'PPPP') : t("serviceDetails.selectDateHelper")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* User Booking Status OR New Booking Estimation */}
          {isAlreadyBooked ? (
            <View className="mb-6 p-6 rounded-[24px] bg-[#C5A35D] overflow-hidden relative shadow-lg">
              <View className="absolute -right-4 -top-4 opacity-10">
                <Ionicons name="calendar-outline" size={120} color="#fff" />
              </View>
              <Text className="text-white/80 font-bold uppercase text-[10px] tracking-widest mb-1">
                {t("serviceDetails.yourBooking")}
              </Text>
              <Text className="text-white text-2xl font-black mb-3">
                {estimation.userBooking.time}
              </Text>
              <View className="flex-row items-center gap-4">
                <View className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    #{estimation.userBooking.position} in Queue
                  </Text>
                </View>
                <View className="bg-black/10 px-3 py-1 rounded-full border border-white/20">
                  <Text className="text-white text-xs font-bold uppercase">
                    {estimation.userBooking.status}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <>
              {/* Estimation Card (Only if NOT already booked) */}
              {estimation && !loading && (
                <View style={styles.estimationCard} className="bg-white dark:bg-background-muted border-outline-300 dark:border-primary-500 mb-6">
                  <Text style={styles.estimationTitle}>{t("serviceDetails.nextAvailable")}</Text>
                  <Text style={styles.estimationTime} className="text-typography-900 dark:text-typography-white">{estimation.formattedEstimatedAt}</Text>
                  <Text style={styles.estimationInfo} className="text-typography-900 dark:text-typography-white">
                    {t("serviceDetails.queuePos")} <Text style={{ fontWeight: 'bold', color: '#D4AF37' }}>#{estimation.position}</Text>
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Today's Schedule / Queue Transparency */}
          {estimation?.schedule && estimation.schedule.length > 0 && (
            <View className="mb-6">
              <Text style={styles.sectionTitle} className="text-typography-900 dark:text-typography-white">
                {t("serviceDetails.todaysSchedule")}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {estimation.schedule.map((slot: any, idx: number) => (
                  <View
                    key={idx}
                    className={`p-4 rounded-2xl border mr-3 items-center min-w-[90px] ${slot.isUser
                      ? "bg-[#C5A35D] border-[#C5A35D]"
                      : "bg-white dark:bg-background-paper border-outline-200 dark:border-gray-800"
                      }`}
                  >
                    <Text className={`text-[10px] font-extrabold uppercase mb-1 ${slot.isUser ? "text-white/70" : "text-gray-400"}`}>
                      #{slot.position} {slot.isUser ? t("serviceDetails.you") : ""}
                    </Text>
                    <Text className={`text-sm font-black ${slot.isUser ? "text-white" : "text-typography-900 dark:text-typography-white"}`}>
                      {slot.time}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.divider} className="bg-outline-300 dark:bg-outline-200" />

          {/* Reviews Section */}
          <View className="mb-10">
            <Text style={styles.sectionTitle} className="text-typography-900 dark:text-typography-white">
              {t("serviceDetails.reviewsTitle")}
            </Text>

            {service.reviews && service.reviews.length > 0 ? (
              service.reviews.map((rev) => (
                <View key={rev.id} style={styles.reviewItem} className="border-b border-outline-200 dark:border-gray-800">
                  <View className="flex-row justify-between mb-1">
                    <Text className="font-bold text-typography-900 dark:text-typography-white">{rev.user.name}</Text>
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= rev.rating ? "star" : "star-outline"}
                          size={12}
                          color="#D4AF37"
                        />
                      ))}
                    </View>
                  </View>
                  {rev.comment && (
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">{rev.comment}</Text>
                  )}
                  <Text className="text-gray-400 text-[10px] mt-1">{new Date(rev.createdAt).toLocaleDateString()}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.helperText}>{t("serviceDetails.noReviews")}</Text>
            )}

            {/* Write a Review (Only for Customers) */}
            {user?.role === "USER" && (
              <View style={styles.writeReviewContainer} className="bg-secondary-50 p-5 rounded-xl mt-5 dark:bg-background-muted">
                <Text className="font-bold text-lg mb-3 dark:text-white">{t("serviceDetails.writeReview")}</Text>
                <View className="flex-row gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setNewRating(s)}>
                      <Ionicons
                        name={s <= newRating ? "star" : "star-outline"}
                        size={28}
                        color="#D4AF37"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <View className="bg-white dark:bg-background-paper p-3 rounded-lg border border-outline-300 dark:border-gray-700 min-h-[80px]">
                  <TextInput
                    placeholder={t("serviceDetails.commentPlaceholder")}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    value={newComment}
                    onChangeText={setNewComment}
                    className="text-typography-900 dark:text-typography-white text-sm"
                    style={{ textAlignVertical: 'top' }}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleSubmittingReview}
                  disabled={submittingReview}
                  className="bg-secondary-500 py-3 rounded-lg mt-4 items-center"
                >
                  {submittingReview ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold">{t("serviceDetails.submitReview")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Modal
            visible={showCalendar}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowCalendar(false)}
          >
            <Pressable
              className="flex-1 bg-black/50 justify-center p-6"
              onPress={() => setShowCalendar(false)}
            >
              <Pressable className="bg-white dark:bg-[#1E1E1E] rounded-[32px] overflow-hidden p-4">
                <View className="flex-row justify-between items-center mb-4 px-2">
                  <Text className="text-lg font-black text-[#1A1A1A] dark:text-white">{t("serviceDetails.selectDate")}</Text>
                  <TouchableOpacity onPress={() => setShowCalendar(false)}>
                    <Ionicons name="close-circle" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                <Calendar
                  onDayPress={(day: any) => {
                    setSelectedDate(day.dateString);
                    setShowCalendar(false);
                  }}
                  markedDates={{
                    [selectedDate]: { selected: true, selectedColor: '#D4AF37' }
                  }}
                  minDate={today}
                  theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: '#b6c1cd',
                    selectedDayBackgroundColor: '#D4AF37',
                    selectedDayTextColor: '#000000',
                    todayTextColor: '#D4AF37',
                    dayTextColor: '#9CA3AF',
                    textDisabledColor: '#444',
                    arrowColor: '#D4AF37',
                    monthTextColor: '#D4AF37',
                    indicatorColor: '#D4AF37',
                  }}
                />
              </Pressable>
            </Pressable>
          </Modal>

        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Booking Bar */}
      {!isAlreadyBooked && (
        <View style={styles.footer} className="bg-white dark:bg-background-muted border-outline-200 dark:border-gray-800">
          <View>
            <Text style={styles.totalLabel}>{t("serviceDetails.totalPrice")}</Text>
            <Text style={styles.totalPrice} className="text-typography-900 dark:text-typography-white">
              {service.price_from ? service.price_from + ' ' + t("common.currency") : t("common.na")}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bookBtn, (!selectedDate || !estimation || bookingLoading) && { opacity: 0.6 }]}
            disabled={!selectedDate || !estimation || bookingLoading}
            onPress={handleBooking}
          >
            {bookingLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.bookText}>{t("serviceDetails.bookNow")}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: 280,
    width: "100%",
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 12,
  },
  content: {
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  category: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  calendarContainer: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
  },
  estimationCard: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 10
  },
  estimationTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 5
  },
  estimationTime: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5
  },
  estimationInfo: {
    fontSize: 16
  },
  estimationSub: {
    color: '#666',
    fontSize: 12,
    marginTop: 5
  },
  helperText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
  },
  totalLabel: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
  },
  bookBtn: {
    backgroundColor: "#D4AF37",
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 15,
  },
  bookText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewItem: {
    paddingVertical: 15,
  },
  writeReviewContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
  },
});
