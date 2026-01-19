import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import TypingIndicator from "@/components/TypingIndicator";

import { getSocket } from "@/lib/socket";
import { useChatStore } from "@/store/useChatStore";

interface Message {
    id: string;
    from: string;
    content: string;
    timestamp: string;
    role: string;
}

const AdminChatDetail = () => {
    const { id: targetUserId } = useLocalSearchParams();
    const { user } = useAuthStore();
    const router = useRouter();
    const { t } = useTranslation();
    const { resetUnreadCount } = useChatStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<any>(null);

    const SERVER_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000").replace('/api', '/api');

    const [userName, setUserName] = useState<string>("");

    const fetchHistory = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const res = await fetch(`${SERVER_URL}/messages/history/${targetUserId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                // Peek at the first user-role message from the history to get the name if we don't have it
                const firstUserMsg = data.find((m: any) => m.role === 'USER' && m.fromName);
                if (firstUserMsg && !userName) {
                    setUserName(firstUserMsg.fromName);
                }

                setMessages(data.map((m: any) => ({
                    id: m.id,
                    from: m.fromId,
                    fromName: m.fromName,
                    content: m.content,
                    timestamp: m.createdAt,
                    role: m.role
                })));
            }
        } catch (e) {
            console.error("Failed to fetch history", e);
        } finally {
            if (showLoading) setLoading(false);
            setRefreshing(false);
        }
    }, [SERVER_URL, targetUserId, userName]);

    useEffect(() => {
        if (!user || !targetUserId) return;

        // Reset badge when screen is opened
        resetUnreadCount();

        fetchHistory();

        // Use Global Socket
        socketRef.current = getSocket(user.id, 'ADMIN');
        const socket = socketRef.current;

        // Sync connection state
        setIsConnected(socket.connected);

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        const handleMessage = (msg: Message | any) => {
            if (msg.from === targetUserId || msg.to === targetUserId) {
                if (msg.fromName && !userName) setUserName(msg.fromName);

                setMessages((prev) => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, { ...msg, id: msg.id || Date.now().toString() }];
                });
                setIsUserTyping(false);
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
                resetUnreadCount(); // Keep resetting while on screen
            }
        };

        const handleTyping = (data: { from: string }) => {
            if (data.from === targetUserId) setIsUserTyping(true);
        };

        const handleStopTyping = (data: { from: string }) => {
            if (data.from === targetUserId) setIsUserTyping(false);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("receive_message", handleMessage);
        socket.on("typing", handleTyping);
        socket.on("stop_typing", handleStopTyping);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("receive_message", handleMessage);
            socket.off("typing", handleTyping);
            socket.off("stop_typing", handleStopTyping);
        };
    }, [user, targetUserId, fetchHistory, resetUnreadCount, userName]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory(false);
    };

    const handleInputChange = (text: string) => {
        setInputText(text);

        if (!socketRef.current || !targetUserId) return;

        // Emit typing event to specific user
        socketRef.current.emit("typing", { to: targetUserId });

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to emit stop_typing
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit("stop_typing", { to: targetUserId });
        }, 2000);
    };

    const sendMessage = () => {
        if (!inputText.trim() || !socketRef.current || !targetUserId) return;

        const content = inputText.trim();

        socketRef.current.emit("send_message", {
            content,
            to: targetUserId
        });

        const newMessage: Message = {
            id: Date.now().toString(),
            from: user!.id,
            content: content,
            timestamp: new Date().toISOString(),
            role: 'ADMIN'
        };

        setMessages(prev => [...prev, newMessage]);
        socketRef.current.emit("stop_typing", { to: targetUserId });
        setInputText("");
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isMe = item.role === 'ADMIN';
        return (
            <View
                className={`max-w-[80%] p-4 rounded-[20px] mb-3 flex-col ${isMe
                    ? "bg-[#C5A35D] self-end rounded-br-[4px]"
                    : "bg-white dark:bg-[#1E1E1E] self-start rounded-bl-[4px] border border-gray-100 dark:border-gray-800"
                    }`}
            >
                <Text
                    className={`text-sm font-bold ${isMe ? "text-white" : "text-[#1A1A1A] dark:text-white"}`}
                >
                    {item.content}
                </Text>
                <Text
                    className={`text-[10px] mt-1 self-end font-bold ${isMe ? "text-[#FFFFFF90]" : "text-gray-400"}`}
                >
                    {format(new Date(item.timestamp), "HH:mm")}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            className="bg-gray-50 dark:bg-[#0F0F0F]"
        >
            <View className="pt-14 pb-4 px-5 bg-white dark:bg-[#0F0F0F] flex-row items-center border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" className="dark:text-white" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-lg font-black text-[#1A1A1A] dark:text-white">
                        {userName || (typeof targetUserId === 'string'
                            ? `${t("admin.messages.user")}: ${targetUserId.substring(0, 8)}`
                            : t("admin.messages.chat"))}
                    </Text>
                    <View className="flex-row items-center">
                        <View className={`w-2 h-2 rounded-full mr-1.5 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            {isConnected ? t("common.online") : t("common.offline")}
                        </Text>
                    </View>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#C5A35D" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C5A35D" />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center pt-20">
                            <Ionicons name="chatbubble-ellipses-outline" size={48} color="#9CA3AF" />
                            <Text className="text-gray-400 font-bold mt-4">{t("admin.messages.startConversation")}</Text>
                        </View>
                    }
                />
            )}

            {isUserTyping && (
                <View className="px-5 py-2">
                    <TypingIndicator label={`${t("admin.messages.user")} ${t("common.isTyping")}`} />
                </View>
            )}

            <View className="p-4 bg-white dark:bg-[#0F0F0F] border-t border-gray-100 dark:border-gray-800 flex-row items-center">
                <View className="flex-1 bg-gray-100 dark:bg-[#1E1E1E] rounded-[24px] px-4 py-2 mr-3 flex-row items-center">
                    <TextInput
                        value={inputText}
                        onChangeText={handleInputChange}
                        placeholder={t("common.typeMessage")}
                        placeholderTextColor="#9CA3AF"
                        multiline
                        className="flex-1 text-sm font-bold text-[#1A1A1A] dark:text-white max-h-[100px]"
                    />
                </View>
                <TouchableOpacity
                    onPress={sendMessage}
                    disabled={!inputText.trim()}
                    className={`w-11 h-11 rounded-full items-center justify-center ${inputText.trim() ? 'bg-[#C5A35D]' : 'bg-gray-200 dark:bg-gray-800'}`}
                >
                    <Ionicons name="send" size={20} color={inputText.trim() ? "#fff" : "#9CA3AF"} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default AdminChatDetail;
