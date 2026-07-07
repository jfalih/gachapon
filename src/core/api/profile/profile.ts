import request from "@/core/http/request";
import type { ApiResponse } from "@/core/http/response";
import { gatewayUrl } from "@/core/http/url";

import type { Profile, UpdateProfilePayload } from "./profile.types";

/** GET v1/me — the current user's profile. */
export const getMe = async (): Promise<Profile | null> => {
  const res = await request<ApiResponse<Profile>>(gatewayUrl("v1/me"));
  return res.data;
};

/** PUT v1/me — update the current user's profile. */
export const updateMe = async (payload: UpdateProfilePayload): Promise<Profile | null> => {
  const res = await request<ApiResponse<Profile>>(gatewayUrl("v1/me"), {
    method: "put",
    json: payload,
  });
  return res.data;
};
