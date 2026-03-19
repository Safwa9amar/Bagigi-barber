import Constants from "expo-constants";

export const Config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID || Constants.expoConfig?.extra?.eas?.projectId,
};

export default Config;
