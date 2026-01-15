import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, RefreshControl } from "react-native";
import { booking } from "@/lib/api";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

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

  const fetchBookings = async () => {
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
    <View style={styles.card} className="bg-white dark:bg-background-muted border-outline-300 dark:border-gray-800">
      <Image
        source={{ uri: process.env.EXPO_PUBLIC_API_URL + item.serviceImage }}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text style={styles.serviceName} className="text-typography-900 dark:text-typography-white">{item.serviceName}</Text>
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
      case 'PENDING': return { color: '#fbbf24' }; // amber-400
      case 'IN_PROGRESS': return { color: '#3b82f6' }; // blue-500
      case 'DONE': return { color: '#22c55e' }; // green-500
      case 'CANCELLED': return { color: '#ef4444' }; // red-500
      default: return { color: '#9CA3AF' };
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]} className="bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    )
  }

  return (
    <View style={styles.container} className="bg-background-light dark:bg-background-dark">
      <View style={styles.header} className="bg-white dark:bg-background-muted">
        <Text style={styles.title} className="text-typography-900 dark:text-typography-white">{t("bookings.title")}</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t("bookings.empty")}</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    padding: 20
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
  },
  image: {
    width: 80,
    height: 100,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  serviceName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  status: {
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  dateText: {
    color: '#9CA3AF',
    fontSize: 13
  },
  emptyText: {
    color: '#666',
    fontSize: 16
  }

});

export default Bookings;
