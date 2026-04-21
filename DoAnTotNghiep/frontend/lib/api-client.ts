const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

type ApiErrorPayload = {
  success?: boolean;
  message?: string;
  errors?: unknown;
};

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

function buildQueryString(params?: QueryParams) {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

type ApiRequestOptions = RequestInit & {
  requireAuth?: boolean;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;

  const token =
    typeof window !== "undefined" && requireAuth
      ? localStorage.getItem("accessToken")
      : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers || {}),
    },
    cache: "no-store",
  });

  let data: T | ApiErrorPayload;

  try {
    data = await response.json();
  } catch {
    throw new Error("Response từ server không phải JSON hợp lệ");
  }

  if (!response.ok) {
    const errorData = data as ApiErrorPayload;
    throw new Error(errorData?.message || "API request failed");
  }

  return data as T;
}

export function apiGet<T>(
  endpoint: string,
  params?: QueryParams,
  options: Omit<ApiRequestOptions, "method" | "body"> = {}
) {
  return apiRequest<T>(`${endpoint}${buildQueryString(params)}`, {
    ...options,
    method: "GET",
  });
}