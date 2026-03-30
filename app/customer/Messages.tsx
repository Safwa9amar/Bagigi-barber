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
  Image,
  Dimensions,
} from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import Config from "@/constants/Config";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useRouter } from "expo-router";

import TypingIndicator from "@/components/TypingIndicator";
import { getSocket } from "@/lib/socket";
import { useChatStore } from "@/store/useChatStore";

const { width } = Dimensions.get("window");

interface Message {
  id: string;
  from: string;
  content: string;
  timestamp: string;
  role: string;
}

const Messages = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const router = useRouter();
  const { resetUnreadCount } = useChatStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const socketRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);

  const SERVER_URL = Config.apiUrl || "http://localhost:3000/bagigi/api";

  useEffect(() => {
    if (!user || !isAuthenticated) return;

    resetUnreadCount();
    socketRef.current = getSocket(user.id, user.role);
    const socket = socketRef.current;
    setIsConnected(socket.connected);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleMessage = (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
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
  }, [user, isAuthenticated]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!socketRef.current) return;
    socketRef.current.emit("typing", {});
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", {});
    }, 2000);
  };

  useEffect(() => {
    if (!user || !isAuthenticated) return;
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/messages/history/${user.id}`);
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
  }, [user, isAuthenticated]);

  const sendMessage = () => {
    if (!inputText.trim() || !socketRef.current) return;
    const content = inputText.trim();
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
          isMe ? "bg-[#C5A35D]" : "bg-gray-200 dark:bg-background-muted"
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
          className={isMe ? "text-white/70" : "text-gray-500"}
        >
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <View
        style={styles.container}
        className="bg-background-light dark:bg-background-dark"
      >
        <Image
          source={require("@/assets/images/messages_guest.png")}
          style={styles.illustration}
          resizeMode="cover"
        />
        <View style={styles.guestContent}>
          <Text
            style={styles.guestTitle}
            className="text-typography-900 dark:text-typography-white"
          >
            {t("messages.guestTitle") || "Your Messages"}
          </Text>
          <Text style={styles.guestDescription}>
            {t("messages.guestDescription") ||
              "Please login or register to chat with our barbers and get personalized advice."}
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/customer/Profile")}
          >
            <Text style={styles.loginButtonText}>
              {t("auth.login_register") || "Login / Register"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => router.push("/customer/home")}
          >
            <Text style={styles.backHomeText}>
              {t("common.back_home") || "Back to Home"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
      />

      {isAdminTyping && (
        <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
          <TypingIndicator label={`Bagigi Barber ${t("common.isTyping")}`} />
        </View>
      )}

      <View
        style={styles.inputContainer}
        className="bg-white dark:bg-background-muted border-t border-outline-300 dark:border-gray-800"
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
          className="bg-[#C5A35D]"
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  illustration: {
    width: width,
    height: width * 0.8,
    marginTop: 40,
  },
  guestContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 16,
  },
  guestDescription: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: "#C5A35D",
    width: "100%",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#C5A35D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  backHomeButton: {
    marginTop: 24,
  },
  backHomeText: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "bold",
  },
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
});

export default Messages;
