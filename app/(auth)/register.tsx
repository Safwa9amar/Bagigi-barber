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
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Controller, set, useForm } from "react-hook-form";
import { object, string, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api, { auth } from "@/lib/api";
import InputField from "@/components/ui/InputField";



export default function Login() {
  const router = useRouter();
  const scheme = useColorScheme();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const loginSchema = object({
    email: string().email(t("invalid_email")).required(t("required_email")),
    phone: string()
      .matches(/^0[567]\d{8}$/, t("invaild_phone"))
      .required(t("required_phone")),
    password: string().min(8, t("min_password")).required(t("required_password")),
    confirmPassword: string()
      .oneOf([ref("password")], t("password_match"))
      .required(),
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
      let response = await auth.register(data.email, data.password, data.phone);
      console.log("REGISTER RESPONSE:", response);

      router.push(`/(auth)/confirm_code?email=${data.email}`);
    } catch (error: any) {
      setError("apiError", {
        type: "manual",
        message: error.response.data.error || t("registration_failed"),
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
          <Text className="text-3xl font-bold mt-4 text-typography-500 dark:text-typography-50">{t("brand_name")}</Text>
          <Text className="text-typography-500 dark:text-typography-50 text-center mt-1">
            {t("brand_tagline")}
          </Text>
        </Box>

        {isSubmitting ? (
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

            {/* Phone */}
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <InputField
                  {...field}
                  icon="call-outline"
                  placeholder={t("phone_number")}
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
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
                  secureTextEntry
                  toggleSecure={() => setShowPassword(!showPassword)}
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
                  secure={!showPassword}
                  secureTextEntry
                  error={errors.confirmPassword?.message}
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
                <Text className="text-white font-medium">{t("continue")}</Text>
              )}
            </Button>
          </>
        )}
        <Link href="/(auth)" asChild>
          <TouchableOpacity className="mt-4 self-center">
            <Text className="text-secondary-500">
              {t("have_account")}
              <Text className="font-medium">{t("login")}</Text>
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
