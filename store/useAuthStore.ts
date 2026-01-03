import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/src/api";
import axios from "axios";
import { auth } from "../lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}
export type UserRole = "ADMIN" | "USER" | "GUEST";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User | null, token: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  checkAuth: () => Promise<void>; // <-- added
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setLoading: (isLoading) => set({ isLoading }),
      hasRole: (role: string) => {
        const user = get().user;
        return user?.role === role;
      },
      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      checkAuth: async () => {
        const { token, refreshToken } = get();
        if (!token || !refreshToken) return;

        set({ isLoading: true });
        try {
          const { data } = await axios.get(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-accesstoken`,
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          );

          const profile = await auth.me(token);

          set({
            user: profile,
            token: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.warn("Auth check failed:", error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),

    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) state.checkAuth?.();
        if (state) state._hasHydrated = true; // mark hydration done
      },
    }
  )
);
