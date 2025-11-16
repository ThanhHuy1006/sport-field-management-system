import api from "./axios";

// Login chung cho Customer + Owner + Admin
export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};
