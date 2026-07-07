import { createQueryKeys } from "@lukemorales/query-key-factory";

import { getAdminDashboard } from "@/core/api/dashboard";

export const dashboardKeys = createQueryKeys("adminDashboard", {
  stats: {
    queryKey: null,
    queryFn: () => getAdminDashboard(),
  },
});
