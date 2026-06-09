import { getStoredAccessToken } from "@/features/auth/lib/auth-storage";
import { getImageUrl } from "@/lib/image-url";

export type FavoriteFieldApiItem = {
  id: number;
  field_id?: number | null;
  field_name: string | null;
  address: string | null;
  district?: string | null;
  ward?: string | null;
  province?: string | null;
  sport_type: string | null;
  base_price_per_hour: string | number | null;
  currency: string | null;
  status?: string | null;
  image_url: string | null;
  rating: number | string | null;
  review_count: number | string | null;
  favorited_at?: string | null;
};

export type FavoriteFieldUi = {
  id: number;
  name: string;
  type: string;
  location: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  image: string;
};

type FavoritesListResponse = {
  success: boolean;
  message: string;
  data: {
    items: FavoriteFieldApiItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

type FavoriteCheckResponse = {
  success: boolean;
  message: string;
  data: {
    field_id: number;
    is_favorite: boolean;
  };
};

type FavoriteActionResponse = {
  success: boolean;
  message: string;
  data: FavoriteFieldApiItem | { field_id: number; removed?: boolean };
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

function buildApiUrl(path: string, query?: Record<string, string | number | undefined>) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function getRequiredAccessToken() {
  const token = getStoredAccessToken();

  if (!token) {
    throw new Error("Vui lòng đăng nhập để sử dụng chức năng yêu thích");
  }

  return token;
}

async function favoriteRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "DELETE";
    query?: Record<string, string | number | undefined>;
  } = {},
): Promise<T> {
  const response = await fetch(buildApiUrl(path, options.query), {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getRequiredAccessToken()}`,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Yêu cầu thất bại với mã ${response.status}`,
    );
  }

  return payload as T;
}

export function getMyFavoriteFields(params: { page: number; limit: number }) {
  return favoriteRequest<FavoritesListResponse>("/favorites/my", {
    query: {
      page: params.page,
      limit: params.limit,
    },
  });
}

export function checkFavoriteField(fieldId: number | string) {
  return favoriteRequest<FavoriteCheckResponse>(`/favorites/check/${fieldId}`);
}

export function addFavoriteField(fieldId: number | string) {
  return favoriteRequest<FavoriteActionResponse>(`/favorites/${fieldId}`, {
    method: "POST",
  });
}

export function removeFavoriteField(fieldId: number | string) {
  return favoriteRequest<FavoriteActionResponse>(`/favorites/${fieldId}`, {
    method: "DELETE",
  });
}

function toNumber(value: string | number | null | undefined, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;

  const num = Number(value);

  return Number.isFinite(num) ? num : fallback;
}

function buildLocation(field: FavoriteFieldApiItem) {
  const parts = [field.address, field.ward, field.district, field.province]
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Chưa cập nhật địa chỉ";
}

export function mapFavoriteFieldToUi(field: FavoriteFieldApiItem): FavoriteFieldUi {
  return {
    id: field.field_id ?? field.id,
    name: field.field_name || "Chưa có tên sân",
    type: field.sport_type || "Khác",
    location: buildLocation(field),
    price: toNumber(field.base_price_per_hour),
    currency: field.currency || "VND",
    rating: toNumber(field.rating),
    reviews: toNumber(field.review_count),
    image: field.image_url ? getImageUrl(field.image_url) : "/placeholder.svg",
  };
}
