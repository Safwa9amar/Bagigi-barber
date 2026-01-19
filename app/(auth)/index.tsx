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
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { auth } from "@/lib/api";
import InputField from "@/components/ui/InputField";



export default function Login() {
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const scheme = useColorScheme();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const loginSchema = object({
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
  } = useForm({ resolver: yupResolver(loginSchema) });
  const email = watch("email");

  const onSubmit = async (data: any) => {
    try {
      let { token, user } = await auth.login(data.email, data.password);
      login(user, token);
    } catch (error: any) {
      setError("apiError", {
        type: "manual",
        message: error.response.data.error || t("login_failed"),
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

            {/* Password */}
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
                  toggleSecure={() => setShowPassword(!showPassword)}
                  error={errors.password?.message}
                />
              )}
            />
            {/* forgot password */}
            <Link
              href={
                email
                  ? `/(auth)/forgot_password?email=${email}`
                  : "/(auth)/forgot_password"
              }
              asChild
            >
              <TouchableOpacity className="mb-4 self-end">
                <Text className="text-secondary-500">
                  {t("forgot_password")}
                </Text>
              </TouchableOpacity>
            </Link>
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
                <Text className="text-white font-medium">{t("login")}</Text>
              )}
            </Button>
          </>
        )}
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity className="mt-4 self-center">
            <Text className="text-secondary-500">
              {t("no_account")}
              <Text className="font-medium">{t("register")}</Text>
            </Text>
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
