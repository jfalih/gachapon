import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createGachaEvent,
  deleteGachaEvent,
  updateGachaEvent,
  type GachaEventPayload,
} from "@/core/api/events";

import { gachaEventKeys } from "./events.keys";

/** Invalidate both the admin + public event lists after a write. */
const useInvalidateEvents = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: gachaEventKeys._def });
};

export const useCreateGachaEvent = () => {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (payload: GachaEventPayload) => createGachaEvent(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateGachaEvent = () => {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: GachaEventPayload }) =>
      updateGachaEvent(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteGachaEvent = () => {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (id: number) => deleteGachaEvent(id),
    onSuccess: invalidate,
  });
};
