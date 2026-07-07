/** Account role — players pull gacha, admins manage events. The backend
 * decides the role; it is never sent by the client. */
export type AuthRole = "user" | "admin";

/** Payload for POST v1/auth/login. */
export type LoginPayload = {
  email: string;
  password: string;
};

/** Payload for POST v1/auth/register — always creates a player account
 * (500 starting coins). Admins are seeded server-side. */
export type RegisterPayload = {
  email: string;
  full_name: string;
  password: string;
};

/** Authenticated user returned by the register/login endpoints. */
export type AuthUser = {
  id: number;
  email: string;
  full_name: string;
  coins: number;
};

/** Data envelope returned on successful auth. */
export type AuthData = {
  token?: string;
  refresh_token?: string;
  role?: AuthRole;
  user?: AuthUser;
};
