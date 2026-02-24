import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SubscriptionRecord, subscription } from "@/lib/api";
import { format } from "date-fns";

type PlanOption = {
    plan: "MONTHLY" | "YEARLY";
    title: string;
    priceLabel: string;
    subtitle: string;
};

const PLAN_OPTIONS: PlanOption[] = [
    {
        plan: "MONTHLY",
        title: "Monthly Plan",
        priceLabel: "2,500 DZD / month",
        subtitle: "Flexible billing, renews every month",
    },
    {
        plan: "YEARLY",
        title: "Yearly Plan",
        priceLabel: "25,000 DZD / year",
        subtitle: "Best value for regular customers",
    },
];

export default function SubscriptionScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingPlan, setProcessingPlan] = useState<"MONTHLY" | "YEARLY" | null>(null);
    const [subscriptionData, setSubscriptionData] = useState<SubscriptionRecord | null>(null);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

    const loadSubscription = useCallback(async () => {
        try {
            const response = await subscription.getMine();
            setSubscriptionData(response.data);
            setDaysRemaining(typeof response.daysRemaining === "number" ? response.daysRemaining : null);
        } catch (error) {
            console.error("Failed to load subscription:", error);
            Alert.alert("Error", "Could not load your subscription status.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSubscription();
    }, [loadSubscription]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadSubscription();
        setRefreshing(false);
    };

    const handleSubscribe = (plan: "MONTHLY" | "YEARLY") => {
        const title = plan === "MONTHLY" ? "Monthly" : "Yearly";
        Alert.alert(
            `Activate ${title} Plan`,
            "This will create your subscription in the system. Connect your payment gateway next for real charges.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Activate",
                    onPress: async () => {
                        try {
                            setProcessingPlan(plan);
                            await subscription.subscribe(plan);
                            await loadSubscription();
                            Alert.alert("Success", `${title} subscription activated.`);
                        } catch (error: any) {
                            const message = error?.response?.data?.error || "Failed to activate subscription";
                            Alert.alert("Error", message);
                        } finally {
                            setProcessingPlan(null);
                        }
                    },
                },
            ]
        );
    };

    const handleCancel = async () => {
        Alert.alert("Cancel Subscription", "Access stays active until your current end date.", [
            { text: "Keep Plan", style: "cancel" },
            {
                text: "Cancel Renewal",
                style: "destructive",
                onPress: async () => {
                    try {
                        setLoading(true);
                        await subscription.cancel();
                        await loadSubscription();
                        Alert.alert("Done", "Subscription renewal was cancelled.");
                    } catch (error: any) {
                        const message = error?.response?.data?.error || "Failed to cancel subscription";
                        Alert.alert("Error", message);
                    } finally {
                        setLoading(false);
                    }
                },
            },
        ]);
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]">
            <View className="pt-14 px-5 pb-6 bg-white dark:bg-[#0F0F0F] flex-row items-center border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-4 w-10 h-10 rounded-full bg-gray-50 dark:bg-[#1E1E1E] items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-black text-[#1A1A1A] dark:text-white">Subscription</Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                        Monthly & Yearly plans
                    </Text>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#C5A35D" />
                </View>
            ) : (
                <ScrollView
                    className="flex-1 p-5"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    showsVerticalScrollIndicator={false}
                >
                    <View
                        className="p-5 rounded-[24px] border mb-6"
                        style={{
                            backgroundColor: "#C5A35D12",
                            borderColor: "#C5A35D30",
                        }}
                    >
                        <Text className="text-[#C5A35D] font-black text-[10px] uppercase tracking-widest mb-2">
                            Current Plan
                        </Text>
                        {subscriptionData ? (
                            <>
                                <Text className="text-[#1A1A1A] dark:text-white text-lg font-black">
                                    {subscriptionData.plan === "MONTHLY" ? "Monthly" : "Yearly"} ({subscriptionData.status})
                                </Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                                    Ends on {format(new Date(subscriptionData.endsAt), "PPP")}
                                </Text>
                                {daysRemaining !== null && (
                                    <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                        {Math.max(daysRemaining, 0)} day(s) remaining
                                    </Text>
                                )}
                            </>
                        ) : (
                            <Text className="text-gray-500 dark:text-gray-400 text-sm">
                                You do not have an active subscription.
                            </Text>
                        )}
                    </View>

                    <Text className="text-gray-400 font-extrabold text-[10px] uppercase tracking-widest ml-1 mb-4">
                        Choose a plan
                    </Text>

                    {PLAN_OPTIONS.map((option) => (
                        <View
                            key={option.plan}
                            className="bg-white dark:bg-[#1E1E1E] p-5 mb-4 rounded-[24px] border border-gray-100 dark:border-gray-800"
                        >
                            <Text className="text-[#1A1A1A] dark:text-white text-base font-black">{option.title}</Text>
                            <Text className="text-[#C5A35D] text-sm font-black mt-2">{option.priceLabel}</Text>
                            <Text className="text-gray-500 dark:text-gray-400 text-xs mt-2">{option.subtitle}</Text>

                            <TouchableOpacity
                                onPress={() => handleSubscribe(option.plan)}
                                disabled={processingPlan !== null}
                                className="bg-[#C5A35D] mt-4 p-4 rounded-[16px] items-center"
                            >
                                {processingPlan === option.plan ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white font-black text-xs uppercase tracking-widest">
                                        Activate {option.plan === "MONTHLY" ? "Monthly" : "Yearly"}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ))}

                    {subscriptionData && subscriptionData.status === "ACTIVE" && (
                        <TouchableOpacity
                            onPress={handleCancel}
                            className="p-4 rounded-[16px] items-center border border-red-200 bg-red-50 dark:bg-red-900/10 mt-2"
                        >
                            <Text className="text-red-500 font-black text-xs uppercase tracking-widest">
                                Cancel Renewal
                            </Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            )}
        </View>
    );
}
