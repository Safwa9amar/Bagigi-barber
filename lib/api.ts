import { useAuthStore, User } from "@/store/useAuthStore";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,

});

// ---------- Request Interceptor ----------
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token; // ✅ read from Zustand store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Check if data is FormData (or a polyfilled version with _parts)
  const isFormData = config.data && (
    config.data instanceof FormData ||
    (config.data && typeof config.data === 'object' && config.data._parts)
  );

  if (isFormData) {
    config.headers['Content-Type'] = "multipart/form-data";
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
  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/request-password-reset", {
      email,
    });
    return response.data;
  },
  resetPassword: async (
    email: string,
    newPassword: string,
    resetToken: string
  ): Promise<{
    token: string;
    user: User | null;
  }> => {
    const response = await api.post("/auth/reset-password", {
      email,
      newPassword,
      resetToken,
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

const booking = {
  create: async (data: any) => {
    const response = await api.post("/booking/create", data);
    return response.data;
  },
  estimate: async (data: any) => {
    const response = await api.post("/booking/estimate", data);
    return response.data;
  },
  getMyBookings: async () => {
    const response = await api.get("/booking/my-bookings");
    return response.data;
  },
};

const services = {
  getById: async (id: string) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get("/services");
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/services", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

const admin = {
  getStats: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const response = await api.get(`/admin/stats?${params.toString()}`);
    return response.data;
  },
  getAllBookings: async () => {
    const response = await api.get("/admin/bookings");
    return response.data;
  },
  updateBookingStatus: async (id: string, status: string) => {
    const response = await api.patch(`/admin/bookings/${id}`, { status });
    return response.data;
  },
  getAllClients: async () => {
    const response = await api.get("/admin/clients");
    return response.data;
  },
  getWorkingHours: async () => {
    const response = await api.get("/admin/hours");
    return response.data;
  },
  updateWorkingHours: async (id: string, data: { startTime: string; endTime: string; isOpen: boolean }) => {
    const response = await api.patch(`/admin/hours/${id}`, data);
    return response.data;
  },
};

export { auth, booking, services, admin };
export default api;
