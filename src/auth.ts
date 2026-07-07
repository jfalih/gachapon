import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import type { AuthRole } from "@/core/api/auth";
import { ROUTES } from "@/core/route";

/**
 * Auth.js (NextAuth v5) with a Credentials provider that delegates to the Go
 * backend's POST /v1/auth/login. The backend returns `{ token, role }`; we carry
 * the token as `accessToken` and the role on the session for redirects/guards.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: ROUTES.AUTH.LOGIN },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const base = process.env.NEXT_PUBLIC_GATEWAY_URL;
        if (!base || !credentials?.email || !credentials?.password) return null;

        // The backend decides the role from the stored account.
        const res = await fetch(new URL("v1/auth/login", base), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success || !json?.data?.token) return null;

        return {
          id: String(credentials.email),
          email: String(credentials.email),
          role: json.data.role as AuthRole,
          accessToken: json.data.token as string,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.accessToken = token.accessToken as string | undefined;
      session.user.role = token.role as AuthRole | undefined;
      return session;
    },
  },
});
