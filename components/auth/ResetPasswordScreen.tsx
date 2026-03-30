import React from "react";
import { ActivityIndicator, useColorScheme, TouchableOpacity } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { object, string, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { auth } from "@/lib/api";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/InputField";
import { Brand, AuthScreenProps } from "./AuthShared";

/**
 * ResetPasswordScreen
 */
export function ResetPasswordScreen({ goTo, params }: AuthScreenProps) {
  const { login, isLoading } = useAuthStore();
  const scheme = useColorScheme();
  const { t } = useTranslation();

  const schema = object({
    email: string().email(t("invalid_email")).required(t("required_email")),
    resetToken: string().required(t("required_reset_token")),
    password: string().min(6, t("min_password")).required(t("required_password")),
    confirmPassword: string().oneOf([ref("password")], t("password_match")).required(t("required_confirm_password")),
    apiError: string().notRequired(),
  });

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: yupResolver(schema),
    values: { email: params?.email || "", apiError: "", password: "", confirmPassword: "", resetToken: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      const { token, user } = await auth.resetPassword(data.email, data.password, data.resetToken);
      login(user, token);
    } catch (error: any) {
      setError("apiError", { type: "manual", message: error.response?.data?.error || t("password_reset_failed") });
    }
  };

  return (
    <>
      <Brand />
      {isLoading ? (
        <ActivityIndicator size="large" color={scheme === "dark" ? "#fff" : "#C5A35D"} />
      ) : (
        <>
          <Controller control={control} name="email" render={({ field }) => <InputField {...field} icon="mail-outline" placeholder={t("email")} keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />} />
          <Controller control={control} name="resetToken" render={({ field }) => <InputField {...field} icon="key-outline" placeholder={t("reset_token")} error={errors.resetToken?.message} />} />
          <Controller control={control} name="password" render={({ field }) => <InputField {...field} icon="lock-closed-outline" placeholder={t("password")} secureTextEntry error={errors.password?.message} />} />
          <Controller control={control} name="confirmPassword" render={({ field }) => <InputField {...field} icon="lock-closed-outline" placeholder={t("confirm_password")} secureTextEntry error={errors.confirmPassword?.message} />} />
          {errors.apiError && <Text className="text-red-500 my-3 text-center">{errors.apiError.message}</Text>}
          <Button disabled={isSubmitting} onPress={handleSubmit(onSubmit)} className="bg-secondary-500 rounded-xl">
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-medium">{t("reset_password")}</Text>}
          </Button>
        </>
      )}
      <TouchableOpacity className="mt-4 self-center" onPress={() => goTo("login")}>
        <Text className="text-secondary-500">{t("back_to_login")}</Text>
      </TouchableOpacity>
    </>
  );
}
