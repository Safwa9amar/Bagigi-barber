import {
  ScrollView,
  View,
  Image,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Box } from "@/components/ui/box";
import api from "@/lib/api";
import ServiceCard from "@/components/ui/ServiceCard";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(
    new Set(services?.map((service) => service.category))
  );

  // const todayDate = format(new Date(), "EEEE, MMMM d"); 
  // Hardcoded English format by default, but ideally use locale. 
  // For simplicity keeping it English-like since design showed English.
  const todayDate = format(new Date(), "EEEE, MMMM d");

  const getData = async () => {
    try {
      const { data } = await api.get("/services");
      if (data?.data) {
        setServices(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  };

  useEffect(() => {
    let result = services;
    if (searchQuery.trim() !== "") {
      result = result?.filter((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory) {
      result = result?.filter((service) => service.category === selectedCategory);
    }
    setFilteredServices(result);
  }, [searchQuery, selectedCategory, services]);

  const VisitCard = () => {
    // Ideally this comes from last booking API. Using random/first service as placeholder or static content.
    // If no services, don't show.
    if (!services || services.length === 0) return null;
    const featured = services[0]; // Just take first one for demo

    return (
      <View className="bg-white dark:bg-[#1E1E1E] p-4 rounded-[24px] flex-row items-center mb-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <Image
          source={{ uri: process.env.EXPO_PUBLIC_API_URL + featured.image }}
          className="w-16 h-16 rounded-xl bg-gray-200"
        />
        <View className="flex-1 ml-4 justify-center">
          <Text className="text-lg font-bold text-[#1A1A1A] dark:text-white leading-tight">
            {featured.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="star" size={12} color="#D4AF37" />
            <Text className="text-xs text-gray-500 font-bold ml-1">4.8 (114)</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/service-details", params: { ...featured } })}
          className="bg-[#1A1A1A] dark:bg-white px-5 py-2.5 rounded-full"
        >
          <Text className="text-white dark:text-black font-bold text-xs">
            {t("home.book")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F9FAFB] dark:bg-[#0F0F0F] px-6"
      contentContainerStyle={{ paddingTop: 20, paddingBottom: 50 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <View className="flex-row items-center gap-3">
          <Image
            source={require("@/assets/images/logo.png")}
            className="w-10 h-10 rounded-full"
            resizeMode="cover"
          />
          <Text className="text-lg font-black uppercase tracking-widest text-[#1A1A1A] dark:text-white">
            {t("brand_name")}
          </Text>
        </View>
        <View className="flex-row gap-4">
          {/* <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={isDark ? "white" : "#1A1A1A"} />
          </TouchableOpacity> */}
          <TouchableOpacity onPress={() => router.push("/customer/Profile")}>
            <Ionicons name="menu-outline" size={24} color={isDark ? "white" : "#1A1A1A"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting */}
      <View className="mb-8">
        <Text className="text-3xl font-black text-[#1A1A1A] dark:text-white mb-1">
          {t("home.welcome")},
        </Text>
        <Text className="text-3xl font-black text-[#1A1A1A] dark:text-white mb-2">
          {user?.name?.split(" ")[0]} 👋
        </Text>
        <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">
          {todayDate}
        </Text>
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-white dark:bg-[#1E1E1E] px-4 py-4 rounded-[20px] mb-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          placeholder={t("home.search")}
          placeholderTextColor="#9CA3AF"
          className="ml-3 flex-1 text-[#1A1A1A] dark:text-white font-bold text-sm"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
        <TouchableOpacity
          onPress={() => setSelectedCategory(null)}
          className={`px-6 py-3 rounded-full mr-3 border ${selectedCategory === null
            ? "bg-[#1A1A1A] dark:bg-white border-[#1A1A1A] dark:border-white"
            : "bg-transparent border-gray-200 dark:border-gray-800"
            }`}
        >
          <Text
            className={`text-xs font-bold uppercase tracking-wider ${selectedCategory === null
              ? "text-white dark:text-[#1A1A1A]"
              : "text-gray-500 dark:text-gray-400"
              }`}
          >
            {t("home.all")}
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            className={`px-6 py-3 rounded-full mr-3 border ${selectedCategory === cat
              ? "bg-[#C5A35D] border-[#C5A35D]"
              : "bg-transparent border-gray-200 dark:border-gray-800"
              }`}
          >
            <Text
              className={`text-xs font-bold uppercase tracking-wider ${selectedCategory === cat
                ? "text-white"
                : "text-gray-500 dark:text-gray-400"
                }`}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Latest Visit */}
      <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-4 ml-1">
        {t("home.latestVisit")}
      </Text>
      <VisitCard />

      {/* Services List */}
      <View className="flex-row justify-between items-center mb-4 ml-1 mt-2">
        <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">
          {t("home.nearby")}
        </Text>
        <TouchableOpacity onPress={() => setSearchQuery("")}>
          <Text className="text-[#C5A35D] font-bold text-[10px] uppercase tracking-widest">
            {t("home.all")}
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        {filteredServices?.map((item) => (
          <ServiceCard
            key={item.id}
            title={item.name}
            subtitle={item.category}
            price={item.priceFrom}
            duration={item.duration}
            image={{ uri: process.env.EXPO_PUBLIC_API_URL + item.image }}
            onPress={() =>
              router.push({
                pathname: "/service-details",
                params: {
                  ...item,
                },
              })
            }
          />
        ))}
        {/* Add spacer if list is empty */}
        {(!filteredServices || filteredServices.length === 0) && (
          <Text className="text-gray-400 text-center mt-10 italic">
            No services found.
          </Text>
        )}
      </View>

    </ScrollView>
  );
};

export default HomeScreen;
