import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ROUTES } from "@/core/route";

/**
 * Route guard. `/dashboard/*` is for admins only:
 *   - not signed in      → /auth/login
 *   - signed in as player → / (gacha machine)
 */
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const role = session?.user?.role;

  if (nextUrl.pathname.startsWith(ROUTES.DASHBOARD.ROOT)) {
    if (!session) {
      return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, nextUrl));
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL(ROUTES.HOME, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
