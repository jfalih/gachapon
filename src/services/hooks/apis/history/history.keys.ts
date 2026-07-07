import { createQueryKeys } from "@lukemorales/query-key-factory";

import { getAdminHistory, getMyHistory, type HistoryParams } from "@/core/api/history";

export const historyKeys = createQueryKeys("gachaHistory", {
  mine: (params: HistoryParams) => ({
    queryKey: [params],
    queryFn: () => getMyHistory(params),
  }),
  admin: (params: HistoryParams) => ({
    queryKey: [params],
    queryFn: () => getAdminHistory(params),
  }),
});
