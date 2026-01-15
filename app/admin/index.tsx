import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { admin as adminApi } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { startOfDay, startOfWeek, startOfMonth, format, subDays } from "date-fns";
import { useRouter } from "expo-router";

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  todayBookings: number;
  totalClients: number;
  totalServices: number;
  totalRevenue: number;
}

type Period = 'today' | 'week' | 'month' | 'all';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePeriod, setActivePeriod] = useState<Period>('all');

  const fetchStats = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      let startDate: string | undefined;
      let endDate: string | undefined;

      const now = new Date();
      if (activePeriod === 'today') {
        startDate = startOfDay(now).toISOString();
      } else if (activePeriod === 'week') {
        startDate = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
      } else if (activePeriod === 'month') {
        startDate = startOfMonth(now).toISOString();
      }

      const res = await adminApi.getStats(startDate, endDate);
      if (res.success) {
        setStats(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch dashboard stats", e);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  }, [activePeriod]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats(false);
  };

  const StatCard = ({ title, value, icon, color, subtitle, fullWidth }: { title: string, value: string | number, icon: any, color: string, subtitle?: string, fullWidth?: boolean }) => (
    <View
      className={`bg-white dark:bg-[#1E1E1E] p-5 rounded-[24px] mb-4 shadow-sm border border-gray-100 dark:border-gray-800 ${fullWidth ? 'w-full' : 'flex-1 min-w-[45%] mx-1'}`}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="w-10 h-10 rounded-xl items-center justify-center bg-[#C5A35D]20" style={{ backgroundColor: `${color}15` }}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
      </View>
      <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">{title}</Text>
      <Text className="text-2xl font-black text-[#1A1A1A] dark:text-white mt-1">{value}</Text>
      {subtitle && <Text className="text-gray-400 text-[10px] mt-1 font-bold">{subtitle}</Text>}
    </View>
  );

  const PeriodButton = ({ type, label }: { type: Period, label: string }) => (
    <TouchableOpacity
      onPress={() => setActivePeriod(type)}
      className={`px-4 py-2 rounded-full mr-2 border ${activePeriod === type ? 'bg-[#C5A35D] border-[#C5A35D]' : 'bg-transparent border-gray-200 dark:border-gray-700'}`}
    >
      <Text className={`text-xs font-black ${activePeriod === type ? 'text-white' : 'text-gray-500'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-[#0F0F0F] items-center justify-center">
        <ActivityIndicator size="large" color="#C5A35D" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]">
      <View className="pt-14 pb-6 px-5 bg-white dark:bg-[#0F0F0F]">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-black text-[#1A1A1A] dark:text-white">{t("admin.dashboard.title")}</Text>
            <Text className="text-gray-400 font-bold text-xs">{t("admin.dashboard.welcome")}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/admin/settings")}
            className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center"
          >
            <Ionicons name="person-circle-outline" size={24} color="#C5A35D" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          <PeriodButton type="all" label={t("admin.dashboard.periods.all")} />
          <PeriodButton type="today" label={t("admin.dashboard.periods.today")} />
          <PeriodButton type="week" label={t("admin.dashboard.periods.week")} />
          <PeriodButton type="month" label={t("admin.dashboard.periods.month")} />
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C5A35D" />
        }
      >
        <StatCard
          title={t("admin.stats.totalRevenue")}
          value={`DZD ${stats?.totalRevenue.toLocaleString() || 0}`}
          icon="wallet"
          color="#C5A35D"
          subtitle={t("admin.dashboard.revenueSubtitle", {
            period: t(`admin.dashboard.periods.${activePeriod}`)
          })}
          fullWidth
        />

        <View className="flex-row flex-wrap justify-between">
          <StatCard
            title={t("admin.stats.totalBookings")}
            value={stats?.totalBookings || 0}
            icon="calendar"
            color="#3B82F6"
            subtitle={t("admin.stats.totalBookingsDesc")}
          />
          <StatCard
            title={t("admin.stats.todayBookings")}
            value={stats?.todayBookings || 0}
            icon="today"
            color="#10B981"
            subtitle={t("admin.stats.todayBookingsDesc")}
          />
          <StatCard
            title={t("admin.stats.pending")}
            value={stats?.pendingBookings || 0}
            icon="time"
            color="#F59E0B"
            subtitle={t("admin.stats.pendingDesc")}
          />
          <StatCard
            title={t("admin.stats.activeClients")}
            value={stats?.totalClients || 0}
            icon="people"
            color="#8B5CF6"
            subtitle={t("admin.stats.activeClientsDesc")}
          />
        </View>

        <View className="mt-4 mb-20 p-5 bg-[#C5A35D]10 rounded-[24px] border border-[#C5A35D]20 flex-row items-center" style={{ backgroundColor: '#C5A35D08' }}>
          <Ionicons name="sparkles" size={24} color="#C5A35D" />
          <View className="ml-4 flex-1">
            <Text className="text-[#C5A35D] font-black text-sm">{t("admin.dashboard.proTip")}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-xs font-bold leading-4 mt-0.5">{t("admin.dashboard.proTipDesc")}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
