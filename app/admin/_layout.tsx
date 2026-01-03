import React from "react";
import { Tabs } from "expo-router";
import { Icon } from "@/components/ui/icon";
import {
  House,
  LayoutDashboard,
  ListCheck,
  CalendarCheck,
  Users,
} from "lucide-react-native";
import { t } from "@/constants/i18n";
import { withRoleGuard } from "@/components/auth/withRoleGuard";

const TabsLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Icon as={House} color={color} size="xl" />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: t("services"),
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Icon as={ListCheck} color={color} size="xl" />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("dashboard"),
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Icon as={LayoutDashboard} color={color} size="xl" />
          ),
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: t("appointments"),
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Icon as={CalendarCheck} color={color} size="xl" />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: t("clients"),
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Icon as={Users} color={color} size="xl" />
          ),
        }}
      />
    </Tabs>
  );
};

export default withRoleGuard(TabsLayout, "ADMIN");
