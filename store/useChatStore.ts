import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ChatState {
    unreadCount: number;
    incrementUnreadCount: () => void;
    resetUnreadCount: () => void;
    setUnreadCount: (count: number) => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set) => ({
            unreadCount: 0,
            incrementUnreadCount: () =>
                set((state) => ({ unreadCount: state.unreadCount + 1 })),
            resetUnreadCount: () => set({ unreadCount: 0 }),
            setUnreadCount: (count: number) => set({ unreadCount: count }),
        }),
        {
            name: "chat-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
