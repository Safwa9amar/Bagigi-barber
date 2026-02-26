import { User } from "@/store/useAuthStore";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

let getAccessToken: () => string | null = () => null;
let setAccessToken: (token: string) => void = () => { };
let logoutUser: () => void = () => { };

export const setupAxiosAuth = (
  getToken: () => string | null,
  setToken: (token: string) => void,
  logout: () => void
) => {
  getAccessToken = getToken;
  setAccessToken = setToken;
  logoutUser = logout;
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,

});

// ---------- Request Interceptor ----------
api.interceptors.request.use((config) => {
  const token = getAccessToken(); // ✅ read from injected getter
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
    const isInactiveShop =
      error.response?.status === 403 &&
      typeof error.response?.data?.error === "string" &&
      error.response.data.error.toLowerCase().includes("shop is inactive");

    if (isInactiveShop) {
      logoutUser();
      await SecureStore.deleteItemAsync("refreshToken");
      return Promise.reject(error);
    }

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

        // ✅ Update Zustand store via injected setter
        setAccessToken(newAccessToken);

        // ✅ Retry failed request with new token
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${newAccessToken}`,
        };

        return api(originalRequest);
      } catch (err) {
        // Refresh failed → logout via injected function
        logoutUser();
        await SecureStore.deleteItemAsync("refreshToken");
      }
    }

    return Promise.reject(error);
  }
);

const auth = {
  register: async (
    email: string,
    password: string,
    phone: string,
    adminCode: string
  ) => {
    const response = await api.post("/auth/register", {
      email,
      password,
      phone,
      adminCode,
    });
    return response.data;
  },
  getAdmins: async (): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      code: string;
      name: string;
      logo?: string | null;
      barberLogoUri?: string | null;
      barberLogoFileId?: string | null;
    }>;
  }> => {
    const response = await api.get("/auth/admins");
    return response.data;
  },

  login: async (
    email: string,
    password: string,
    shopCode?: string
  ): Promise<{
    token: string;
    user: User | null;
  }> => {
    const response = await api.post("/auth/login", {
      email,
      password,
      shopCode,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  verifyConfirmationCode: async (
    email: string,
    code: string,
    shopCode?: string
  ): Promise<{
    token: string;
    user: User | null;
  }> => {
    const response = await api.post("/auth/verify-confirmation-code", {
      email,
      code,
      shopCode,
    });
    return response.data;
  },
  requestNewConfirmationCode: async (email: string, shopCode?: string) => {
    const response = await api.post("/auth/request-new-confirmation-code", {
      email,
      shopCode,
    });
    return response.data;
  },
  forgotPassword: async (email: string, shopCode?: string) => {
    const response = await api.post("/auth/request-password-reset", {
      email,
      shopCode,
    });
    return response.data;
  },
  resetPassword: async (
    email: string,
    newPassword: string,
    resetToken: string,
    shopCode?: string
  ): Promise<{
    token: string;
    user: User | null;
  }> => {
    const response = await api.post("/auth/reset-password", {
      email,
      newPassword,
      resetToken,
      shopCode,
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

  updateProfile: async (data: any) => {
    const response = await api.post("/auth/update-profile", data);
    return response.data;
  },
  getAccessStatus: async (): Promise<{
    blocked: boolean;
    reason: string | null;
    trialDays: number;
    trialEndsAt?: string;
    trialDaysRemaining?: number;
    subscription?: {
      id: string;
      plan: "MONTHLY" | "YEARLY";
      status: "ACTIVE" | "EXPIRED" | "CANCELLED";
      startsAt: string;
      endsAt: string;
    };
    message?: string;
  }> => {
    const response = await api.get("/auth/access-status");
    return response.data;
  },
  uploadPaymentReceipt: async (data: FormData): Promise<{
    message: string;
    data: {
      id: string;
      userId: string;
      imageUrl: string;
      note?: string | null;
      status: "PENDING" | "APPROVED" | "REJECTED";
      createdAt: string;
      updatedAt: string;
    };
  }> => {
    const response = await api.post("/auth/upload-payment-receipt", data);
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
  addReview: async (serviceId: string, data: { rating: number; comment?: string }) => {
    const response = await api.post(`/services/${serviceId}/reviews`, data);
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
  updateBookingStatus: async (id: string, data: { status?: string; estimatedAt?: string }) => {
    const response = await api.patch(`/admin/bookings/${id}`, data);
    return response.data;
  },
  notifyUser: async (id: string) => {
    const response = await api.post(`/admin/bookings/${id}/notify`);
    return response.data;
  },
  createWalkIn: async (data: { serviceId: string; guestName: string; guestPhone?: string }) => {
    const response = await api.post("/admin/bookings/walk-in", data);
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

type SubscriptionPlan = "MONTHLY" | "YEARLY";
type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface SubscriptionRecord {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  price: number;
  startsAt: string;
  endsAt: string;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const subscription = {
  getMine: async (): Promise<{
    isSubscribed: boolean;
    daysRemaining?: number;
    data: SubscriptionRecord | null;
  }> => {
    const response = await api.get("/subscriptions/me");
    return response.data;
  },
  subscribe: async (plan: SubscriptionPlan): Promise<{ data: SubscriptionRecord; message: string }> => {
    const response = await api.post("/subscriptions/subscribe", { plan });
    return response.data;
  },
  cancel: async (): Promise<{ data: SubscriptionRecord; message: string }> => {
    const response = await api.post("/subscriptions/cancel");
    return response.data;
  },
};

export { auth, booking, services, admin, subscription };
export default api;
