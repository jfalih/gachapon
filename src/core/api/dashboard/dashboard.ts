import request from "@/core/http/request";
import type { ApiResponse } from "@/core/http/response";
import { gatewayUrl } from "@/core/http/url";

import type { DashboardStats } from "./dashboard.types";

/** GET v1/admin/dashboard — aggregate stats (admin). */
export const getAdminDashboard = async (): Promise<DashboardStats | null> => {
  const res = await request<ApiResponse<DashboardStats>>(gatewayUrl("v1/admin/dashboard"));
  return res.data;
};
