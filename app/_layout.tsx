import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { I18nManager, View } from "react-native";
import { useColorScheme } from "nativewind"; // Use NativeWind hook
import { Stack } from "expo-router";
import "@/lib/i18n/i18n"; // Initialize i18n
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";

// Disable console.log in production
if (!__DEV__) {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.debug = () => {};
  // Keeping console.error for critical issue tracking
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

SplashScreen.preventAutoHideAsync();

import { registerForPushNotificationsAsync } from "@/lib/notifications";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";
import { auth } from "@/lib/api";
import { useReceiptStore } from "@/store/useReceiptStore";
import { TrialGuard } from "@/components/TrialGuard";

import { useSegments } from "expo-router";
import { getSocket } from "@/lib/socket";
import { useChatStore } from "@/store/useChatStore";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const { user, token, isAuthenticated, logout } = useAuthStore();
  const { incrementUnreadCount } = useChatStore();
  const segments = useSegments();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Global Socket Listener for Badges
  useEffect(() => {
    if (!user || !token) return;

    const socket = getSocket(user.id, user.role);

    const handleMessage = (msg: any) => {
      // Check if we are NOT on a chat screen
      // Customer chat: [customer, Messages]
      // Admin chat: [admin, messages, [id]]
      const isCustomerChat =
        segments[0] === "customer" && segments[1] === "Messages";
      const isAdminChat =
        segments[0] === "admin" &&
        segments[1] === "messages" &&
        segments.length === 3;

      if (!isCustomerChat && !isAdminChat) {
        incrementUnreadCount();
      }
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, [user, token, segments, incrementUnreadCount]);

  // Register for Push Notifications
  useEffect(() => {
    registerForPushNotificationsAsync().then(async (pushToken) => {
      console.log("Push Token:", pushToken);
      if (pushToken && user && token) {
        // Send to backend
        try {
          await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/push-token`,
            { pushToken },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          console.log("Push token registered with backend");
        } catch (e) {
          console.error("Failed to sync push token", e);
        }
      }
    });
  }, [loaded, user, token]); // Re-run if user logs in

  return (
    <TrialGuard>
      <RootLayoutNav onLogout={logout} />
    </TrialGuard>
  );
}

function RootLayoutNav({ onLogout }: { onLogout: () => Promise<void> | void }) {
  const { colorScheme } = useColorScheme();
  const colorMode = colorScheme === "dark" ? "dark" : "light";

  return (
    <GluestackUIProvider mode={colorMode as "light" | "dark"}>
      <ThemeProvider value={colorMode === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="customer" />
          <Stack.Screen
            name="service-details"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
