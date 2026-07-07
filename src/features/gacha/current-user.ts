import { useSession } from "next-auth/react";

import { useMeQuery } from "@/services/hooks/apis/profile";

export interface GachaUser {
  name: string;
  level: number;
  avatar: string;
  title: string;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

/**
 * Current player. Name/level/title come from GET /me — backend-owned, never
 * hardcoded here; the session only gates authentication. Falls back to
 * sensible defaults while /me is still loading.
 */
export const useCurrentUser = (): { user: GachaUser | null; status: AuthStatus } => {
  const { data: session, status } = useSession();
  const { data: me } = useMeQuery(status === "authenticated");
  if (status !== "authenticated") return { user: null, status };
  return {
    user: {
      name:
        me?.full_name ??
        session.user?.name ??
        session.user?.email?.split("@")[0] ??
        "Adventurer",
      level: me?.level ?? 1,
      avatar: "🧙",
      title: me?.title ?? "Adventurer",
    },
    status,
  };
};
