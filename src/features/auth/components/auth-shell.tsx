import Link from "next/link";
import { Cinzel } from "next/font/google";

import { ROUTES } from "@/core/route";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600", "700", "900"] });

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div
      className={`${cinzel.className} relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10`}
      style={{ background: "radial-gradient(ellipse at 50% 30%, #14261a 0%, #060d08 70%)" }}
    >
      {/* soft ambient glows */}
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
        <h1 className="text-center text-xl font-bold text-[#f3ead2]">{title}</h1>
        <p className="mt-1 text-center text-sm text-[#8f9683]">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-[#8f9683]">{footer}</p>
      </main>
    </div>
  );
}
