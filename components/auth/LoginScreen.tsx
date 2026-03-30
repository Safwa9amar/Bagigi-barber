import React, { useState } from "react";
import { ActivityIndicator, useColorScheme, TouchableOpacity } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { auth } from "@/lib/api";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/InputField";
import { Brand, AuthScreenProps } from "./AuthShared";
import { useRouter } from "expo-router";

/**
 * LoginScreen
 */
export function LoginScreen({ goTo }: AuthScreenProps) {
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const scheme = useColorScheme();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const schema = object({
    email: string().email(t("invalid_email")).required(t("required_email")),
    password: string().min(8, t("min_password")).required(t("required_password")),
    apiError: string().notRequired(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm({ resolver: yupResolver(schema) });
  const email = watch("email");

  const onSubmit = async (data: any) => {
    try {
      const { token, user } = await auth.login(data.email, data.password);
      login(user, token);
      
      // If the user is an admin, redirect them directly to the admin index
      if (user?.role === "ADMIN") {
        router.replace("/admin");
      }
    } catch (error: any) {
      setError("apiError", {
        type: "manual",
        message: error.response?.data?.error || error.message || t("login_failed"),
      });
    }
  };

  return (
    <>
      <Brand />
      {isLoading ? (
        <ActivityIndicator size="large" color={scheme === "dark" ? "#fff" : "#C5A35D"} />
      ) : (
        <>
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
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <InputField
                {...field}
                icon="lock-closed-outline"
                placeholder={t("password")}
                secure={!showPassword}
                secureTextEntry={!showPassword}
                toggleSecure={() => setShowPassword((v) => !v)}
                error={errors.password?.message}
              />
            )}
          />
          <TouchableOpacity
            className="mb-4 self-end"
            onPress={() => goTo("forgot_password", { email: email || "" })}
          >
            <Text className="text-secondary-500">{t("forgot_password")}</Text>
          </TouchableOpacity>
          {errors.apiError && (
            <Text className="text-red-500 my-3 text-center">{errors.apiError.message}</Text>
          )}
          <Button disabled={isSubmitting} onPress={handleSubmit(onSubmit)} className="bg-secondary-500 rounded-xl">
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-medium">{t("login")}</Text>
            )}
          </Button>
        </>
      )}
      <TouchableOpacity className="mt-4 self-center" onPress={() => goTo("register")}>
        <Text className="text-secondary-500">
          {t("no_account")}
          <Text className="font-medium">{t("register")}</Text>
        </Text>
      </TouchableOpacity>
    </>
  );
}
