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
import { t } from "@/constants/i18n";
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

const loginSchema = object({
  code: string().required(t("required_code")),
  apiError: string().notRequired(),
});

export default function Login() {
  const { user, login, isLoading } = useAuthStore();
  const scheme = useColorScheme();
  const { email }: { email: string } = useGlobalSearchParams();
  const [resending, setResending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: yupResolver(loginSchema) });

  const onSubmit = async (data: any) => {
    console.log("LOGIN DATA:", data, isSubmitting);
    try {
      let { token } = await auth.verifyConfirmationCode(email, data.code);
      login(user, token);
    } catch (error: any) {
      setError("apiError", {
        type: "manual",
        message: error.response.data.error || "Registration failed",
      });
      console.error(error.response.data.error || error);
    }
  };

  const resendCode = async () => {
    setResending(true);
    try {
      let response = await auth.requestNewConfirmationCode(email);
      console.log("RESEND CODE RESPONSE:", response);
    } catch (error: any) {
      console.error(error.response.data.error || error);
    } finally {
      setResending(false);
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
          <Text className="text-3xl font-bold mt-4">{t("brand_name")}</Text>
          <Text className="text-typography-500 text-center mt-1">
            {t("brand_tagline")}
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
                  placeholder="Code"
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
        <Text className="text-xs text-center mt-6 text-typography-500">
          {t("terms_and_privacy")}
        </Text>
      </KeyboardAvoidingView>
    </Box>
  );
}
