import { createQueryKeys } from "@lukemorales/query-key-factory";

import { getMe } from "@/core/api/profile";

export const profileKeys = createQueryKeys("profile", {
  me: {
    queryKey: null,
    queryFn: () => getMe(),
  },
});
