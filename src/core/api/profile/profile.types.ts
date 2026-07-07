import type { AuthRole } from "@/core/api/auth";

/** Current user's profile. */
export type Profile = {
  id: number;
  role: AuthRole;
  email?: string;
  full_name?: string;
  coins?: number; // gacha balance
  level?: number; // player level (backend-owned)
  title?: string; // player title, e.g. "Summoner" (backend-owned)
  phone?: string; // legacy, unused
  store_name?: string; // legacy, unused
  slug?: string; // legacy, unused
};

/** PUT /me body — only the fields relevant to the role are used. */
export type UpdateProfilePayload = {
  full_name: string;
  phone?: string;
  store_name?: string;
};
