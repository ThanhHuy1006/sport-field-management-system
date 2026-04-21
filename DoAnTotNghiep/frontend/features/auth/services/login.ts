import { apiRequest } from "@/lib/api-client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
      phone: string | null;
      avatar_url: string | null;
      role: string;
      status: string;
    };
  };
};

export function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    requireAuth: false,
  });
}