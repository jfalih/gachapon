import { createQueryKeys } from "@lukemorales/query-key-factory";

import { getAdminGachaEvents, getGachaEvents } from "@/core/api/events";

export const gachaEventKeys = createQueryKeys("gachaEvents", {
  list: {
    queryKey: null,
    queryFn: () => getGachaEvents(),
  },
  adminList: {
    queryKey: null,
    queryFn: () => getAdminGachaEvents(),
  },
});
