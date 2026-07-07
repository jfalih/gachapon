"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Cinzel } from "next/font/google";
import { signOut } from "next-auth/react";

import { ROUTES } from "@/core/route";
import { useMeQuery } from "@/services/hooks/apis/profile";

import { useCurrentUser } from "../current-user";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600", "700", "900"] });

/** Player account/settings — gacha-themed, read-only (backend owns the data). */
export function GachaAccountPage() {
  const router = useRouter();
  const { user, status } = useCurrentUser();
  const { data: me, isLoading } = useMeQuery(status === "authenticated");

  // guests have no account page
  useEffect(() => {
    if (status === "unauthenticated") router.replace(ROUTES.AUTH.LOGIN);
  }, [status, router]);

  return (
    <div
      className={`${cinzel.className} relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10`}
      style={{ background: "radial-gradient(ellipse at 50% 30%, #14261a 0%, #060d08 70%)" }}
    >
      <div className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-[#c8a961]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-1/4 h-80 w-80 rounded-full bg-[#2f5a3c]/20 blur-3xl" />

      <main className="relative w-full max-w-md rounded-xl border border-[#c8a961]/50 bg-[#0d1420]/85 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.65)] backdrop-blur">
        <Link
          href={ROUTES.HOME}
          className="block text-center text-lg font-bold tracking-[0.28em] text-[#e8cd8a] transition-colors hover:text-[#ffd873]"
        >
          ✦ AETHER GACHA ✦
        </Link>
        <div className="mx-auto my-6 h-px w-3/4 bg-gradient-to-r from-transparent via-[#c8a961]/70 to-transparent" />

        {/* avatar + identity */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#c8a961]/60 bg-gradient-to-b from-[#2c3a66] to-[#1a2140] text-3xl">
            {user?.avatar ?? "…"}
          </span>
          <span className="text-lg font-bold text-[#f3ead2]">
            {isLoading ? "Loading…" : (user?.name ?? "—")}
          </span>
          <span className="text-xs tracking-[0.2em] text-[#ffd873]">
            {user ? `LV. ${user.level} · ${user.title.toUpperCase()}` : ""}
          </span>
        </div>

        {/* read-only profile fields */}
        <div className="flex flex-col gap-4">
          <Field label="Email" value={me?.email ?? "—"} />
          <Field label="Full name" value={me?.full_name ?? "—"} />
          <Field label="Coins" value={`🪙 ${(me?.coins ?? 0).toLocaleString()}`} />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={ROUTES.HOME}
            className="rounded-lg border border-[#c8a961]/60 bg-gradient-to-b from-[#eec55e] to-[#b8862a] px-6 py-3 text-center text-sm font-bold tracking-widest text-[#33240a] transition-[filter] hover:brightness-110"
          >
            BACK TO THE MACHINE
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: ROUTES.HOME })}
            className="cursor-pointer rounded-lg border border-[#ff9d9d]/40 bg-white/5 px-6 py-3 text-sm font-bold tracking-widest text-[#ff9d9d] transition-colors hover:bg-[#ff9d9d]/10"
          >
            LOGOUT
          </button>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-[0.14em] text-[#8f9683]">
        {label.toUpperCase()}
      </span>
      <div className="rounded-lg border border-[#c8a961]/30 bg-white/5 px-4 py-2.5 font-sans text-sm text-[#f3ead2]">
        {value}
      </div>
    </div>
  );
}
