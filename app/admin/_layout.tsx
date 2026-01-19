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
import { useBookingStore } from "@/store/useBookingStore";
import { getSocket } from "@/lib/socket";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const TabsLayout = () => {
  const { t } = useTranslation();
  const { unreadCount } = useChatStore();
  const { newBookingCount, incrementNewBookingCount } = useBookingStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const socket = getSocket(user.id, "ADMIN");
    if (!socket) return;

    const handleNewBooking = (data: any) => {
      console.log("New booking received:", data);
      incrementNewBookingCount();
    };

    socket.on("new_booking", handleNewBooking);

    return () => {
      socket.off("new_booking", handleNewBooking);
    };
  }, [user, incrementNewBookingCount]);

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
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon as={CalendarCheck} color={color} size="xl" />
          ),
          tabBarBadge: newBookingCount > 0 ? newBookingCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#EF4444' }
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
