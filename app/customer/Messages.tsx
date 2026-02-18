import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import axios from "axios";

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

const Messages = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { resetUnreadCount } = useChatStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Replace with your actual server URL or use env var
  const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (!user) return;

    // Reset badge when screen is opened
    resetUnreadCount();

    // Use Global Socket
    socketRef.current = getSocket(user.id, user.role);
    const socket = socketRef.current;

    // Sync connection state
    setIsConnected(socket.connected);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleMessage = (msg: Message) => {
      console.log("Received message in screen:", msg);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        // Replace optimistic temp message with the real server message
        const tempIdx = prev.findIndex(
          (m) =>
            m.id.startsWith("temp-") &&
            m.from === msg.from &&
            m.content === msg.content,
        );
        if (tempIdx !== -1) {
          const updated = [...prev];
          updated[tempIdx] = msg;
          return updated;
        }
        return [...prev, msg];
      });
      setIsAdminTyping(false);
      resetUnreadCount();
    };

    const handleTyping = (data: { from: string }) => {
      if (data.from === "admin") setIsAdminTyping(true);
    };

    const handleStopTyping = (data: { from: string }) => {
      if (data.from === "admin") setIsAdminTyping(false);
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
  }, [user, resetUnreadCount]);

  const handleInputChange = (text: string) => {
    setInputText(text);

    if (!socketRef.current) return;

    // Emit typing event
    socketRef.current.emit("typing", {});

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to emit stop_typing
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", {});
    }, 2000);
  };

  useEffect(() => {
    if (!user) return;

    // Fetch history
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${SERVER_URL}/messages/history/${user.id}`,
        );
        const data = res.data;
        if (Array.isArray(data)) {
          setMessages(
            data.map((m: any) => ({
              id: m.id,
              from: m.fromId,
              fromName: m.fromName,
              content: m.content,
              timestamp: m.createdAt,
              role: m.role,
            })),
          );
        }
      } catch (e) {
        console.error("Failed to fetch history", e);
      }
    };

    fetchHistory();
  }, [user]);

  const sendMessage = () => {
    if (!inputText.trim() || !socketRef.current) return;

    const content = inputText.trim();

    // Optimistic update — show message immediately while waiting for server echo
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      from: user!.id,
      content,
      timestamp: new Date().toISOString(),
      role: "USER",
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    socketRef.current.emit("send_message", { content });
    socketRef.current.emit("stop_typing", {});
    setInputText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.from === user?.id && item.role !== "ADMIN";
    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
        className={
          isMe ? "bg-primary-500" : "bg-gray-200 dark:bg-background-muted"
        }
      >
        <Text
          style={[
            styles.messageText,
            isMe ? styles.myMessageText : styles.theirMessageText,
          ]}
          className={
            isMe
              ? "text-white"
              : "text-typography-900 dark:text-typography-white"
          }
        >
          {item.content}
        </Text>
        <Text
          style={styles.timestamp}
          className={isMe ? "text-primary-100" : "text-gray-500"}
        >
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      className="bg-background-light dark:bg-background-dark"
    >
      <View
        style={styles.header}
        className="bg-white dark:bg-background-muted shadow-sm dark:shadow-none"
      >
        <Text
          style={styles.headerTitle}
          className="text-typography-900 dark:text-typography-white"
        >
          {t("tabs.messages")}
        </Text>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isConnected ? "#10B981" : "#EF4444" },
          ]}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        inverted={false} // Normal order
      />

      {isAdminTyping && (
        <View style={[styles.typingIndicator, { paddingHorizontal: 20 }]}>
          <TypingIndicator label={`Bagigi Barber ${t("common.isTyping")}`} />
        </View>
      )}

      <View
        style={styles.inputContainer}
        className="bg-white dark:bg-background-muted  border-outline-300 dark:border-gray-800"
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder={t("common.typeMessage") || "Type a message..."}
          placeholderTextColor="#9CA3AF"
          className="text-typography-900 dark:text-typography-white bg-gray-100 dark:bg-background-paper"
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={styles.sendBtn}
          className="bg-primary-500"
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  listContent: { padding: 20, paddingBottom: 10 },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 16 },
  myMessageText: { color: "#fff" },
  theirMessageText: {},
  timestamp: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  typingIndicator: {
    marginBottom: -5,
  },
});

export default Messages;
