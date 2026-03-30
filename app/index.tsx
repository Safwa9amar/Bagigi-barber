import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/customer/home" />;
  }

  if (user.role === "ADMIN") {
    return <Redirect href="/admin" />;
  }

  if (user.role === "USER") {
    return <Redirect href="/customer/home" />;
  }

  return <Redirect href="/guest" />;
}
