import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
} from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

export default function Profile() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const menuItems = [
    {
      title: t("profile.accountSettings"),
      items: [
        { icon: "person-outline", label: t("profile.personalInfo"), action: () => router.push("/customer/settings/personal-info") },
        { icon: "color-palette-outline", label: t("profile.appearance"), action: () => router.push("/customer/settings/appearance") },
        { icon: "notifications-outline", label: t("profile.notifications"), action: () => router.push("/customer/settings/notifications") },
        { icon: "language-outline", label: t("profile.language"), value: "", action: () => router.push("/customer/settings/language") },
      ],
    },
    {
      title: t("profile.support"),
      items: [
        { icon: "help-circle-outline", label: t("profile.helpCenter"), action: () => router.push("/customer/support/help-center") },
        { icon: "document-text-outline", label: t("profile.terms"), action: () => router.push("/customer/support/terms") },
        { icon: "lock-closed-outline", label: t("profile.privacy"), action: () => router.push("/customer/support/privacy") },
      ],
    },
  ];

  return (
    <View style={styles.container} className="bg-background-light dark:bg-background-dark">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header} className="bg-white dark:bg-background-muted shadow-sm dark:shadow-none">
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: "https://ui-avatars.com/api/?name=" + (user?.name || "User") + "&background=D4AF37&color=000",
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editIcon} className="border-white dark:border-background-muted">
              <Ionicons name="camera" size={16} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName} className="text-typography-900 dark:text-typography-white">{user?.name || t("profile.guest")}</Text>
          <Text style={styles.userEmail}>{user?.email || "guest@example.com"}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || "USER"}</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent} className="bg-white dark:bg-background-muted">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex === section.items.length - 1 && styles.lastMenuItem,
                  ]}
                  className="border-outline-300 dark:border-outline-300"
                  onPress={item.action}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons name={item.icon as any} size={20} color="#D4AF37" />
                    </View>
                    <Text style={styles.menuItemLabel} className="text-typography-900 dark:text-typography-white">{item.label}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.value && (
                      <Text style={styles.menuItemValue}>{item.value}</Text>
                    )}
                    <Ionicons name="chevron-forward" size={20} className="color-typography-400" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>{t("profile.logout")}</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#D4AF37",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#D4AF37",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  roleText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 16,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemValue: {
    color: "#666",
    fontSize: 14,
    marginRight: 8,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 20,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
