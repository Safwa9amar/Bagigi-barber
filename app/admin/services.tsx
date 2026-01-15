import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, TextInput, ScrollView, Platform, KeyboardAvoidingView, Image, RefreshControl } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import api, { services as servicesApi } from "@/lib/api";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number | string;
  price_from: number | string;
  price_to?: number | string;
  description?: string;
  is_vip?: boolean;
  image?: string;
}

const serviceSchema = yup.object().shape({
  name: yup.string().required(),
  category: yup.string().required(),
  duration: yup.string().required(),
  priceFrom: yup.string().required(),
  priceTo: yup.string().optional().default(""),
  description: yup.string().optional().default(""),
  isVip: yup.boolean().required().default(false),
});

const getServiceSchema = (t: any) => yup.object().shape({
  name: yup.string().required(t("admin.services.form.validation.name")),
  category: yup.string().required(t("admin.services.form.validation.category")),
  duration: yup.string().required(t("admin.services.form.validation.duration")),
  priceFrom: yup.string().required(t("admin.services.form.validation.priceFrom")),
  priceTo: yup.string().optional().default(""),
  description: yup.string().optional().default(""),
  isVip: yup.boolean().required().default(false),
});

type ServiceFormData = yup.InferType<typeof serviceSchema>;

export default function AdminServices() {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const [services, setServices] = useState<Service[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<ServiceFormData>({
    resolver: yupResolver(getServiceSchema(t)),
    defaultValues: {
      name: "",
      category: "",
      duration: "",
      priceFrom: "",
      priceTo: "",
      description: "",
      isVip: false
    }
  });

  const isVip = watch("isVip");

  const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/services`);
      if (res.data?.data) {
        setServices(res.data.data);
      }
    } catch (e) {
      console.error("Failed to fetch services", e);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchServices();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      t("admin.services.deleteTitle"),
      t("admin.services.deleteConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${SERVER_URL}/services/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchServices();
            } catch (e) {
              Alert.alert(t("common.error"), t("admin.services.deleteError"));
            }
          }
        }
      ]
    );
  };

  const openModal = (service?: Service) => {
    if (service) {
      setEditingId(service.id);
      reset({
        name: service.name,
        category: service.category,
        duration: String(service.duration).replace(' min', ''),
        priceFrom: String(service.price_from),
        priceTo: service.price_to ? String(service.price_to) : "",
        description: service.description || "",
        isVip: Boolean(service.is_vip)
      });
      setSelectedImage(service.image || null);
    } else {
      setEditingId(null);
      reset({
        name: "",
        category: "",
        duration: "",
        priceFrom: "",
        priceTo: "",
        description: "",
        isVip: false
      });
      setSelectedImage(null);
    }
    setModalVisible(true);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = async (data: ServiceFormData) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', data.name);
      formDataToSend.append('category', data.category);
      formDataToSend.append('duration', data.duration);
      formDataToSend.append('priceFrom', data.priceFrom);
      if (data.priceTo) formDataToSend.append('priceTo', data.priceTo);
      formDataToSend.append('description', data.description || "");
      formDataToSend.append('isVip', String(data.isVip));

      if (selectedImage && !selectedImage.startsWith('/uploads')) {
        const filename = selectedImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;

        // @ts-ignore
        formDataToSend.append('image', { uri: selectedImage, name: filename, type });
      }

      if (editingId) {
        await servicesApi.update(editingId, formDataToSend)
      } else {
        await servicesApi.create(formDataToSend);

      }
      setModalVisible(false);
      fetchServices();
    } catch (e: any) {
      console.error(e);
      Alert.alert(t("common.error"), t("admin.services.saveError"));
    }
  };


  const categories = [t("home.all"), ...new Set(services.map(s => s.category))];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === t("home.all") || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });



  const renderItem = ({ item }: { item: Service }) => (
    <View className="bg-white dark:bg-[#2C2C2C] p-5 rounded-[24px] mb-4 shadow-sm border border-gray-100 dark:border-transparent">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg font-black text-gray-900 dark:text-white">{item.name}</Text>

          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-base font-medium">
            {item.category} • {item.duration} min
          </Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => openModal(item)}
            className="w-12 h-12 bg-[#E9EFFF] dark:bg-[#343A4E] rounded-full items-center justify-center shadow-sm"
          >
            <Ionicons name="pencil" size={20} color="#5E72E4" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            className="w-12 h-12 bg-[#FFE9E9] dark:bg-[#4E3434] rounded-full items-center justify-center shadow-sm"
          >
            <Ionicons name="trash" size={20} color="#F5365C" />
          </TouchableOpacity>
        </View>
      </View>
      <Text className="text-secondary-600 dark:text-[#C5A35D] font-extrabold text-md">{t("common.currency")} {item.price_from}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">


      <FlatList
        data={filteredServices}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C5A35D"
            colors={["#C5A35D"]}
          />
        }
        ListHeaderComponent={() => (
          <View className="mb-6 gap-5">
            {/* Header */}
            <View className="pt-14 px-1 flex-row justify-between items-center">
              <Text className="text-xl font-black text-gray-900 dark:text-white">{t("admin.services.title")}</Text>
              <TouchableOpacity
                onPress={() => openModal()}
                className="bg-white dark:bg-[#2C2C2C] px-5 py-3 rounded-full border border-gray-200 dark:border-gray-700 flex-row items-center gap-2 shadow-sm"
              >
                <Ionicons name="add" size={16} color="#C5A35D" />
                <Text className="text-gray-900 dark:text-white font-extrabold text-md">{t("admin.services.addService")}</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-gray-100 dark:bg-[#2C2C2C] px-5 py-3 rounded-[20px] shadow-inner">
              <Ionicons name="search" size={22} color="#9CA3AF" />
              <TextInput
                placeholder={t("admin.services.findServices")}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-3 text-lg text-gray-900 dark:text-white py-1"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat || (!selectedCategory && cat === t("home.all"));
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    className={`px-6 py-3 rounded-full mr-3 border ${isActive
                      ? 'bg-[#C5A35D] border-[#C5A35D]'
                      : 'bg-white dark:bg-[#333333] border-gray-200 dark:border-gray-700'
                      } shadow-sm`}
                  >
                    <Text className={`font-black text-sm ${isActive
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400'
                      }`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      />

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end">
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white dark:bg-background-muted rounded-t-3xl p-6 h-[85%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-typography-900 dark:text-typography-white">
                  {editingId ? t("admin.services.editService") : t("admin.services.newService")}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-4">
                  {/* Image Picker */}
                  <TouchableOpacity onPress={pickImage} className="h-48 bg-gray-100 dark:bg-[#333333] rounded-[24px] items-center justify-center overflow-hidden mb-2 border-2 border-dashed border-gray-200 dark:border-gray-700">
                    {selectedImage ? (
                      <Image
                        source={{ uri: selectedImage.startsWith('/uploads') ? process.env.EXPO_PUBLIC_API_URL + selectedImage : selectedImage }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="items-center">
                        <View className="bg-secondary-50 dark:bg-[#1E293B] p-4 rounded-full mb-3">
                          <Ionicons name="image-outline" size={36} color="#C5A35D" />
                        </View>
                        <Text className="text-gray-500 dark:text-gray-400 font-bold text-base">{t("admin.services.form.addPhoto")}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <View>
                    <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">{t("admin.services.form.name")}</Text>
                    <Controller
                      control={control}
                      name="name"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          className={`bg-gray-50 dark:bg-[#333333] p-4 rounded-[16px] text-lg text-gray-900 dark:text-white border ${errors.name ? 'border-red-500' : 'border-gray-100 dark:border-transparent'}`}
                          placeholder={t("admin.services.form.placeholder.name")}
                          placeholderTextColor="#9CA3AF"
                        />
                      )}
                    />
                    {errors.name && <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.name.message}</Text>}
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">{t("admin.services.form.category")}</Text>
                      <Controller
                        control={control}
                        name="category"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            className={`bg-gray-50 dark:bg-[#333333] p-4 rounded-[16px] text-lg text-gray-900 dark:text-white border ${errors.category ? 'border-red-500' : 'border-gray-100 dark:border-transparent'}`}
                            placeholder={t("admin.services.form.placeholder.category")}
                            placeholderTextColor="#9CA3AF"
                          />
                        )}
                      />
                      {errors.category && <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.category.message}</Text>}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">{t("admin.services.form.duration")}</Text>
                      <Controller
                        control={control}
                        name="duration"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            keyboardType="numeric"
                            className={`bg-gray-50 dark:bg-[#333333] p-4 rounded-[16px] text-lg text-gray-900 dark:text-white border ${errors.duration ? 'border-red-500' : 'border-gray-100 dark:border-transparent'}`}
                            placeholder={t("admin.services.form.placeholder.duration")}
                            placeholderTextColor="#9CA3AF"
                          />
                        )}
                      />
                      {errors.duration && <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.duration.message}</Text>}
                    </View>
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">{t("admin.services.form.priceFrom")}</Text>
                      <Controller
                        control={control}
                        name="priceFrom"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            keyboardType="numeric"
                            className={`bg-gray-50 dark:bg-[#333333] p-4 rounded-[16px] text-lg text-gray-900 dark:text-white border ${errors.priceFrom ? 'border-red-500' : 'border-gray-100 dark:border-transparent'}`}
                            placeholder={t("admin.services.form.placeholder.priceFrom")}
                            placeholderTextColor="#9CA3AF"
                          />
                        )}
                      />
                      {errors.priceFrom && <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.priceFrom.message}</Text>}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">{t("admin.services.form.priceTo")}</Text>
                      <Controller
                        control={control}
                        name="priceTo"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value || ""}
                            keyboardType="numeric"
                            className="bg-gray-50 dark:bg-[#333333] p-4 rounded-[16px] text-lg text-gray-900 dark:text-white border border-gray-100 dark:border-transparent"
                            placeholder={t("admin.services.form.placeholder.priceTo")}
                            placeholderTextColor="#9CA3AF"
                          />
                        )}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">{t("admin.services.form.description")}</Text>
                    <Controller
                      control={control}
                      name="description"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value || ""}
                          multiline
                          numberOfLines={3}
                          className="bg-gray-50 dark:bg-[#333333] p-4 rounded-[16px] text-lg text-gray-900 dark:text-white border border-gray-100 dark:border-transparent h-28"
                          placeholder={t("admin.services.form.placeholder.description")}
                          placeholderTextColor="#9CA3AF"
                          style={{ textAlignVertical: 'top' }}
                        />
                      )}
                    />
                  </View>

                  <Controller
                    control={control}
                    name="isVip"
                    render={({ field: { onChange, value } }) => (
                      <TouchableOpacity
                        onPress={() => onChange(!value)}
                        className="flex-row items-center gap-3 mt-2 bg-gray-50 dark:bg-[#333333] p-4 rounded-[16px]"
                      >
                        <View className={`w-6 h-6 rounded-md border-2 ${value ? 'bg-[#C5A35D] border-[#C5A35D]' : 'border-gray-300 dark:border-gray-600'} items-center justify-center`}>
                          {value && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                        <Text className="text-lg font-bold text-gray-900 dark:text-white">{t("admin.services.form.isVip")}</Text>
                      </TouchableOpacity>
                    )}
                  />

                  <TouchableOpacity onPress={() => handleSubmit(handleSave)()} className="bg-[#C5A35D] p-5 rounded-[24px] items-center mt-6 mb-10 shadow-lg shadow-secondary-500/30">
                    <Text className="text-white font-black text-2xl">{t("common.saveChanges")}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
