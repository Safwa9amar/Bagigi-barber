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

/**
 * ConfirmCodeScreen
 */
export function ConfirmCodeScreen({ goTo, params }: AuthScreenProps) {
  const { login, isLoading } = useAuthStore();
  const scheme = useColorScheme();
  const [resending, setResending] = useState(false);
  const { t } = useTranslation();
  const email = params?.email || "";

  const schema = object({ code: string().required(t("required_code")), apiError: string().notRequired() });
  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data: any) => {
    try {
      const { token, user } = await auth.verifyConfirmationCode(email, data.code);
      login(user, token);
    } catch (error: any) {
      setError("apiError", { type: "manual", message: error.response?.data?.error || t("verification_failed") });
    }
  };

  const resendCode = async () => {
    setResending(true);
    try { await auth.requestNewConfirmationCode(email); } catch {} finally { setResending(false); }
  };

  return (
    <>
      <Brand />
      {isLoading || resending ? (
        <ActivityIndicator size="large" color={scheme === "dark" ? "#fff" : "#C5A35D"} />
      ) : (
        <>
          <Controller control={control} name="code" render={({ field }) => <InputField {...field} icon="lock-closed-outline" placeholder={t("code")} error={errors.code?.message} />} />
          {errors.apiError && <Text className="text-red-500 my-5 text-center">{errors.apiError.message}</Text>}
          <Button disabled={isSubmitting} onPress={handleSubmit(onSubmit)} className="bg-secondary-500 rounded-xl">
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-medium">{t("verify")}</Text>}
          </Button>
          <TouchableOpacity onPress={resendCode} className="mt-4 self-center">
            <Text className="text-secondary-500">{t("did_not_receive_code")} <Text className="font-medium">{t("resend_code")}</Text></Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );
}
