import React from "react";
import { Tabs } from "expo-router";
import { Icon } from "@/components/ui/icon";
import {
  House,
  LayoutDashboard,
  ListCheck,
  CalendarCheck,
  Users,
  MessagesSquare,
  Settings
} from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { withRoleGuard } from "@/components/auth/withRoleGuard";

import { useChatStore } from "@/store/useChatStore";

const TabsLayout = () => {
  const { t } = useTranslation();
  const { unreadCount } = useChatStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#C5A35D",
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon as={House} color={color} size="xl" />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: t("tabs.appointments"),
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <Icon as={CalendarCheck} color={color} size="xl" />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: t("tabs.services"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon as={ListCheck} color={color} size="xl" />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: t("tabs.clients"),
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <Icon as={Users} color={color} size="xl" />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t("tabs.messages"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon as={MessagesSquare} color={color} size="xl" />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#EF4444' }
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
};

export default withRoleGuard(TabsLayout, "ADMIN");
