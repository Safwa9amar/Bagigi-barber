import { View, Text, StatusBar } from "react-native";
import React, { useEffect } from "react";
import { Slot, Stack, Tabs } from "expo-router";
import { withRoleGuard } from "@/components/auth/withRoleGuard";
import { Icon } from "@/components/ui/icon";
import {
  BookCheck,
  BookIcon,
  HomeIcon,
  MessagesSquare,
  User2,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { useChatStore } from "@/store/useChatStore";

const CustomerLayout = () => {
  const { t } = useTranslation();
  const { unreadCount } = useChatStore();

  useEffect(() => {
    console.log("Customer layout mounted");
  }, []);
  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#C5A35D",
          animation: "shift",
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: t("tabs.home"),
            tabBarIcon: ({ color }) => (
              <Icon as={HomeIcon} size="xl" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Bookings"
          options={{
            title: t("tabs.bookings"),
            tabBarIcon: ({ color }) => (
              <Icon as={BookIcon} size="xl" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="Messages"
          options={{
            title: t("tabs.messages"),
            tabBarIcon: ({ color }) => (
              <Icon as={MessagesSquare} size="xl" color={color} />
            ),
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
            tabBarBadgeStyle: { backgroundColor: '#EF4444' }
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            title: t("tabs.profile"),
            tabBarIcon: ({ color }) => (
              <Icon as={User2} size="xl" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="settings/personal-info"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="settings/notifications"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="settings/language"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="support/help-center"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="support/terms"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="support/privacy"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="settings/appearance"
          options={{ href: null }}
        />
      </Tabs>
    </View >
  );
};

export default withRoleGuard(CustomerLayout, "USER");
