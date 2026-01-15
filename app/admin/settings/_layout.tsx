import { Stack } from "expo-router";

export default function SettingsStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="hours" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="appearance" />
            <Stack.Screen name="language" />
        </Stack>
    );
}
