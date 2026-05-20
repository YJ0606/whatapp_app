import type { AuthTokens, AuthUser } from "@/types/auth";

const ACCESS_KEY = "waai_access_token";
const REFRESH_KEY = "waai_refresh_token";
const USER_KEY = "waai_user";
const COOKIE_NAME = "waai_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setAuthSession(tokens: AuthTokens, user?: AuthUser | null): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(tokens.accessToken)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/** @deprecated Use setAuthSession */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, token);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function syncAuthCookieFromStorage(): void {
  const token = getToken();
  if (!token || typeof window === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  return Boolean(token && !isTokenExpired(token));
}
