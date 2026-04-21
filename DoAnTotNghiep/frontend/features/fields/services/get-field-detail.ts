import { apiGet } from "@/lib/api-client";

export type FieldDetailResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    field_name: string | null;
    sport_type: string | null;
    description: string | null;
    address: string | null;
    district: string | null;
    ward: string | null;
    province: string | null;
    latitude: string | number | null;
    longitude: string | number | null;
    base_price_per_hour: string | number | null;
    currency: string | null;
    status: string;
    min_duration_minutes: number | null;
    max_players: number | null;
    created_at: string | null;
    updated_at: string | null;
    rating: number;
    reviews: number;
    openTime: string | null;
    closeTime: string | null;
    images: Array<{
      id: number;
      url: string;
      is_primary?: boolean | null;
      order_no?: number | null;
    }>;
    facilities: Array<{
      id: number;
      name: string;
      icon?: string | null;
      note?: string | null;
    }>;
  };
};

export function getFieldDetail(fieldId: string | number) {
  return apiGet<FieldDetailResponse>(`/fields/${fieldId}`, undefined, {
    requireAuth: false,
  });
}