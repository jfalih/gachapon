"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut, useSession } from "next-auth/react";
import { LogoutCurve } from "iconsax-react";

import { ROUTES } from "@/core/route";

type NavItem = { label: string; href: string; adminOnly?: boolean };

const NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.DASHBOARD.ROOT },
  { label: "Gacha events", href: ROUTES.DASHBOARD.EVENTS, adminOnly: true },
  { label: "Gacha history", href: ROUTES.DASHBOARD.HISTORY, adminOnly: true },
  { label: "Settings", href: ROUTES.DASHBOARD.SETTINGS },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const nav = NAV.filter((n) => !n.adminOnly || role === "admin");

  const isActive = (href: string) =>
    href === ROUTES.DASHBOARD.ROOT ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-muted/30 p-4">
        <Link href={ROUTES.DASHBOARD.ROOT} className="mb-1 block px-2 text-lg font-bold text-primary">
          Gachapon
        </Link>
        <p className="mb-6 px-2 text-xs capitalize text-muted-foreground">{role ?? ""} panel</p>

        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                (isActive(n.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground")
              }
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-border pt-3">
          <p className="truncate px-3 text-xs text-muted-foreground">{session?.user?.email}</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: ROUTES.HOME })}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            <LogoutCurve size={16} color="currentColor" /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
