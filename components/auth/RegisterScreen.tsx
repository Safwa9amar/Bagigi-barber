import React, { useState } from "react";
import { ActivityIndicator, useColorScheme, TouchableOpacity } from "react-native";
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
 * RegisterScreen
 */
export function RegisterScreen({ goTo }: AuthScreenProps) {
  const scheme = useColorScheme();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const schema = object({
    email: string().email(t("invalid_email")).required(t("required_email")),
    phone: string().matches(/^0[567]\d{8}$/, t("invaild_phone")).required(t("required_phone")),
    password: string().min(8, t("min_password")).required(t("required_password")),
    confirmPassword: string().oneOf([ref("password")], t("password_match")).required(),
    apiError: string().notRequired(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data: any) => {
    try {
      await auth.register(data.email, data.password, data.phone);
      goTo("confirm_code", { email: data.email });
    } catch (error: any) {
      setError("apiError", {
        type: "manual",
        message: error.response?.data?.error || t("registration_failed"),
      });
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
          <Controller control={control} name="phone" render={({ field }) => <InputField {...field} icon="call-outline" placeholder={t("phone_number")} keyboardType="phone-pad" error={errors.phone?.message} />} />
          <Controller control={control} name="password" render={({ field }) => <InputField {...field} icon="lock-closed-outline" placeholder={t("password")} secure={!showPassword} secureTextEntry={!showPassword} toggleSecure={() => setShowPassword((v) => !v)} error={errors.password?.message} />} />
          <Controller control={control} name="confirmPassword" render={({ field }) => <InputField {...field} icon="lock-closed-outline" placeholder={t("confirm_password")} secure={!showPassword} secureTextEntry={!showPassword} error={errors.confirmPassword?.message} />} />
          {errors.apiError && <Text className="text-red-500 my-5 text-center">{errors.apiError.message}</Text>}
          <Button disabled={isSubmitting} onPress={handleSubmit(onSubmit)} className="bg-secondary-500 rounded-xl">
            <Text className="text-white font-medium">{t("continue")}</Text>
          </Button>
        </>
      )}
      <TouchableOpacity className="mt-4 self-center" onPress={() => goTo("login")}>
        <Text className="text-secondary-500">
          {t("have_account")}
          <Text className="font-medium">{t("login")}</Text>
        </Text>
      </TouchableOpacity>
    </>
  );
}
