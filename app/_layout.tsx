import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme(); // "light" | "dark" | null

  const colorMode = colorScheme === "dark" ? "dark" : "light";
  const { logout } = useAuthStore();

  return (
    <GluestackUIProvider mode={"light"} key={colorMode}>
      <ThemeProvider
        value={colorMode === "dark" ? DarkTheme : DefaultTheme}
        key={colorMode}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="customer" />
          <Stack.Screen
            name="service-details"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
        {/* <Button onPress={logout}>
          <Text className="text-red-500">logout</Text>
        </Button> */}
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
