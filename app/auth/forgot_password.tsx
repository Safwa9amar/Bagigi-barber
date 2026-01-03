import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/store/useAuthStore";
import { t } from "@/constants/i18n";
import {
  Link,
  useFocusEffect,
  useGlobalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Controller, set, useForm } from "react-hook-form";
import { object, string, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api, { auth } from "@/lib/api";
import InputField from "@/components/ui/InputField";

const loginSchema = object({
  email: string().email(t("invalid_email")).required(t("required_email")),

  apiError: string().notRequired(),
});

export default function Login() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const scheme = useColorScheme();
  const { email }: { email: string } = useGlobalSearchParams();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(loginSchema),
    values: { email: email || "", apiError: "" },
  });

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      router.replace(
        user.role === "ADMIN"
          ? "../admin"
          : user.role === "USER"
          ? "../customer"
          : "../guest"
      );
    }, [user])
  );

  const onSubmit = async (data: any) => {
    console.log("LOGIN DATA:", data, isSubmitting);
    try {
      let response = await auth.register(data.email, data.password, data.phone);
    } catch (error: any) {
      setError("apiError", {
        type: "manual",
        message: error.response.data.error || "Registration failed",
      });
      console.error(error.response.data.error || error);
    }
  };

  return (
    <Box className="flex-1 justify-center px-6 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "position"}
      >
        {/* Branding */}
        <Box className="items-center mb-10">
          <Image
            source={require("@/assets/images/logo.png")}
            className="w-44 h-44"
          />
          <Text className="text-3xl font-bold mt-4 text-typography-500 dark:text-typography-50">
            {t("brand_name")}
          </Text>
          <Text className="text-typography-500 dark:text-typography-50 text-center mt-1">
            {t("brand_tagline")}
          </Text>
        </Box>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={scheme === "dark" ? "#fff" : "#000"}
          />
        ) : (
          <>
            {/* Email */}
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <InputField
                  {...field}
                  icon="mail-outline"
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
            />

            {/* Submit Button */}
            <Button
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              className="bg-secondary-500 rounded-xl"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-medium">
                  {t("reset_password")}
                </Text>
              )}
            </Button>
          </>
        )}
        <Link href="/auth/login" asChild>
          <TouchableOpacity className="mt-4 self-center">
            <Text className="text-secondary-500">{t("back_to_login")}</Text>
          </TouchableOpacity>
        </Link>

        {/* Footer */}
        <Text className="text-xs text-center mt-6 text-typography-500 dark:text-typography-50">
          {t("terms_and_privacy")}
        </Text>
      </KeyboardAvoidingView>
    </Box>
  );
}
