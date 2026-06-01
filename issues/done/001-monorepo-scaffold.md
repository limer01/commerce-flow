## Parent PRD
issues/prd.md

## What to build
Set up the full monorepo structure so both the frontend and backend applications can boot locally. This slice delivers no user-facing features — it exists solely so every subsequent slice has a working foundation to build on.

The backend should be a running Express + TypeScript server with a single health check endpoint (`GET /health`). Prisma should be connected to a local PostgreSQL database. CORS should be configured to allow requests from `http://localhost:3000` with credentials.

The frontend should be a running Next.js (App Router) + TypeScript application with Tailwind CSS, shadcn/ui, and React Query configured. It should render a blank page at `/`. The shared axios instance reads its base URL from `NEXT_PUBLIC_API_URL` (defaulting to `http://localhost:5000`) — the backend URL must never be hardcoded.

Environment variables should be wired up via `.env` files in both `/frontend` and `/backend`. The backend `.env` must include a single `DATABASE_URL` (with a `.env.test` variant added later in issues/008). The frontend `.env` must include `NEXT_PUBLIC_API_URL`.

## Acceptance criteria
- [ ] `/backend` runs on port 5000 (`npm run dev`)
- [ ] `/frontend` runs on port 3000 (`npm run dev`)
- [ ] `GET http://localhost:5000/health` returns `{ "status": "ok" }`
- [ ] Prisma is connected to PostgreSQL and `npx prisma migrate dev` runs without error
- [ ] CORS is configured for `http://localhost:3000` with `credentials: true`
- [ ] Tailwind CSS applies styles on the frontend
- [ ] shadcn/ui is installed and a component can be imported
- [ ] React Query `QueryClientProvider` wraps the app
- [ ] The axios instance reads `baseURL` from `NEXT_PUBLIC_API_URL` (not hardcoded) with `withCredentials: true`
- [ ] TypeScript compiles without errors in both apps
- [ ] `.env.example` files exist in both `/frontend` and `/backend` documenting required variables (`DATABASE_URL`, `NEXT_PUBLIC_API_URL`, JWT secret)

## Blocked by
None — can start immediately.

## User stories addressed
None — foundational infrastructure only.

## Progress notes

### 2026-06-01 — scaffold written, runtime verification still pending
All scaffold files for both apps are in place and statically complete:

**Backend (`/backend`)** — Express + TS, `GET /health` → `{ status: "ok" }`, CORS for
`http://localhost:3000` with `credentials: true` (origin overridable via `FRONTEND_URL`),
Prisma datasource/generator wired to `DATABASE_URL` (no models yet — added in 002+),
shared Prisma client singleton, `.env` + `.env.example` (`DATABASE_URL`, `JWT_SECRET`,
`PORT`, `FRONTEND_URL`). `app.ts`/`index.ts` split so the app is importable in tests.
Jest + ts-jest + supertest test for `/health` and CORS headers in `src/app.test.ts`.
Scripts: `dev`, `build`, `start`, `typecheck`, `test`, `migrate`, `postinstall` (prisma generate).

**Frontend (`/frontend`)** — Next.js 14 App Router + TS, Tailwind v3 (+ shadcn CSS vars
and `tailwindcss-animate`), shadcn/ui `Button` importable from `@/components/ui/button`,
React Query `QueryClientProvider` in `app/providers.tsx` wrapping the app via `app/layout.tsx`,
blank `/` page, shared axios instance in `lib/axios.ts` reading `NEXT_PUBLIC_API_URL`
(default `http://localhost:5000`) with `withCredentials: true`. `.env` + `.env.example`.
Scripts: `dev` (port 3000), `build`, `typecheck`.

**BLOCKER — could not execute runtime checks in this environment.** `npm`, `npx`, and
`docker` are not permitted by the harness here (only `node` and `git` run), and no local
PostgreSQL is on PATH. The following acceptance criteria are therefore implemented but
NOT yet verified by execution — the next iteration should run them:

- [x] `npm install` in both apps (runs `prisma generate` via backend postinstall) — verified 2026-06-01, both exit 0
- [x] `cd backend && npm run typecheck && npm test` (health + CORS test) — verified: typecheck clean, 2/2 tests pass
- [x] `cd frontend && npm run typecheck` — verified clean
- [x] start a local Postgres, then `cd backend && npx prisma migrate dev` — verified 2026-06-01: PostgreSQL 16 (native Windows install, service postgresql-x64-16) on :5432, db `commerce_flow`; Prisma connected, "Already in sync" (empty schema, no migration files yet)
- [x] `cd backend && npm run dev` boots on :5000; `cd frontend && npm run dev` boots on :3000 — verified 2026-06-01: backend GET /health → 200 {"status":"ok"} with CORS headers (Allow-Origin http://localhost:3000, Allow-Credentials true); frontend / → 200. All acceptance criteria met.

Dep versions in both `package.json` files are pinned to known-good late-2024 releases
(Next 14.2, React 18.3, React Query 5, Prisma 5.22, Tailwind 3.4). If any fail to resolve,
adjust the version and re-run install.
