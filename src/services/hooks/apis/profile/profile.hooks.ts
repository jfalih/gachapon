import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { updateMe, type UpdateProfilePayload } from "@/core/api/profile";

import { profileKeys } from "./profile.keys";

/** Current user's profile. */
export const useMeQuery = (enabled = true) => useQuery({ ...profileKeys.me, enabled });

/** Update the current user's profile. */
export const useUpdateMe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMe(payload),
    onSuccess: (profile) => {
      if (profile) qc.setQueryData(profileKeys.me.queryKey, profile);
    },
  });
};
