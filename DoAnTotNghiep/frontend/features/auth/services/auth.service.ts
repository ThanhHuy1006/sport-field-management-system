import { apiGet, apiRequest } from "@/lib/api-client";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  data: AuthUser;
};

export type MeResponse = {
  success: boolean;
  message: string;
  data: AuthUser & {
    created_at: string;
    updated_at: string;
  };
};

export function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    requireAuth: false,
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    requireAuth: false,
  });
}

export function getMe() {
  return apiGet<MeResponse>("/auth/me", undefined, {
    requireAuth: true,
  });
}