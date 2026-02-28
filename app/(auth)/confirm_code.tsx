import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import { Link, useGlobalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { auth } from "@/lib/api";
import InputField from "@/components/ui/InputField";

const resolveLogoUri = (value?: string | null) => {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${process.env.EXPO_PUBLIC_API_URL}${value}`;
};

export default function Login() {
  const { login, isLoading } = useAuthStore();
  const scheme = useColorScheme();
  const { email, shopCode, adminCode } = useGlobalSearchParams<{
    email: string;
    shopCode?: string;
    adminCode?: string;
  }>();
  const [resending, setResending] = useState(false);
  const [barberName, setBarberName] = useState("");
  const [barberLogo, setBarberLogo] = useState<string | null>(null);
  const { t } = useTranslation();
  const selectedAdminCode = useMemo(() => {
    const raw = typeof adminCode === "string" ? adminCode : shopCode;
    return typeof raw === "string" ? raw.trim().toUpperCase() : "";
  }, [adminCode, shopCode]);

  useEffect(() => {
    let mounted = true;

    const fetchBarber = async () => {
      if (!selectedAdminCode.startsWith("ADM")) {
        setBarberName("");
        setBarberLogo(null);
        return;
      }

      try {
        const res = await auth.getAdmins();
        const matched = res?.data?.find(
          (admin) => admin.code.toUpperCase() === selectedAdminCode,
        );
        if (!mounted) return;
        setBarberName(matched?.name || "");
        setBarberLogo(matched?.logo || matched?.barberLogoUri || null);
      } catch (error) {
        if (!mounted) return;
        setBarberName("");
        setBarberLogo(null);
      }
    };

    fetchBarber();
    return () => {
      mounted = false;
    };
  }, [selectedAdminCode]);

  const loginSchema = object({
    code: string().required(t("required_code")),
    apiError: string().notRequired(),
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: yupResolver(loginSchema) });

  const onSubmit = async (data: any) => {

      console.log("LOGIN DATA:", data, isSubmitting);
    try {
      let { token, user } = await auth.verifyConfirmationCode(email, data.code, shopCode);
      login(user, token);

    } catch (error: any) {
      setError("apiError", {
        type: "manual",
        message: error.response.data.error || t("verification_failed"),
      });

      console.error(error.response.data.error || error);
    }
  };

  const resendCode = async () => {

    setResending(true);
    try {
      let response = await auth.requestNewConfirmationCode(email, shopCode);
      console.log("RESEND CODE RESPONSE:", response);
    } catch (error: any) {
      console.error(error.response.data.error || error);
    } finally {
      setResending(false);
    }
  };

  const brandDisplayName = barberName || t("brand_name");
  const brandTagline = barberName
    ? `Book your haircut with ${barberName}`
    : t("brand_tagline");
  const resolvedLogoUri = resolveLogoUri(barberLogo);
  const logoSource = resolvedLogoUri
    ? { uri: resolvedLogoUri }
    : require("@/assets/images/logo.png");

  return (
    <Box className="flex-1 justify-center px-6 bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "position"}
      >
        {/* Branding */}
        <Box className="items-center mb-10">
          <Image source={logoSource} className="w-44 h-44" />
          <Text className="text-3xl font-bold mt-4 text-typography-500 dark:text-typography-50">
            {brandDisplayName}
          </Text>
          <Text className="text-typography-500 dark:text-typography-50 text-center mt-1">
            {brandTagline}
          </Text>
        </Box>

        {isLoading || resending ? (
          <ActivityIndicator
            size="large"
            color={scheme === "dark" ? "#fff" : "#000"}
          />
        ) : (
          <>
            {/* Password */}
            <Controller
              control={control}
              name="code"
              render={({ field }) => (
                <InputField
                  {...field}
                  icon="lock-closed-outline"
                  placeholder={t("code")}
                  error={errors.code?.message}
                />
              )}
            />

            {/* API Error */}
            {errors.apiError && (
              <Text className="text-red-500 my-5 text-center">
                {errors.apiError.message}
              </Text>
            )}

            {/* Submit Button */}
            <Button
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              className="bg-secondary-500 rounded-xl"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-medium">{t("verify")}</Text>
              )}
            </Button>
            <TouchableOpacity onPress={resendCode} className="mt-4 self-center">
              <Text className="text-secondary-500">
                {t("did_not_receive_code")}{" "}
                <Text className="font-medium" onPress={resendCode}>
                  {t("resend_code")}
                </Text>
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Footer */}
        <Text className="text-xs text-center mt-6 text-typography-500 dark:text-typography-50">
          {t("terms_and_privacy")}
        </Text>
      </KeyboardAvoidingView>
    </Box>
  );
}
