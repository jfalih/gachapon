import request from "@/core/http/request";
import type { ApiResponse } from "@/core/http/response";
import { gatewayUrl } from "@/core/http/url";

import type { GachaEvent, GachaEventPayload } from "./events.types";

/** GET v1/events — public, active banners with items & drop rates. */
export const getGachaEvents = async (): Promise<GachaEvent[]> => {
  const res = await request<ApiResponse<GachaEvent[]>>(gatewayUrl("v1/events"));
  return res.data ?? [];
};

/** GET v1/admin/events — admin, every event incl. inactive drafts. */
export const getAdminGachaEvents = async (): Promise<GachaEvent[]> => {
  const res = await request<ApiResponse<GachaEvent[]>>(gatewayUrl("v1/admin/events"));
  return res.data ?? [];
};

/** POST v1/admin/events — create an event with its items (admin). */
export const createGachaEvent = async (payload: GachaEventPayload): Promise<GachaEvent | null> => {
  const res = await request<ApiResponse<GachaEvent>>(gatewayUrl("v1/admin/events"), {
    method: "post",
    json: payload,
  });
  return res.data;
};

/** PUT v1/admin/events/:id — update an event; items are replaced (admin). */
export const updateGachaEvent = async (
  id: number,
  payload: GachaEventPayload,
): Promise<GachaEvent | null> => {
  const res = await request<ApiResponse<GachaEvent>>(gatewayUrl(`v1/admin/events/${id}`), {
    method: "put",
    json: payload,
  });
  return res.data;
};

/** DELETE v1/admin/events/:id — delete an event and its items (admin). */
export const deleteGachaEvent = async (id: number): Promise<void> => {
  await request<ApiResponse<null>>(gatewayUrl(`v1/admin/events/${id}`), { method: "delete" });
};
