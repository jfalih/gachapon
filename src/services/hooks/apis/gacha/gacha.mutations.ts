import { useMutation } from "@tanstack/react-query";

import { pullGacha, type PullGachaPayload } from "@/core/api/gacha";

/** Rolls the gacha on the server; resolves with the reward that was won. */
export const usePullGacha = () =>
  useMutation({
    mutationFn: (payload: PullGachaPayload) => pullGacha(payload),
  });
