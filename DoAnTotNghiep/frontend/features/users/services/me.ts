import { apiRequest } from "@/lib/api-client";

export type Me = {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type MeResponse = {
  success: boolean;
  message: string;
  data: Me;
};

export type UpdateMePayload = {
  name?: string;
  phone?: string | null;
  avatar_url?: string | null;
};

export function getMe() {
  return apiRequest<MeResponse>("/users/me", {
    method: "GET",
    requireAuth: true,
  });
}

export function updateMe(payload: UpdateMePayload) {
  return apiRequest<MeResponse>("/users/me", {
    method: "PATCH",
    requireAuth: true,
    body: JSON.stringify(payload),
  });
}
