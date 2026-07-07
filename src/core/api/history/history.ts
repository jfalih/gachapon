import request from "@/core/http/request";
import type { ApiResponse } from "@/core/http/response";
import { gatewayUrl } from "@/core/http/url";

import type { GachaHistoryPage, HistoryParams } from "./history.types";

const emptyPage: GachaHistoryPage = { items: [], total: 0, limit: 20, offset: 0 };

/** GET v1/me/history — the signed-in user's pulls, newest first. */
export const getMyHistory = async (params: HistoryParams = {}): Promise<GachaHistoryPage> => {
  const res = await request<ApiResponse<GachaHistoryPage>>(gatewayUrl("v1/me/history", params));
  return res.data ?? emptyPage;
};

/** GET v1/admin/history — every user's pulls, newest first (admin). */
export const getAdminHistory = async (params: HistoryParams = {}): Promise<GachaHistoryPage> => {
  const res = await request<ApiResponse<GachaHistoryPage>>(gatewayUrl("v1/admin/history", params));
  return res.data ?? emptyPage;
};
