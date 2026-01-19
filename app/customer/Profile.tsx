import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = () => {
    Alert.alert(
      t("profile.logoutConfirm") || "Logout",
      t("profile.logoutConfirmMessage") || "Are you sure you want to logout?",
      [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        {
          text: t("profile.logout") || "Logout",
          style: "destructive",
          onPress: async () => {
            logout();
            router.replace("/(auth)");
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    label,
    onPress,
    detail,
    isDestructive = false,
  }: {
    icon: any;
    label: string;
    onPress: () => void;
    detail?: string;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center p-5 bg-white dark:bg-[#1E1E1E] mb-3 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800`}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center ${isDestructive ? "bg-red-50 dark:bg-red-900/10" : "bg-[#C5A35D]10"
          }`}
        style={!isDestructive ? { backgroundColor: "#C5A35D10" } : {}}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isDestructive ? "#EF4444" : "#C5A35D"}
        />
      </View>
      <View className="flex-1 ml-4">
        <Text
          className={`text-sm font-black ${isDestructive ? "text-red-500" : "text-[#1A1A1A] dark:text-white"
            }`}
        >
          {label}
        </Text>
        {detail && (
          <Text className="text-gray-400 text-[10px] font-bold mt-0.5">
            {detail}
          </Text>
        )}
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={isDestructive ? "#EF444490" : "#9CA3AF"}
      />
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest ml-1 mb-3">
      {title}
    </Text>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]">
      {/* Header */}
      <View className="pt-16 pb-8 px-5 bg-white dark:bg-[#0F0F0F] items-center border-b border-gray-100 dark:border-gray-800">
        <View
          className="w-24 h-24 rounded-full items-center justify-center relative shadow-sm"
          style={{ backgroundColor: "#C5A35D15" }}
        >
          <Image
            source={{
              uri:
                "https://ui-avatars.com/api/?name=" +
                (user?.name || user?.email?.split("@")[0] || "User") +
                "&background=C5A35D&color=fff",
            }}
            className="w-24 h-24 rounded-full border-4 border-white dark:border-[#1E1E1E]"
          />
          <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 bg-[#C5A35D] rounded-full items-center justify-center border-2 border-white dark:border-[#0F0F0F]">
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text className="text-xl font-black text-[#1A1A1A] dark:text-white mt-4">
          {user?.name || user?.email?.split("@")[0] || t("profile.guest")}
        </Text>
        <Text className="text-gray-400 font-bold text-xs">{user?.email}</Text>
        <View
          className="mt-3 px-4 py-1.5 rounded-full bg-[#C5A35D20]"
          style={{ backgroundColor: "#C5A35D15" }}
        >
          <Text className="text-[#C5A35D] font-black text-[10px] uppercase tracking-widest">
            {user?.role || "CUSTOMER"}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 pt-6 px-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8">
          <SectionTitle title={t("profile.accountSettings") || "Account Settings"} />
          <SettingItem
            icon="person-outline"
            label={t("profile.personalInfo")}
            onPress={() => router.push("/customer/settings/personal-info")}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            label={t("profile.security") || "Security"}
            onPress={() => router.push("/customer/settings/security")}
          />
          <SettingItem
            icon="color-palette-outline"
            label={t("profile.appearance")}
            onPress={() => router.push("/customer/settings/appearance")}
          />
          <SettingItem
            icon="notifications-outline"
            label={t("profile.notifications")}
            onPress={() => router.push("/customer/settings/notifications")}
          />
          <SettingItem
            icon="language-outline"
            label={t("profile.language")}
            onPress={() => router.push("/customer/settings/language")}
          />
        </View>

        <View className="mb-8">
          <SectionTitle title={t("profile.support") || "Support & Legal"} />
          <SettingItem
            icon="help-circle-outline"
            label={t("profile.helpCenter")}
            onPress={() => router.push("/customer/support/help-center")}
          />
          <SettingItem
            icon="document-text-outline"
            label={t("profile.terms")}
            onPress={() => router.push("/customer/support/terms")}
          />
          <SettingItem
            icon="lock-closed-outline"
            label={t("profile.privacy")}
            onPress={() => router.push("/customer/support/privacy")}
          />
          <SettingItem
            icon="code-slash-outline"
            label={t("profile.developerInfo")}
            onPress={() => router.push("/customer/support/developer")}
          />
        </View>

        <SettingItem
          icon="log-out-outline"
          label={t("profile.logout")}
          onPress={handleLogout}
          isDestructive={true}
        />

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
