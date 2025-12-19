import { create } from "zustand";

interface AuthState {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  reset: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  email: "",
  password: "",
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  reset: () => set({ email: "", password: "" }),
}));

export default useAuthStore;
