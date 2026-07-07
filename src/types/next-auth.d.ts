import type { DefaultSession } from "next-auth";

import type { AuthRole } from "@/core/api/auth";

declare module "next-auth" {
  interface User {
    role?: AuthRole;
    accessToken?: string;
  }

  interface Session {
    accessToken?: string;
    user: { role?: AuthRole } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AuthRole;
    accessToken?: string;
  }
}
