import { useAuthStore } from "@/store/useAuthStore";
import { Redirect, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import type { UserRole } from "@/store/useAuthStore";

export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  role: UserRole,
) {
  return function RoleProtectedComponent(props: P) {
    const { isAuthenticated, hasRole, _hasHydrated } = useAuthStore();

    if (!_hasHydrated) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (!isAuthenticated || !hasRole(role)) {
      return <Redirect href="/(auth)/login" />;
    }

    return <WrappedComponent {...props} />;
  };
}
