import { apiGet } from "@/lib/api-client";

export type MeResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    role: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
};

export function getMe() {
  return apiGet<MeResponse>("/auth/me", undefined, {
    requireAuth: true,
  });
}