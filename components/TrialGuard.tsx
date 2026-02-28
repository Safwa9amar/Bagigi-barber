import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  I18nManager,
  Image,
  Linking,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import * as Clipboard from "expo-clipboard";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  CreditCard,
  Landmark,
  Lock,
  LogOut,
  Phone,
  UploadCloud,
  CheckCircle2,
  User,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/store/useAuthStore";
import { useReceiptStore } from "@/store/useReceiptStore";
import { auth } from "@/lib/api";

interface TrialGuardProps {
  children: React.ReactNode;
}

export function TrialGuard({ children }: TrialGuardProps) {
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const { colorScheme } = useColorScheme();
  const colorMode = colorScheme === "dark" ? "dark" : "light";
  const { t, i18n } = useTranslation();

  const [isAccessLoading, setIsAccessLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [trialDays, setTrialDays] = useState<number>(7);

  const { receiptUri, isUploadingReceipt, pickAndUploadReceipt } =
    useReceiptStore();

  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated || !token || !user) {
        setIsBlocked(false);
        setTrialEndsAt(null);
        return;
      }

      if (user.role !== "ADMIN") {
        setIsBlocked(false);
        setTrialEndsAt(null);
        return;
      }

      try {
        setIsAccessLoading(true);
        const status = await auth.getAccessStatus();
        setIsBlocked(Boolean(status.blocked));
        setTrialEndsAt(status.trialEndsAt || null);
        if (typeof status.trialDays === "number") {
          setTrialDays(status.trialDays);
        }
      } catch (e) {
        console.error("Failed to check access status", e);
        setIsBlocked(false);
      } finally {
        setIsAccessLoading(false);
      }
    };

    checkAccess();
  }, [isAuthenticated, token, user]);

  const changeLanguage = async (lang: string) => {
    if (i18n.language === lang) return;
    await i18n.changeLanguage(lang);
    const isRTL = lang === "ar";
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert(t("trial.success"), t("trial.copy_success"));
  };

  const openWhatsApp = async (rawPhone: string) => {
    const digits = rawPhone.replace(/\D/g, "");
    const local = digits.startsWith("0") ? digits.slice(1) : digits;
    const phone = `213${local}`;
    const url = `https://wa.me/${phone}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return;
    }
    Alert.alert("WhatsApp", `Could not open WhatsApp for ${rawPhone}`);
  };

  if (isAccessLoading) {
    return (
      <GluestackUIProvider mode={colorMode as "light" | "dark"}>
        <ThemeProvider value={colorMode === "dark" ? DarkTheme : DefaultTheme}>
          <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-[#0F0F0F]">
            <ActivityIndicator color="#C5A35D" />
            <Text className="mt-3 text-gray-500 dark:text-gray-400">
              Checking access...
            </Text>
          </View>
        </ThemeProvider>
      </GluestackUIProvider>
    );
  }

  if (isBlocked) {
    return (
      <GluestackUIProvider mode={colorMode as "light" | "dark"}>
        <ThemeProvider value={colorMode === "dark" ? DarkTheme : DefaultTheme}>
          <View className="flex-1 bg-[#F9FAFB] dark:bg-[#0A0A0A]">
            {/* Header */}
            <View className="pt-12 pb-4 px-6 flex-row items-center justify-between border-b border-gray-100 dark:border-gray-900 bg-white dark:bg-[#0F0F0F]">
              <TouchableOpacity
                onPress={() => void logout()}
                className="p-2 rounded-full bg-gray-100 dark:bg-[#1E1E1E]"
              >
                <ArrowLeft
                  size={20}
                  color={colorMode === "dark" ? "#FFFFFF" : "#1A1A1A"}
                />
              </TouchableOpacity>
              <Text className="text-lg font-black text-[#1A1A1A] dark:text-white">
                {t("trial.title")}
              </Text>
              <View className="flex-row bg-gray-100 dark:bg-[#1E1E1E] rounded-full p-1 border border-gray-200 dark:border-gray-800">
                {["en", "fr", "ar"].map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => changeLanguage(lang)}
                    className={`px-3 py-1 rounded-full ${i18n.language === lang ? "bg-[#C5A35D]" : "bg-transparent"}`}
                  >
                    <Text
                      className={`text-[10px] font-bold uppercase ${i18n.language === lang ? "text-white" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {lang}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            >
              {/* Suspended Card */}
              <View className="w-full bg-[#0F172A] dark:bg-[#1E293B] rounded-[32px] p-8 items-center mb-8 shadow-xl">
                <View className="relative mb-6">
                  <View className="p-6 bg-blue-500/10 rounded-full">
                    <Lock size={64} color="#3B82F6" strokeWidth={1.5} />
                  </View>
                  <View className="absolute bottom-0 right-0 p-1.5 bg-[#0F172A] rounded-full border-4 border-[#0F172A]">
                    <Clock size={20} color="#3B82F6" fill="#3B82F6" />
                  </View>
                </View>
                <View className="px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30">
                  <Text className="text-blue-500 font-black text-[10px] tracking-[2px]">
                    {t("trial.access_suspended")}
                  </Text>
                </View>
              </View>

              {/* Title & Description */}
              <View className="items-center mb-8">
                <Text className="text-4xl font-black text-[#1A1A1A] dark:text-white text-center mb-4">
                  {t("trial.trial_ended")}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center leading-6 text-base px-2">
                  {t("trial.trial_ended_desc", { days: trialDays })}
                </Text>
              </View>

              {/* End Date Badge */}
              <View className="flex-row items-center justify-between p-5 bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-gray-800 mb-8 shadow-sm">
                <View className="flex-row items-center">
                  <View className="p-2 bg-blue-500/10 rounded-lg mr-3">
                    <Calendar size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-gray-500 dark:text-gray-400 font-bold">
                    {t("trial.trial_end_date")}
                  </Text>
                </View>
                <Text className="text-[#1A1A1A] dark:text-white font-black">
                  {trialEndsAt
                    ? new Date(trialEndsAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </Text>
              </View>

              {/* Payment Details Section */}
              <View className="mb-8">
                <Text className="text-xs font-black text-gray-400 dark:text-gray-600 mb-4 tracking-widest uppercase px-1">
                  {t("trial.payment_details")}
                </Text>

                <View className="bg-white dark:bg-[#1E1E1E] rounded-[24px] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  {/* CCP */}
                  <View className="p-5 flex-row items-center border-b border-gray-100 dark:border-gray-800">
                    <View className="p-3 bg-indigo-500/10 rounded-xl mr-4">
                      <Landmark size={22} color="#6366F1" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase mb-1">
                        {t("trial.bank_info")}
                      </Text>
                      <Text className="text-base font-black text-[#1A1A1A] dark:text-white">
                        0022801506 88
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => copyToClipboard("0022801506 88")}
                      className="p-2"
                    >
                      <Copy size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>

                  {/* RIP */}
                  <View className="p-5 flex-row items-center border-b border-gray-100 dark:border-gray-800">
                    <View className="p-3 bg-rose-500/10 rounded-xl mr-4">
                      <CreditCard size={22} color="#F43F5E" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase mb-1">
                        {t("trial.baridimob_rip")}
                      </Text>
                      <Text className="text-base font-black text-[#1A1A1A] dark:text-white">
                        00799999002280150688
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => copyToClipboard("00799999002280150688")}
                      className="p-2"
                    >
                      <Copy size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>

                  {/* Holder */}
                  <View className="p-5 flex-row items-center">
                    <View className="p-3 bg-emerald-500/10 rounded-xl mr-4">
                      <User size={22} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase mb-1">
                        {t("trial.account_holder")}
                      </Text>
                      <Text className="text-base font-black text-[#1A1A1A] dark:text-white">
                        Hassani Hamza
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => copyToClipboard("Hassani Hamza")}
                      className="p-2"
                    >
                      <Copy size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Upload Action */}
              <TouchableOpacity
                onPress={pickAndUploadReceipt}
                disabled={isUploadingReceipt}
                activeOpacity={0.8}
                className="bg-blue-600 rounded-2xl py-5 items-center flex-row justify-center shadow-lg shadow-blue-500/30 mb-8"
              >
                {isUploadingReceipt ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <UploadCloud size={20} color="#fff" />
                    <Text className="text-white font-black tracking-widest text-sm uppercase ml-3">
                      {t("trial.upload_receipt")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {receiptUri && (
                <View className="mb-8 p-1 bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <Image
                    source={{ uri: receiptUri }}
                    className="w-full h-48 rounded-[22px]"
                    resizeMode="cover"
                  />
                  <View className="p-4 flex-row items-center">
                    <CheckCircle2 size={16} color="#10B981" />
                    <Text className="ml-2 text-xs font-bold text-[#1A1A1A] dark:text-white">
                      Receipt selected ready to send
                    </Text>
                  </View>
                </View>
              )}

              {/* WhatsApp Help Section */}
              <View className="mb-10">
                <View className="flex-row items-center justify-between mb-4 px-1">
                  <Text className="text-xs font-black text-gray-400 dark:text-gray-600 tracking-widest uppercase">
                    {t("trial.need_help")}
                  </Text>
                  <View className="w-2 h-2 bg-emerald-500 rounded-full" />
                </View>

                <View className="gap-3">
                  {[
                    { id: 1, phone: "0674020244" },
                    { id: 2, phone: "0673124281" },
                  ].map((agent) => (
                    <View
                      key={agent.id}
                      className="p-4 bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-gray-800 flex-row items-center justify-between shadow-sm"
                    >
                      <View className="flex-row items-center">
                        <View className="p-2 bg-gray-50 dark:bg-[#141414] rounded-xl mr-4">
                          <Phone
                            size={18}
                            color={colorMode === "dark" ? "#FFFFFF" : "#1A1A1A"}
                          />
                        </View>
                        <View>
                          <Text className="text-sm font-black text-[#1A1A1A] dark:text-white">
                            {agent.phone}
                          </Text>
                          <Text className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                            {t("trial.support_agent")} {agent.id}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => void openWhatsApp(agent.phone)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 flex-row items-center"
                      >
                        <Text className="text-white text-xs font-black uppercase">
                          {t("trial.chat")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              {/* Logout Footer */}
              <TouchableOpacity
                onPress={() => void logout()}
                className="mt-4 border-t border-gray-100 dark:border-gray-900 pt-8 items-center flex-row justify-center"
              >
                <LogOut size={16} color="#EF4444" />
                <Text className="text-rose-500 font-black uppercase tracking-widest text-xs ml-2">
                  {t("trial.logout")}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ThemeProvider>
      </GluestackUIProvider>
    );
  }

  return <>{children}</>;
}
