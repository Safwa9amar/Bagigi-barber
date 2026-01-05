import {
  FlatList,
  ScrollView,
  StyleSheet,
  View,
  Image,
  StatusBar,
} from "react-native";
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
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
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
  const [filteredServices, setFilteredServices] = useState<typeof services>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(
    new Set(services?.map((service) => service.category))
  );

  useEffect(() => {
    const getData = async () => {
      const { data } = await api.get("/services");
      if (data?.data) {
        setServices(data.data);
        setFilteredServices(data.data);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    let result = services;

    if (searchQuery.trim() !== "") {
      result = result?.filter((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) as any;
    }

    if (selectedCategory) {
      result = result?.filter(
        (service) => service.category === selectedCategory
      ) as any;
    }

    setFilteredServices(result);
  }, [searchQuery, selectedCategory, services]);

  return (
    <ScrollView
      className="bg-background-light dark:bg-background-dark px-5"
      contentContainerStyle={{ gap: 20, paddingTop: 24 }}
    >
      <Box className="flex-row gap-5 items-center bg-secondary-200 p-5 rounded-xl">
        <Image
          source={require("@/assets/images/logo.png")}
          className="h-24 w-24"
        />
        <View>
          <Text size="xl">
            {t("welcome")}, {t("welocome_to_bagigi")}
          </Text>
          <Text className="text-gray-500">{t("book_for_today")}</Text>
          <View className="my-4 flex flex-row justify-around">
            <Box className="bg-secondary-500  rounded-full p-3">
              <Icon as={Facebook} className="w-5 h-5" color="#fff" />
            </Box>
            <Box className="bg-secondary-500 rounded-full p-3">
              <Icon as={InstagramIcon} className="w-5 h-5" color="#fff" />
            </Box>
            <Box className="bg-secondary-500 rounded-full p-3">
              <Snapchat className="w-5 h-5" color="#fff" />
            </Box>
            <Box className="bg-secondary-500 rounded-full p-3">
              <Whatsup className="w-5 h-5" color="#fff" />
            </Box>
          </View>
        </View>
      </Box>

      <Heading className="dark:text-white">
        {t("our_signature_services")}
      </Heading>

      <InputField
        className="border-secondary-500"
        icon="search"
        placeholder={t("search_services")}
        onChange={setSearchQuery as any}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Box className="flex-row gap-3">
          <Button
            className="rounded-full"
            variant={selectedCategory === null ? "solid" : "outline"}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              className={`${
                selectedCategory === null ? "text-white" : "dark:text-white"
              }`}
            >
              {t("all")}
            </Text>
          </Button>

          {categories.map((cat) => (
            <Button
              key={cat}
              variant="outline"
              onPress={() => setSelectedCategory(cat)}
              className={`rounded-full ${
                selectedCategory === cat
                  ? "border-secondary-500 border bg-secondary-500"
                  : ""
              }`}
            >
              <Text
                className={`${
                  selectedCategory === cat ? "text-white" : "dark:text-white"
                }`}
              >
                {cat}
              </Text>
            </Button>
          ))}
        </Box>
      </ScrollView>

      {filteredServices?.map((item) => (
        <ServiceCard
          key={item.id}
          title={item.name}
          subtitle={item.category}
          price={item.price_from}
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
    </ScrollView>
  );
};

export default HomeScreen;
