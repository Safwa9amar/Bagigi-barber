import { FlatList, ScrollView, StyleSheet, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import api from "@/lib/api";
import * as SecureStore from "expo-secure-store";
import ServiceCard from "@/components/ui/ServiceCard";
import { Heading } from "@/components/ui/heading";
import InputField from "@/components/ui/InputField";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { t } from "@/constants/i18n";
import { Icon } from "@/components/ui/icon";
import { Facebook, InstagramIcon } from "lucide-react-native";
import Snapchat from "@/assets/icons/Snapchat";
import Whatsup from "@/assets/icons/Whatsup";
const HomeScreen = () => {
  const [services, setServices] = useState<
    [
      {
        id: string;
        name: string;
        category: string;
        price_from: number;
        duration: string;
        image: string;
      }
    ]
  >();
  useEffect(() => {
    const getData = async () => {
      const { data } = await api.get("/services");
      if (data) setServices(data?.data);
    };
    getData();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* 👋 Welcome */}
      <Box className="mt-4 mb-3">
        <Text size="xl">👋 {t("welcome")}, Mohamed</Text>
        <Text className="text-gray-500">{t("book_for_today")}</Text>
      </Box>
      {/* 🔍 Search */}
      <Box className="my-5">
        <InputField icon="search" placeholder={t("search_services")} />
      </Box>

      <Box className="flex flex-row justify-around mb-6">
        <Box className="bg-[#D4AF37] rounded-xl p-5">
          <Icon as={Facebook} className="w-10 h-10" color="#fff" />
        </Box>
        <Box className="bg-[#D4AF37] rounded-xl p-5">
          <Icon as={InstagramIcon} className="w-10 h-10" color="#fff" />
        </Box>
        <Box className="bg-[#D4AF37] rounded-xl p-5">
          <Snapchat className="w-10 h-10" color="#fff" />
        </Box>
        <Box className="bg-[#D4AF37] rounded-xl p-5">
          <Whatsup className="w-10 h-10" color="#fff" />
        </Box>
      </Box>

      {/* 🛠️ Popular Services */}
      <Heading className="mb-3">{t("popular_services")}</Heading>
      <FlatList
        data={services}
        horizontal
        renderItem={({ item }) => (
          <ServiceCard
            key={item.id}
            title={item.name}
            subtitle={item.category}
            price={item.price_from}
            duration={item.duration}
            image={{ uri: process.env.EXPO_PUBLIC_API_URL + item.image }}
            onPress={() => console.log("Book", item.name)}
          />
        )}
      />
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  vipBanner: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },

  vipImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },

  vipTitle: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
  },

  vipSubtitle: {
    color: "#ddd",
    fontSize: 12,
    marginTop: 4,
  },

  bookingCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 16,
    marginTop: 24,
  },
});
