import { View, Text } from "react-native";
import React, { useCallback } from "react";
import { Slot, useFocusEffect, useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

const AuthLayout = () => {
  const { user } = useAuthStore();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      router.replace(
        user.role === "ADMIN"
          ? "/admin"
          : user.role === "USER"
          ? "/customer"
          : "/guest"
      );
    }, [user])
  );
  return <Slot />;
};

export default AuthLayout;
