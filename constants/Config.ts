import Constants from "expo-constants";
import { Platform } from "react-native";

export const Config = {
  apiUrl: (process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl || "").replace(
    "localhost",
    Platform.OS === "android" ? "10.0.2.2" : "localhost"
  ),
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID || Constants.expoConfig?.extra?.eas?.projectId,
};

export default Config;
