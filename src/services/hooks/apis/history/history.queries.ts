import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { HistoryParams } from "@/core/api/history";

import { historyKeys } from "./history.keys";

/** The signed-in user's pulls; previous page stays while the next loads. */
export const useMyHistoryQuery = (params: HistoryParams = {}, enabled = true) =>
  useQuery({ ...historyKeys.mine(params), placeholderData: keepPreviousData, enabled });

/** Every user's pulls (admin); previous page stays while the next loads. */
export const useAdminHistoryQuery = (params: HistoryParams = {}, enabled = true) =>
  useQuery({ ...historyKeys.admin(params), placeholderData: keepPreviousData, enabled });
