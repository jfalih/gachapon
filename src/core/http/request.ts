import { ROUTES } from "@/core/route";

const AUTH_KEYS = ["auth_token", "refresh_token", "user"] as const;

export const clearAuthStorage = () => {
  if (typeof window === "undefined") return;
  AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
};

const authToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("auth_token") ?? undefined;
};

export interface RequestOptions extends Omit<RequestInit, "body"> {
  method?: "get" | "post" | "put" | "patch" | "delete";
  /** JSON body — stringified automatically and sets Content-Type. */
  json?: unknown;
}

/**
 * Typed fetch wrapper. Adds the bearer token, JSON-encodes `json`, and rejects
 * with the parsed error body on non-2xx (redirecting to login on 401).
 */
const request = async <T>(url: RequestInfo, options: RequestOptions = {}): Promise<T> => {
  const { json, method = "get", headers, ...init } = options;

  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  const token = authToken();
  // An explicitly-provided Authorization header wins (e.g. right after sign-in,
  // before the token has been mirrored into localStorage).
  if (token && !finalHeaders.Authorization) finalHeaders.Authorization = `Bearer ${token}`;
  if (json !== undefined) finalHeaders["Content-Type"] = "application/json";

  const res = await fetch(url, {
    ...init,
    method: method.toUpperCase(),
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  if (res.status === 401) {
    const sentAuth = Boolean(finalHeaders.Authorization);
    clearAuthStorage();
    // Only bounce to login when an *authenticated* call was rejected (stale
    // token) and we're not already on an auth page — otherwise the login page
    // reload-loops, and guests get kicked off public pages like the gacha home.
    if (
      typeof window !== "undefined" &&
      sentAuth &&
      !window.location.pathname.startsWith("/auth")
    ) {
      window.location.href = ROUTES.AUTH.LOGIN;
    }
    return Promise.reject(new Error("Unauthorized"));
  }

  const data = (await res.json().catch(() => undefined)) as T;
  if (!res.ok) return Promise.reject(data ?? new Error(`Request failed: ${res.status}`));
  return data;
};

export default request;
