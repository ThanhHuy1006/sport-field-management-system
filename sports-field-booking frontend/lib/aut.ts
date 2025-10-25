// lib/auth.ts
import api from "./api"

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    role: string
  }
}

// Đăng ký tài khoản
export async function registerUser(email: string, password: string, name?: string): Promise<AuthResponse> {
  const res = await api.post("/auth/register", { email, password, name })
  return res.data
}

// Đăng nhập
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post("/auth/login", { email, password })
  return res.data
}

// Làm mới token
export async function refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  const res = await api.post("/auth/refresh", { refreshToken })
  return res.data
}
