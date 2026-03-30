import React from "react";
import { ActivityIndicator, useColorScheme, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { auth } from "@/lib/api";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/InputField";
import { Brand, AuthScreenProps } from "./AuthShared";

/**
 * ForgotPasswordScreen
 */
export function ForgotPasswordScreen({ goTo, params }: AuthScreenProps) {
  const scheme = useColorScheme();
  const { t } = useTranslation();

  const schema = object({ email: string().email(t("invalid_email")).required(t("required_email")), apiError: string().notRequired() });
  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: yupResolver(schema),
    values: { email: params?.email || "", apiError: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      await auth.forgotPassword(data.email);
      goTo("reset_password", { email: data.email });
    } catch (error: any) {
      setError("apiError", { type: "manual", message: error.response?.data?.error || t("request_failed") });
    }
  };

  return (
    <>
      <Brand />
      {isSubmitting ? (
        <ActivityIndicator size="large" color={scheme === "dark" ? "#fff" : "#C5A35D"} />
      ) : (
        <>
          <Controller control={control} name="email" render={({ field }) => <InputField {...field} icon="mail-outline" placeholder={t("email")} keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />} />
          {errors.apiError && <Text className="text-red-500 my-3 text-center">{errors.apiError.message}</Text>}
          <Button disabled={isSubmitting} onPress={handleSubmit(onSubmit)} className="bg-secondary-500 rounded-xl">
            <Text className="text-white font-medium">{t("request_reset")}</Text>
          </Button>
        </>
      )}
      <TouchableOpacity className="mt-4 self-center" onPress={() => goTo("login")}>
        <Text className="text-secondary-500">{t("back_to_login")}</Text>
      </TouchableOpacity>
    </>
  );
}
