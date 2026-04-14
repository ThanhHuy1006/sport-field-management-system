const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

type ApiErrorPayload = {
  success?: boolean;
  message?: string;
  errors?: unknown;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
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