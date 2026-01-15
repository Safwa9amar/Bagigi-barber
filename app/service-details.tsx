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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams, useNavigation } from "expo-router";
import { booking } from "@/lib/api";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

type Service = {
  id: string; // Ensure ID is passed
  name: string;
  image: string;
  category: string;
  duration: string;
  price_from: string;
};

export default function BookServiceScreen() {
  const navigation = useNavigation();
  const service: Service = useGlobalSearchParams();
  const { t } = useTranslation();

  // State
  const [selectedDate, setSelectedDate] = useState("");
  const [estimation, setEstimation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch estimate when date changes
  useEffect(() => {
    if (selectedDate && service.id) {
      fetchEstimate();
    }
  }, [selectedDate]);

  const fetchEstimate = async () => {
    try {
      setLoading(true);
      const res = await booking.estimate({
        serviceId: service.id,
        date: selectedDate,
      });
      setEstimation(res);
    } catch (error: any) {
      console.error(error);
      setEstimation(null);
      Alert.alert(t("common.notice"), error.response?.data?.error || t("serviceDetails.fetchEstimateError"));
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
        serviceId: service.id,
        date: selectedDate,
      });

      Alert.alert(
        t("serviceDetails.successTitle"),
        res.message || t("serviceDetails.successMsg"),
        [
          { text: t("common.ok"), onPress: () => navigation.goBack() }
        ]
      );
    } catch (error: any) {
      console.error(error);
      Alert.alert(t("common.error"), error.response?.data?.error || t("serviceDetails.bookingFailed"));
    } finally {
      setBookingLoading(false);
    }
  };

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <View className="bg-background-light dark:bg-background-dark" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
          {/* Service Info */}
          <Text style={styles.category}>{service.category?.toUpperCase()}</Text>
          <Text style={styles.title} className="text-typography-900 dark:text-typography-white">{service.name}</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={18} color="#D4AF37" />
              <Text style={styles.infoText}>
                {service.duration || "45 min"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="star" size={18} color="#D4AF37" />
              <Text style={styles.infoText}>4.8 {t("serviceDetails.reviews", { count: 120 })}</Text>
            </View>
          </View>

          <View style={styles.divider} className="bg-outline-300 dark:bg-outline-200" />

          {/* Date Selection */}
          <Text style={styles.sectionTitle} className="text-typography-900 dark:text-typography-white">{t("serviceDetails.selectDate")}</Text>
          <View style={styles.calendarContainer} className="border-outline-300 dark:border-gray-800">
            <Calendar
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
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
          </View>

          {/* Estimation Result */}
          {loading ? (
            <ActivityIndicator size="small" color="#D4AF37" style={{ marginTop: 20 }} />
          ) : estimation ? (
            <View style={styles.estimationCard} className="bg-white dark:bg-background-muted border-outline-300 dark:border-primary-500">
              <Text style={styles.estimationTitle}>{t("serviceDetails.nextAvailable")}</Text>
              <Text style={styles.estimationTime} className="text-typography-900 dark:text-typography-white">{estimation.formattedEstimatedAt}</Text>
              <Text style={styles.estimationInfo} className="text-typography-900 dark:text-typography-white">
                {t("serviceDetails.queuePos")} <Text style={{ fontWeight: 'bold', color: '#D4AF37' }}>#{estimation.position}</Text>
              </Text>
              <Text style={styles.estimationSub}>
                {t("serviceDetails.queueInfo", { count: estimation.position - 1 })}
              </Text>
            </View>
          ) : selectedDate ? (
            <Text style={styles.helperText}>{t("serviceDetails.calculating")}</Text>
          ) : (
            <Text style={styles.helperText}>{t("serviceDetails.selectDateHelper")}</Text>
          )}

        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Booking Bar */}
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
});
