import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { auth } from "@/lib/api";
import axios from "axios";
import Constants from "expo-constants";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  image?: string;
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
  checkAuth: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
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

      logout: async () => {
        try {
          await auth.logout();
        } catch (error) {
          console.warn("Logout request failed:", error);
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        const { token, refreshToken } = get();
        if (!token) return;

        try {
          // Always fetch fresh user data from the server on every app start.
          const profile = await auth.me(token);
          set({
            user: profile,
            isAuthenticated: true,
            isLoading: false,
          });

          // Separately refresh the access token if we have a refresh token.
          if (refreshToken) {
            try {
              const res = await api.post("/auth/refresh-token", { token: refreshToken });
              set({ token: res.data.accessToken });
            } catch (refreshError) {
              // Refresh failed but we still have a valid session from auth.me — keep going.
              console.warn("Token refresh failed, keeping current token:", refreshError);
            }
          }
        } catch (error) {
          // auth.me failed — token is expired or invalid. Clear stale state.
          console.warn("Auth check failed, clearing session:", error);
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateProfile: async (data: any) => {
        set({ isLoading: true });
        try {
          const res = await auth.updateProfile(data);
          // If the backend returns a full user object, update the store
          if (res.user) {
            set((state) => ({
              user: { ...state.user, ...res.user },
              isLoading: false,
            }));
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Update profile error:", error);
          set({ isLoading: false });
          throw error;
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

// Setup Axios Interceptors
import { setupAxiosAuth } from "@/lib/api";

setupAxiosAuth(
  () => useAuthStore.getState().token,
  (token) => useAuthStore.getState().setToken(token),
  () => useAuthStore.getState().logout()
);
