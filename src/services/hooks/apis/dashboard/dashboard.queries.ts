import { useQuery } from "@tanstack/react-query";

import { dashboardKeys } from "./dashboard.keys";

/** Admin dashboard aggregates; refetches every 30s to stay near-real-time. */
export const useAdminDashboardQuery = () =>
  useQuery({ ...dashboardKeys.stats, refetchInterval: 30_000 });
