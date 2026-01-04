import { View, Text } from "react-native";
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

const CustomerLayout = () => {
  useEffect(() => {
    console.log("Customer layout mounted");
  }, []);
  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#D4AF37",
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ color }) => (
              <Icon as={HomeIcon} size="xl" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Bookings"
          options={{
            tabBarIcon: ({ color }) => (
              <Icon as={BookIcon} size="xl" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Book"
          options={{
            tabBarIcon: ({ color }) => (
              <Icon as={BookCheck} size="xl" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Messages"
          options={{
            tabBarIcon: ({ color }) => (
              <Icon as={MessagesSquare} size="xl" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            tabBarIcon: ({ color }) => (
              <Icon as={User2} size="xl" color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

export default withRoleGuard(CustomerLayout, "USER");
