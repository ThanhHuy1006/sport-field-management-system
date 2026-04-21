import { apiGet } from "@/lib/api-client";

export type BrowseFieldItem = {
  id: number;
  name: string;
  type: string;
  location: string;
  district: string | null;
  price: number;
  image: string | null;
  available: boolean;
  rating: number;
  reviews: number;
  openTime: string | null;
  closeTime: string | null;

  field_name?: string | null;
  sport_type?: string | null;
  address?: string | null;
  base_price_per_hour?: string | number | null;
  primary_image?: {
    id: number;
    url: string;
    is_primary?: boolean;
    order_no?: number;
  } | null;
};

export type BrowseFieldsResponse = {
  success: boolean;
  message: string;
  data: {
    items: BrowseFieldItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

type BrowseFieldsParams = {
  q?: string;
  sport?: string;
  district?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
};

export function getBrowseFields(params: BrowseFieldsParams) {
  return apiGet<BrowseFieldsResponse>("/fields", params, {
    requireAuth: false,
  });
}