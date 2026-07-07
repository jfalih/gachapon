import { useQuery } from "@tanstack/react-query";

import { gachaEventKeys } from "./events.keys";

/** Public active banners (gacha page, transparency). */
export const useGachaEventsQuery = () => useQuery({ ...gachaEventKeys.list });

/** Every event incl. inactive drafts (admin management). */
export const useAdminGachaEventsQuery = (enabled = true) =>
  useQuery({ ...gachaEventKeys.adminList, enabled });
