import { useAuthStore, User } from "@/store/useAuthStore";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------- Request Interceptor ----------
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token; // ✅ read from Zustand store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Response Interceptor ----------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ✅ Get refresh token from SecureStore
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        console.log("refrech token :", refreshToken);

        if (!refreshToken) throw new Error("No refresh token found");

        interface RefreshResponse {
          accessToken: string;
        }

        const res = await api.post<RefreshResponse>("/auth/refresh-token", {
          token: refreshToken,
        });

        const newAccessToken = res.data.accessToken;

        // ✅ Update Zustand store with new token
        useAuthStore.getState().setToken(newAccessToken);

        // ✅ Retry failed request with new token
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${newAccessToken}`,
        };

        return api(originalRequest);
      } catch (err) {
        // Refresh failed → logout via Zustand
        useAuthStore.getState().logout();
        await SecureStore.deleteItemAsync("refreshToken");
      }
    }

    return Promise.reject(error);
  }
);

const auth = {
  register: async (email: string, password: string, phone: string) => {
    const response = await api.post("/auth/register", {
      email,
      password,
      phone,
    });
    return response.data;
  },

  login: async (
    email: string,
    password: string
  ): Promise<{
    token: string;
    user: User | null;
  }> => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  verifyConfirmationCode: async (
    email: string,
    code: string
  ): Promise<{
    token: string;
    user: User | null;
  }> => {
    const response = await api.post("/auth/verify-confirmation-code", {
      email,
      code,
    });
    return response.data;
  },
  requestNewConfirmationCode: async (email: string) => {
    const response = await api.post("/auth/request-new-confirmation-code", {
      email,
    });
    return response.data;
  },
  me: async (token: string) => {
    const response = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export { auth };
export default api;
