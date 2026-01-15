import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { format } from 'date-fns';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/useAuthStore';

interface Conversation {
    userId: string;
    lastMessageAt: string;
    userName?: string;
    lastMessage?: string;
}

const AdminMessagesList = () => {
    const { user } = useAuthStore();
    const router = useRouter();
    const { t } = useTranslation();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const SERVER_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000").replace('/api', '/api');

    const fetchConversations = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const res = await axios.get(`${SERVER_URL}/messages/conversations`);
            if (Array.isArray(res.data)) {
                setConversations(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        } finally {
            if (showLoading) setLoading(false);
            setRefreshing(false);
        }
    }, [SERVER_URL]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (!user) return;

        const socket = getSocket(user.id, 'ADMIN');

        const handleNewMessage = () => {
            fetchConversations(false); // Refresh list without full loading spinner
        };

        socket.on("receive_message", handleNewMessage);

        return () => {
            socket.off("receive_message", handleNewMessage);
        };
    }, [user, fetchConversations]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations(false);
    };

    const filteredConversations = conversations.filter(c =>
        c.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            onPress={() => router.push(`/admin/messages/${item.userId}`)}
            className="flex-row items-center p-4 mx-4 mb-3 bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-sm border border-gray-100 dark:border-gray-800"
        >
            <View className="w-12 h-12 bg-[#C5A35D]20 rounded-full items-center justify-center mr-4" style={{ backgroundColor: '#C5A35D20' }}>
                <Ionicons name="person" size={24} color="#C5A35D" />
            </View>
            <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-[#1A1A1A] dark:text-white font-black text-sm">
                        {item.userName || `User: ${item.userId.substring(0, 8)}`}
                    </Text>
                    <Text className="text-gray-400 text-[10px] font-bold">
                        {format(new Date(item.lastMessageAt), "HH:mm")}
                    </Text>
                </View>
                <Text className="text-gray-500 dark:text-gray-400 text-xs truncate" numberOfLines={1}>
                    {item.lastMessage || "Tap to view conversation"}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-[#0F0F0F]">
            <View className="pt-14 px-5 pb-4 bg-white dark:bg-[#0F0F0F]">
                <Text className="text-2xl font-black text-[#1A1A1A] dark:text-white mb-6">
                    {t("tabs.messages")}
                </Text>

                <View className="flex-row items-center bg-gray-100 dark:bg-[#1E1E1E] px-4 py-3 rounded-[20px] mb-2">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        placeholder={t("admin.appointments.searchPlaceholder")}
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="ml-3 flex-1 text-gray-900 dark:text-white font-bold"
                    />
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#C5A35D" />
                </View>
            ) : (
                <FlatList
                    data={filteredConversations}
                    renderItem={renderItem}
                    keyExtractor={item => item.userId}
                    contentContainerStyle={{ paddingTop: 10, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C5A35D" />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center pt-20">
                            <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
                            <Text className="text-gray-400 font-bold mt-4 text-lg">
                                No messages yet
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default AdminMessagesList;
