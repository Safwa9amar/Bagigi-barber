import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";
import { Link } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { auth } from "@/lib/api";
import InputField from "@/components/ui/InputField";

/**
 * LoginForm
 *
 * A standalone, embeddable login form — identical to the login screen but
 * without the page-level wrapper, so it can be rendered inside any tab or
 * modal (e.g. the Profile tab's guest state).
 */
export function LoginForm() {
  const { login, isLoading } = useAuthStore();
  const scheme = useColorScheme();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const loginSchema = object({
    email: string().email(t("invalid_email")).required(t("required_email")),
    password: string()
      .min(8, t("min_password"))
      .required(t("required_password")),
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
      const { token, user } = await auth.login(data.email, data.password);
      login(user, token);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || t("login_failed");
      setError("apiError", { type: "manual", message: errorMessage });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "position"}
        style={{ flex: 1 }}
      >
        <Box className="flex-1 justify-center px-6 pt-12 pb-8 bg-background-light dark:bg-background-dark">
          {/* Branding */}
          <Box className="items-center mb-10">
            <Image
              source={require("@/assets/images/logo.png")}
              className="w-36 h-36"
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
              color={scheme === "dark" ? "#fff" : "#C5A35D"}
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

              {/* Forgot password */}
              <Link
                href={
                  email
                    ? `/(auth)/forgot_password?email=${email}`
                    : "/(auth)/forgot_password"
                }
                asChild
              >
                <TouchableOpacity className="mb-4 self-end">
                  <Text className="text-secondary-500">{t("forgot_password")}</Text>
                </TouchableOpacity>
              </Link>

              {/* API error */}
              {errors.apiError && (
                <Text className="text-red-500 my-3 text-center">
                  {errors.apiError.message}
                </Text>
              )}

              {/* Login button */}
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

          {/* Register link */}
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
        </Box>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}
