import React from "react";
import { TouchableOpacity, Image, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Box } from "@/components/ui/box";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AuthScreen =
  | "login"
  | "register"
  | "confirm_code"
  | "forgot_password"
  | "reset_password";

export interface AuthScreenProps {
  goTo: (screen: AuthScreen, params?: Record<string, string>) => void;
  params?: Record<string, string>;
}

// ─── Shared branding header ───────────────────────────────────────────────────
export function Brand() {
  const { t } = useTranslation();
  return (
    <Box className="items-center mb-10">
      <Image source={require("@/assets/images/logo.png")} className="w-36 h-36" />
      <Text className="text-3xl font-bold mt-4 text-typography-500 dark:text-typography-50">
        {t("brand_name")}
      </Text>
      <Text className="text-typography-500 dark:text-typography-50 text-center mt-1">
        {t("brand_tagline")}
      </Text>
    </Box>
  );
}
