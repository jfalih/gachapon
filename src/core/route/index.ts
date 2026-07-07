/** Centralized route paths so links/redirects stay consistent. */
export const ROUTES = {
  HOME: "/",
  ACCOUNT: "/account",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ADMIN_LOGIN: "/auth/admin",
  },
  DASHBOARD: {
    ROOT: "/dashboard",
    EVENTS: "/dashboard/events",
    HISTORY: "/dashboard/history",
    SETTINGS: "/dashboard/settings",
  },
} as const;

/** Where each role lands after signing in — admins to the dashboard, players
 * to the gacha machine. */
export const roleHome = (role?: string): string =>
  role === "admin" ? ROUTES.DASHBOARD.ROOT : ROUTES.HOME;
