# ServiceLine — Restaurant Operations

A restaurant-operations dashboard: menu management, order tracking with an
enforced status workflow, a lightweight CRM, ordering settings, and a live
KPI overview. Built as a fullstack take-home with generated contracts as the
single source of truth end-to-end:

```
Drizzle schema -> drizzle-zod -> Hono/OpenAPI -> Orval -> generated frontend types/hooks
```

Nothing on the frontend hand-authors a type or a fetch call — every request
hook, response type, and request body type in `apps/dashboard` is generated
from the backend's live OpenAPI spec.

> The product is branded **ServiceLine**; the internal package namespace
> (`@odyssey/*`), the Cloudflare Worker name (`odyssey-backend`), and the
> Expo `slug`/`scheme` (`odyssey-dashboard`) intentionally kept their
> original names — renaming those is a real (and risky) technical change,
> not a branding one, so it was left out of this pass.

## Stack

- **Backend**: [Hono](https://hono.dev) + [`@hono/zod-openapi`](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) on Cloudflare Workers
- **Database**: [Neon](https://neon.tech) Postgres, via [Drizzle ORM](https://orm.drizzle.team) (`neon-http` driver) + [drizzle-zod](https://orm.drizzle.team/docs/zod)
- **Contract generation**: the backend exports its OpenAPI spec; [Orval](https://orval.dev) generates a typed React Query client from it
- **Frontend**: [Expo Router](https://docs.expo.dev/router/introduction/) (React Native + React Native Web) + [TanStack Query](https://tanstack.com/query/latest)
- **Monorepo**: pnpm workspaces + [Turborepo](https://turbo.build)

## Repo structure

```
apps/dashboard/       Expo Router app (native + web) — 6 routes: home, orders, menu, crm, settings, ui-library
services/backend/     Hono API on Cloudflare Workers, Drizzle schema, migrations, seed script
packages/shared/      Framework-free logic used by both apps: order state machine, money/date formatting
packages/types/       Ergonomic re-exports of the Orval-generated contract types
packages/api-client/  Orval config + generated React Query client (committed, regenerated via `pnpm gen:contract`)
packages/ui/          Design tokens + RN/Web-safe UI primitives
```

## Getting started

Prerequisites: **Git**, **Node 20+**, and a free [Neon](https://neon.tech) account.

You don't need pnpm pre-installed. This repo pins its exact pnpm version in
`package.json` (`packageManager`), so running `corepack enable` once (Corepack
ships with Node itself) makes the very first `pnpm install` below
auto-download the right pnpm version — no separate `npm install -g pnpm`
needed. No Cloudflare account is needed either; `wrangler dev` runs entirely
locally.

### 1. Create a Neon project

Create a new Neon project and copy its Postgres connection string (the
pooled connection string works fine — the app connects over HTTP via
`@neondatabase/serverless`, not a raw TCP connection).

### 2. Configure environment variables

```bash
cp .env.example .env
```

Paste your Neon connection string into `.env` as `DATABASE_URL`. This root
`.env` is the source of truth for every Node script (migrate, seed,
contract generation).

`wrangler dev` (the Workers local dev server) does **not** read the root
`.env` — it only reads `services/backend/.dev.vars`. Derive it from the
same value:

```bash
cp services/backend/.dev.vars.example services/backend/.dev.vars
```

...and paste the same `DATABASE_URL` into that file. (`.dev.vars` is
gitignored; this split is a real Wrangler quirk, not an oversight.)

### 3. Install dependencies

```bash
pnpm install
```

### 4. Run migrations and seed the database

```bash
pnpm db:migrate
pnpm db:seed
```

The seed script creates 3 menu categories, 8 menu items (one intentionally
marked unavailable), 4 customers, and 8 orders covering **every** order
status, so the state machine and KPIs have real data to exercise
immediately.

⚠️ `pnpm db:seed` is **not** safe to run twice against the same database —
it always inserts, and `customers.email` is unique, so a second run fails
with a Postgres constraint error. If you need to reset, drop and re-migrate
instead of re-seeding.

### 5. Start the backend

```bash
pnpm dev:backend
```

Runs on `http://localhost:8787`. Try `curl http://localhost:8787/health` or
`http://localhost:8787/openapi.json` to confirm it's up.

### 6. Start the dashboard

```bash
pnpm dev:dashboard
```

This opens the Expo CLI — press `w` for web (or run
`pnpm --filter @odyssey/dashboard dev:web` directly to skip straight to a
browser). Native (`i`/`a`) works too if you have a simulator set up, though
this project was primarily built and verified against the web target.

Open **http://localhost:8081**.

No Docker step anywhere in this flow, and no manually-written types —
`pnpm install && pnpm dev:backend && pnpm dev:dashboard` is the whole path
from a fresh clone to a running app (once `.env`/`.dev.vars` are filled in).

## Available scripts

Run from the repo root:

| Command | What it does |
|---|---|
| `pnpm dev:backend` | Start the Workers dev server (`wrangler dev`) |
| `pnpm dev:dashboard` | Start the Expo dev server |
| `pnpm db:migrate` | Apply Drizzle migrations to `DATABASE_URL` |
| `pnpm db:seed` | Seed menu/customer/order data |
| `pnpm gen:contract` | Regenerate `openapi.json` from the Hono routes, then regenerate the Orval client from it |
| `pnpm typecheck` | `tsc --noEmit` across every package |
| `pnpm lint` | Lint every package |
| `pnpm test` | Run tests across every package (Vitest everywhere) |

`pnpm gen:contract` output (`packages/api-client/src/generated/`) is
committed to the repo, so a reviewer never has to run codegen just to get
`pnpm install && pnpm dev:dashboard` working — it's only needed again if
you change the backend's routes/schemas.

## Order status state machine

```
pending    -> confirmed | cancelled
confirmed  -> preparing | cancelled
preparing  -> ready     | cancelled
ready      -> completed
completed  -> (terminal)
cancelled  -> (terminal)
```

This table lives in exactly one place — `packages/shared/src/orderStateMachine.ts`
— and is never reimplemented. The backend's `PATCH /orders/{id}/status`
route imports it to reject illegal transitions server-side (`400`), and
every order API response includes a server-computed `allowedTransitions`
field; the frontend's status-change buttons just render whatever the
server says is legal.

## KPI / revenue definitions

These are genuinely ambiguous without a spec, so here's exactly what
`GET /kpis` computes:

- **Orders today**: count of all orders created today (any status)
- **Revenue today**: sum of `totalCents` for today's orders, **excluding
  `cancelled`** orders — i.e. "expected" revenue, not "completed-only"
  revenue
- **Pending orders**: current count of orders in `pending` status —
  **not** time-scoped, this is a live queue depth
- **Popular items**: top 5 menu items by quantity sold, trailing 30 days

Customer "total spent" on the CRM page applies the same convention as
revenue (excludes cancelled orders).

## Money and tax handling

Money is stored as **integer cents** throughout — never floats. Tax is
computed and snapshotted at order-creation time from
`ordering_settings.taxRatePercent` into `orders.subtotalCents` /
`taxCents` / `totalCents`, so a historical order's total never drifts if
the tax rate or a menu item's price changes later.

## Menu item deletion

Menu items are never hard-deleted — only soft-deleted via
`isAvailable: false` (toggled instantly from the Menu page). This
preserves referential integrity for historical `order_items` that
reference a since-discontinued item.

## Scope decisions worth knowing about

- **Auth**: none. Single-tenant admin dashboard, explicitly out of scope.
- **Categories/customers**: list/create/update only, no delete endpoints —
  avoids FK-integrity edge cases for a take-home-sized surface.
- **Order creation**: full flow is implemented (new-or-existing customer,
  per-item quantity picker grouped by category, live subtotal/tax/total
  preview) directly from the Orders page.
- **Atomicity**: `drizzle-orm`'s `neon-http` driver has no imperative
  transaction support (`db.transaction()` throws by design). Order
  creation uses `db.batch()` instead, with client-generated UUIDs so the
  customer/order/order-items inserts succeed or fail together.
- **Automated tests**: Vitest everywhere, no Jest — 129 tests across the
  three packages that have them.

  - `services/backend` (41 tests, 5 files) runs every route group
    end-to-end through the actual Hono app against an ephemeral PGlite
    Postgres (migrated with the same SQL the real database runs), not a
    mocked db layer: orders (validation, unavailable/unknown-item and
    unknown-customer rejection, server-computed totals, every leg of the
    status state machine including terminal-state and unknown-id cases),
    menu categories/items (CRUD, sort order, the soft-delete-via-
    `isAvailable` path), customers (CRUD, the computed `orderCount`/
    `totalSpentCents` stats and that cancelled orders are excluded from
    spend), settings (get/update, the uninitialized-row 500 case), and
    KPIs (the today-scoped revenue/order-count window excluding
    cancelled orders, the not-time-scoped pending count, and the
    trailing-30-day popular-items ranking).
  - `packages/shared` (54 tests, 3 files) exhaustively tests the order
    state machine's full transition matrix, money formatting, and date
    formatting (`formatRelativeTime`'s minute/hour/day thresholds under
    fake timers).
  - `apps/dashboard` (34 tests, 8 files) tests the extracted order-total
    preview logic (`lib/orderPreview.ts`) and the interactive
    `@odyssey/ui` primitives that have real logic worth verifying —
    `Button` (disabled/loading), `StatusBadge`, `Modal` (backdrop vs.
    content-click dismissal), `Select` (open/pick/disabled), `Switch`,
    `TextField` (error vs. helper text, typing), and `ToastProvider`
    (show + real-timer auto-dismiss) — via `@testing-library/react`
    against `react-native-web`, the same substitution Expo's web bundler
    makes at build time.

  Not exhaustive: the dashboard **pages** themselves (Home, Orders, Menu,
  CRM, Settings) have no integration-level render tests, and a few
  presentational `@odyssey/ui` components (Card, Badge, Divider, Spinner,
  Skeleton, List/ListRow, TopNav/NavLink) have none either — they're pure
  layout with no branching logic to regress. Every route and every stateful
  primitive does.

  One quirk the backend test suite surfaces and documents rather than
  papering over: `POST /menu/categories`, `POST /menu/items`, and
  `POST /customers` validate against a schema built from the Drizzle
  *select* schema, so nullable/defaulted columns (`sortOrder`, `email`,
  `phone`, `description`, `imageUrl`, ...) come through as *required-but-
  nullable* rather than optional — a caller must send `null`/the default
  explicitly instead of omitting the field. The dashboard's own create
  flows already do this correctly (see `menu.tsx`/`crm.tsx`); order
  creation's inline "new customer" shape sidesteps it entirely with its
  own smaller, genuinely-optional schema. Worth tightening if this went
  past a take-home.
- **Page-level information architecture is intentionally basic.** The
  ServiceLine visual redesign was scoped to the app shell, design tokens,
  and shared components — not a rewrite of each page's structure. Orders,
  Menu, CRM, and Settings still don't have pagination, multi-column
  sorting, or drill-down detail views; they're the same flows as before,
  just rendered through the new primitives.
- **Icons are plain glyph characters** (`#`, `$`, `!`, `◆`), not a real
  icon set — a deliberate zero-new-dependency choice for `IconContainer`.
  It reads correctly but is visibly less polished than a proper icon
  library would be; swapping one in wouldn't touch any other token or
  component.
