import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface BookingState {
    newBookingCount: number;
    incrementNewBookingCount: () => void;
    resetNewBookingCount: () => void;
    setNewBookingCount: (count: number) => void;
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set) => ({
            newBookingCount: 0,
            incrementNewBookingCount: () =>
                set((state) => ({ newBookingCount: state.newBookingCount + 1 })),
            resetNewBookingCount: () => set({ newBookingCount: 0 }),
            setNewBookingCount: (count: number) => set({ newBookingCount: count }),
        }),
        {
            name: "booking-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
