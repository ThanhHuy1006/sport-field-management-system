const ACCESS_TOKEN_KEY = "accessToken";
const CURRENT_USER_KEY = "currentUser";

export type StoredUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
};

export function saveAuthSession(token: string, user: StoredUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}