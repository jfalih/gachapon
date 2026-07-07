import request from "@/core/http/request";
import type { ApiResponse } from "@/core/http/response";
import { gatewayUrl } from "@/core/http/url";

import type { PullGachaPayload, PullGachaResult } from "./gacha.types";

/** POST v1/gacha/pull — the server rolls the banner and returns what was won. */
export const pullGacha = async (payload: PullGachaPayload): Promise<PullGachaResult> => {
  const res = await request<ApiResponse<PullGachaResult>>(gatewayUrl("v1/gacha/pull"), {
    method: "post",
    json: payload,
  });
  if (!res.data) throw new Error(res.message || "Pull failed");
  return res.data;
};
