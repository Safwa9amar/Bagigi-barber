import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function MessagesStackLayout() {
    const { t } = useTranslation();

    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen
                name="index"
                options={{
                    title: t("tabs.messages"), // Or "Inbox"
                    headerShown: false // Admin Tabs header likely off, but index might want one? 
                    // Actually admin/_layout uses headerShown: false for "messages" tab.
                    // So we should show header here if we want a title.
                    // admin/messages/index.tsx has its own custom header component in the code I wrote previous turn!
                    // Let's check index.tsx content.
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    title: "Chat",
                    headerShown: false // Detail screen also has custom header in my previous implementation (AdminChatDetail)
                }}
            />
        </Stack>
    );
}
