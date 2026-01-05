import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams, useNavigation } from "expo-router";

type Service = {
  name: string;
  image: string;
  category: string;
  duration: string;
  price_from: string;
};

export default function BookServiceScreen() {
  const navigation = useNavigation();
  const service: Service = useGlobalSearchParams();

  // State for selections
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");

  // Mock data for slots (In a real app, fetch these from your API)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = ["12", "13", "14", "15", "16", "17"];
  const timeSlots = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];

  return (
    <View className="bg-background-dark">
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

        <View className="bg-background-dark" style={styles.content}>
          {/* Service Info */}
          <Text style={styles.category}>{service.category?.toUpperCase()}</Text>
          <Text style={styles.title}>{service.name}</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={18} color="#D4AF37" />
              <Text style={styles.infoText}>
                {service.duration || "45 min"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="star" size={18} color="#D4AF37" />
              <Text style={styles.infoText}>4.8 (120 reviews)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Date Selection */}
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateList}
          >
            {dates.map((date, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDate(index)}
                style={[
                  styles.dateCard,
                  selectedDate === index && styles.selectedCard,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDate === index && styles.selectedText,
                  ]}
                >
                  {days[index]}
                </Text>
                <Text
                  style={[
                    styles.dateText,
                    selectedDate === index && styles.selectedText,
                  ]}
                >
                  {date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Time Selection */}
          <Text style={styles.sectionTitle}>Available Slots</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => setSelectedTime(time)}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.selectedCard,
                ]}
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedTime === time && styles.selectedText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Booking Bar */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>{service.price_from} DA</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, !selectedTime && { opacity: 0.6 }]}
          disabled={!selectedTime}
          onPress={() =>
            alert(`Booking confirmed for ${timeSlots[selectedTime as any]}`)
          }
        >
          <Text style={styles.bookText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0F0F0F",
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
    color: "#fff",
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
    backgroundColor: "#333",
    marginVertical: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  dateList: {
    marginBottom: 25,
  },
  dateCard: {
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginRight: 12,
    width: 65,
    borderWidth: 1,
    borderColor: "#333",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeSlot: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    width: "30%",
    alignItems: "center",
  },
  selectedCard: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  selectedText: {
    color: "#000",
    fontWeight: "bold",
  },
  dayText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  dateText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  timeText: {
    color: "#fff",
    fontWeight: "500",
  },
  footer: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    backgroundColor: "#1A1A1A",
    padding: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  totalLabel: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  totalPrice: {
    color: "#fff",
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
