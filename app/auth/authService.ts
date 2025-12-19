import api from "@/lib/api";

export const loginService = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const registerService = async (email: string, password: string) => {
  const response = await api.post("/auth/register", { email, password });
  return response.data;
};
