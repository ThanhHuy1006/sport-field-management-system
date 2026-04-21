import { apiRequest } from "@/lib/api-client";

export type RegisterMemberPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
};

export type RegisterMemberResponse = {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      phone: string | null;
      avatar_url: string | null;
      role: string;
      status: string;
      created_at: string;
    };
    token: string;
  };
};

export function registerMember(payload: RegisterMemberPayload) {
  return apiRequest<RegisterMemberResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    requireAuth: false,
  });
}