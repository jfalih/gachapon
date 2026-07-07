# ✦ Aether Gacha ✦

An MMORPG-style **claw machine gacha** web app. A moss-covered, vine-wrapped gacha
machine stands in a night-forest clearing (rendered in Three.js); players spend
coins to pull banners, watch the claw grab a capsule, and collect fantasy loot.

## Features

**Player**

- 3D claw machine (Three.js): animated claw sequence, stacked capsules,
  forest environment, fireflies, glowing rune circle
- Banner buttons rendered from admin-configured events (name + coin cost)
- Server-side rolls — drop rates live in the backend, never in the client
- Reward popup with rarity glow (common / rare / epic / legendary)
- Coin balance from `GET /me`, updated from each pull's authoritative response
- Summon history (paginated) in the player dropdown
- Account page, login / register (NextAuth v5, credentials)
- Mobile-friendly layout

**Admin** (`/dashboard`, separate login at `/auth/admin`)

- Gacha events CRUD: banners, items, rarities, drop rates, pull cost
- Global pull history
- Profile settings

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS 4 + CSS Modules (gacha HUD)
- [Three.js](https://threejs.org) — the claw machine scene (no external 3D assets;
  everything is procedural geometry)
- TanStack Query 5 — server state (`src/services/hooks/apis/*`)
- NextAuth v5 (credentials provider, JWT sessions)
- Zod + react-hook-form — forms & validation

## Getting started

```bash
# 1. install dependencies
npm install

# 2. configure environment
cp .env.example .env
npx auth secret          # paste the value into AUTH_SECRET in .env

# 3. run the backend (separate repo — Go service on :9090)

# 4. run the app
npm run dev              # http://localhost:3000
```

### Scripts

| Script              | What it does                     |
| ------------------- | -------------------------------- |
| `npm run dev`       | Dev server (Turbopack)           |
| `npm run build`     | Production build                 |
| `npm run start`     | Serve the production build       |
| `npm run lint`      | ESLint                           |
| `npm run typecheck` | `tsc --noEmit`                   |

### Environment variables

| Variable                  | Description                                                                  |
| ------------------------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_GATEWAY_URL` | Base URL of the API gateway, e.g. `http://localhost:9090/api/`               |
| `AUTH_SECRET`             | Auth.js v5 JWT/session encryption secret (`npx auth secret` to generate one) |

## Backend API contract

All endpoints are resolved against `NEXT_PUBLIC_GATEWAY_URL` and share the
envelope `{ "data": ..., "message": string, "success": boolean }`.
Authenticated calls send `Authorization: Bearer <token>`.

| Method | Path                   | Auth   | Description                                                        |
| ------ | ---------------------- | ------ | ------------------------------------------------------------------ |
| POST   | `v1/auth/login`        | —      | `{ email, password }` → `{ token, role }`                          |
| POST   | `v1/auth/register`     | —      | Create a customer account → `{ token, role }`                      |
| GET    | `v1/me`                | player | Profile: `{ id, role, email, full_name, coins, level, title }`     |
| PUT    | `v1/me`                | player | Update profile                                                     |
| GET    | `v1/events`            | —      | Active banners with items & drop rates                             |
| POST   | `v1/gacha/pull`        | player | `{ banner: <event code> }` → `{ reward, cost, coins }` (atomic)    |
| GET    | `v1/me/history`        | player | Own pulls, paginated (`limit`, `offset`)                           |
| GET    | `v1/admin/events`      | admin  | Every event incl. inactive drafts                                  |
| POST   | `v1/admin/events`      | admin  | Create event + items (rates must total 100% when active)           |
| PUT    | `v1/admin/events/:id`  | admin  | Update event; items replaced                                       |
| DELETE | `v1/admin/events/:id`  | admin  | Delete event + items                                               |
| GET    | `v1/admin/history`     | admin  | Every user's pulls, paginated                                      |

## Project structure

```
src/
├── app/                  # App Router pages (/, /account, /auth/*, /dashboard/*)
├── components/           # Shared atoms/organisms + providers (session, query, auth bridge)
├── core/
│   ├── api/              # Typed API clients per domain (auth, events, gacha, history, profile)
│   ├── http/             # request() fetch wrapper, ApiResponse envelope, gatewayUrl()
│   └── route/            # Centralized ROUTES map
├── features/
│   ├── auth/             # Login / register / admin login pages (gacha-themed)
│   ├── dashboard/        # Admin dashboard home
│   ├── events/           # Admin event management
│   ├── gacha/            # The machine: Three.js canvas, HUD, account page
│   ├── history/          # Admin history page
│   └── settings/         # Admin profile settings
└── services/hooks/apis/  # TanStack Query hooks per domain
```

## Notes

- The Three.js scene is fully procedural — capsules, claw, moss, vines, trees
  and grass are generated at runtime; there are no 3D model files to load.
- Player coins/level/title are **backend-owned**; the client only displays them.
- Guests can view the machine and reward list, but pulling requires signing in.
