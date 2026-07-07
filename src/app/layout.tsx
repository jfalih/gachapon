import type { Metadata } from "next";

import { AuthBridge } from "@/components/providers/auth-bridge";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Aether Gacha",
  description: "MMORPG-style claw machine gacha",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          <QueryProvider>
            <AuthBridge />
            {children}
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
