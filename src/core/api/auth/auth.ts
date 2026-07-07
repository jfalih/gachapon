import request from "@/core/http/request";
import type { ApiResponse } from "@/core/http/response";
import { gatewayUrl } from "@/core/http/url";

import type { AuthData, LoginPayload, RegisterPayload } from "./auth.types";

/** Persist auth credentials so `request` can attach the bearer token. */
const persistAuth = (data: AuthData | null) => {
  if (typeof window === "undefined" || !data) return;
  if (data.token) localStorage.setItem("auth_token", data.token);
  if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
  if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
};

/** POST v1/auth/login — authenticate an existing user. */
export const login = async (payload: LoginPayload): Promise<AuthData | null> => {
  const res = await request<ApiResponse<AuthData>>(gatewayUrl("v1/auth/login"), {
    method: "post",
    json: payload,
  });
  persistAuth(res.data);
  return res.data;
};

/** POST v1/auth/register — create a customer or store-owner account. */
export const register = async (payload: RegisterPayload): Promise<AuthData | null> => {
  const res = await request<ApiResponse<AuthData>>(gatewayUrl("v1/auth/register"), {
    method: "post",
    json: payload,
  });
  persistAuth(res.data);
  return res.data;
};
