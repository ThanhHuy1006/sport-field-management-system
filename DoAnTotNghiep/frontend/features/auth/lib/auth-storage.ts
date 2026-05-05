const ACCESS_TOKEN_KEY = "accessToken";
const CURRENT_USER_KEY = "currentUser";

export type StoredUserRole = "USER" | "OWNER" | "ADMIN";

export type StoredUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
};

export type NormalizedStoredUser = Omit<StoredUser, "role"> & {
  role: StoredUserRole;
};

function normalizeRole(role: string): StoredUserRole {
  const normalizedRole = role?.toUpperCase();

  if (normalizedRole === "ADMIN") return "ADMIN";
  if (normalizedRole === "OWNER") return "OWNER";

  return "USER";
}

function normalizeUser(user: StoredUser): NormalizedStoredUser {
  return {
    ...user,
    role: normalizeRole(user.role),
  };
}

export function saveAuthSession(token: string, user: StoredUser) {
  if (typeof window === "undefined") return;

  const normalizedUser = normalizeUser(user);

  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalizedUser));
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

export function getStoredUser(): NormalizedStoredUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;

  try {
    const user = JSON.parse(raw) as StoredUser;
    return normalizeUser(user);
  } catch {
    clearAuthSession();
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getStoredAccessToken() && getStoredUser());
}