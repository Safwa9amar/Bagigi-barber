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
import { useTranslation } from "react-i18next";
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



export default function Login() {
  const { login, isLoading } = useAuthStore();
  const scheme = useColorScheme();
  const { email }: { email: string } = useGlobalSearchParams();
  const { t } = useTranslation();

  const loginSchema = object({
    email: string().email(t("invalid_email")).required(t("required_email")),
    password: string().min(6, t("min_password")).required(t("required_password")),
    resetToken: string().required(t("required_reset_token")),
    confirmPassword: string()
      .oneOf([ref("password")], t("password_match"))
      .required(t("required_confirm_password")),
    apiError: string().notRequired(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(loginSchema),
    values: {
      email: email || "",
      apiError: "",
      password: "",
      confirmPassword: "",
      resetToken: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      let { token, user } = await auth.resetPassword(
        data.email,
        data.password,
        data.resetToken
      );
      login(user, token);
    } catch (error: any) {
      setError("apiError", {
        type: "manual",
        message: error.response.data.error || t("password_reset_failed"),
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
                  placeholder={t("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
            />
            {/* reset token */}
            <Controller
              control={control}
              name="resetToken"
              render={({ field }) => (
                <InputField
                  {...field}
                  icon="key-outline"
                  placeholder={t("reset_token")}
                  error={errors.resetToken?.message}
                />
              )}
            />
            {/* Password */}
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <InputField
                  {...field}
                  icon="lock-closed-outline"
                  placeholder={t("password")}
                  secureTextEntry
                  error={errors.password?.message}
                />
              )}
            />
            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <InputField
                  {...field}
                  icon="lock-closed-outline"
                  placeholder={t("confirm_password")}
                  secureTextEntry
                  error={errors.confirmPassword?.message}
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
        <Link href="/(auth)" asChild>
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
