import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { booking } from "@/lib/api";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Config from "@/constants/Config";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

type Booking = {
  id: string;
  serviceName: string;
  serviceImage: string;
  date: string;
  status: string;
  position: number;
  price: number;
};

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const fetchBookings = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const res = await booking.getMyBookings();
      setBookings(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const renderItem = ({ item }: { item: Booking }) => (
    <View
      style={styles.card}
      className="bg-white dark:bg-background-muted border-outline-300 dark:border-gray-800"
    >
      <Image
        source={{ uri: Config.apiUrl + item.serviceImage }}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text
            style={styles.serviceName}
            className="text-typography-900 dark:text-typography-white"
          >
            {item.serviceName}
          </Text>
          <Text style={[styles.status, getStatusStyle(item.status)]}>
            {t(`bookings.status.${item.status}`)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text style={styles.dateText}>
            {format(new Date(item.date), "MMM dd, yyyy • HH:mm")}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={14} color="#9CA3AF" />
          <Text style={styles.dateText}>
            {t("bookings.queuePosition")} #{item.position}
          </Text>
        </View>
      </View>
    </View>
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return { color: "#fbbf24" };
      case "IN_PROGRESS":
        return { color: "#3b82f6" };
      case "DONE":
        return { color: "#22c55e" };
      case "CANCELLED":
        return { color: "#ef4444" };
      default:
        return { color: "#9CA3AF" };
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.container, styles.centered]}
        className="bg-background-light dark:bg-background-dark"
      >
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View
        style={styles.container}
        className="bg-background-light dark:bg-background-dark"
      >
        <Image
          source={require("@/assets/images/bookings_guest.png")}
          style={styles.illustration}
          resizeMode="cover"
        />
        <View style={styles.guestContent}>
          <Text
            style={styles.guestTitle}
            className="text-typography-900 dark:text-typography-white"
          >
            {t("bookings.guestTitle") || "Your Bookings"}
          </Text>
          <Text style={styles.guestDescription}>
            {t("bookings.guestDescription") ||
              "Please login or register to see your booking history and current status."}
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/customer/Profile")}
          >
            <Text style={styles.loginButtonText}>
              {t("auth.login_register") || "Login / Register"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => router.push("/customer/home")}
          >
            <Text style={styles.backHomeText}>
              {t("common.back_home") || "Back to Home"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      className="bg-background-light dark:bg-background-dark"
    >
      <View style={styles.viewHeader} className="bg-white dark:bg-background-muted">
        <Text
          style={styles.title}
          className="text-typography-900 dark:text-typography-white"
        >
          {t("bookings.title")}
        </Text>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          bookings.length === 0 ? styles.centered : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D4AF37"
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText} className="dark:text-gray-400">
              {t("bookings.empty")}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  illustration: {
    width: width,
    height: width * 0.8,
    marginTop: 40,
  },
  guestContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 16,
  },
  guestDescription: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: "#C5A35D",
    width: "100%",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#C5A35D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  backHomeButton: {
    marginTop: 24,
  },
  backHomeText: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "bold",
  },
  viewHeader: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 20,
  },
  card: {
    flexDirection: "row",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    borderWidth: 1,
  },
  image: {
    width: 80,
    height: 100,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  status: {
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "uppercase",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  dateText: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
});

export default Bookings;
