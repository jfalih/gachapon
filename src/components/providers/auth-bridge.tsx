"use client";

import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

/**
 * Bridges the NextAuth session to the localStorage token that `request` reads,
 * so all API calls keep sending the bearer token. Clears cached queries when
 * the identity changes (login/logout) so per-user data can't leak across.
 */
export function AuthBridge() {
  const { data: session } = useSession();
  const qc = useQueryClient();

  useEffect(() => {
    const token = session?.accessToken ?? null;
    if (token) localStorage.setItem("auth_token", token);
    else {
      localStorage.removeItem("auth_token");
      qc.clear(); // logged out — drop profile/history caches
    }
  }, [session?.accessToken, qc]);

  return null;
}
