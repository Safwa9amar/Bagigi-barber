import React, { useState } from "react";
import {
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { AuthScreen, AuthScreenProps } from "@/components/auth/AuthShared";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { RegisterScreen } from "@/components/auth/RegisterScreen";
import { ConfirmCodeScreen } from "@/components/auth/ConfirmCodeScreen";
import { ForgotPasswordScreen } from "@/components/auth/ForgotPasswordScreen";
import { ResetPasswordScreen } from "@/components/auth/ResetPasswordScreen";
import i18n from "@/lib/i18n/i18n";

/**
 * AuthFlow
 *
 * A self-contained, state-driven auth wizard that manages the transition
 * between Login, Register, Code Confirmation, and Password Reset screens.
 *
 * This version is refactored to use modular components from @/components/auth/.
 */
export function AuthFlow({
  initialScreen = "login",
  initialParams = {},
}: {
  initialScreen?: AuthScreen;
  initialParams?: Record<string, string>;
}) {
  const [screen, setScreen] = useState<AuthScreen>(initialScreen);
  const [params, setParams] = useState<Record<string, string>>(initialParams);

  const goTo: AuthScreenProps["goTo"] = (next, nextParams = {}) => {
    setParams(nextParams);
    setScreen(next);
  };

  const renderScreen = () => {
    const props: AuthScreenProps = { goTo, params };
    switch (screen) {
      case "login":
        return <LoginScreen {...props} />;
      case "register":
        return <RegisterScreen {...props} />;
      case "confirm_code":
        return <ConfirmCodeScreen {...props} />;
      case "forgot_password":
        return <ForgotPasswordScreen {...props} />;
      case "reset_password":
        return <ResetPasswordScreen {...props} />;
      default:
        return <LoginScreen {...props} />;
    }
  };
  
    const changeLanguage = async (lang: string) => {
      if (i18n.language === lang) return;
      await i18n.changeLanguage(lang);
      const isRTL = lang === "ar";
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }

  return (
    <View style={{ flex: 1 }} className="bg-background-light dark:bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="absolute top-12 right-6 z-50 flex-row bg-gray-100 dark:bg-[#1E1E1E] rounded-full p-1 border border-gray-200 dark:border-gray-800">
                  {["en", "fr", "ar"].map((lang) => (
                    <TouchableOpacity
                      key={lang}
                      onPress={() => changeLanguage(lang)}
                      className={`px-3 py-1.5 rounded-full ${i18n.language === lang ? "bg-[#C5A35D]" : "bg-transparent"}`}
                    >
                      <Text
                        className={`text-xs font-bold uppercase ${i18n.language === lang ? "text-white" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {lang}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
          <Box className="flex-1 justify-center px-6 py-12">
            {renderScreen()}
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
