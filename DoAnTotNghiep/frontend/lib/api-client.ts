const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

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

  const isFormData =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    cache: "no-store",
  });

  let data: T | ApiErrorPayload | null = null;

  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error("Response từ server không phải JSON hợp lệ");
    }

    return null as T;
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
export function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, "method" | "body"> = {}
) {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(
  endpoint: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, "method" | "body"> = {}
) {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T>(
  endpoint: string,
  options: Omit<ApiRequestOptions, "method" | "body"> = {}
) {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "DELETE",
  });
}
