import { apiGet } from "@/lib/api-client";

export type FieldOwnerInfoResponse = {
  success: boolean;
  message: string;
  data: {
    user_id: number | null;
    display_name: string;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    joined_at: string | null;
    verified: boolean;
    approved_at: string | null;
  };
};

export function getFieldOwnerInfo(fieldId: string | number) {
  return apiGet<FieldOwnerInfoResponse>(`/fields/${fieldId}/owner-info`, undefined, {
    requireAuth: false,
  });
}