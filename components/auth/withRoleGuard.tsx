import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import React from "react";

import type { UserRole } from "@/store/useAuthStore";

export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  role: UserRole
) {
  return function RoleProtectedComponent(props: P) {
    const { isAuthenticated, hasRole } = useAuthStore();
    const router = useRouter();

    if (!isAuthenticated) {
      return router.replace("/(auth)");
    }
    if (!hasRole(role)) {
      return router.replace("/(auth)");
    }
    return <WrappedComponent {...props} />;
  };
}
