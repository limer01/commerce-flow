## Parent PRD
issues/prd.md

## What to build
Deliver end-to-end customer authentication: database schema, API, and frontend. A user should be able to register, log in, see the nav reflect their session, and log out. This slice also establishes the auth infrastructure (JWT middleware, role guard) that all protected routes in later slices depend on.

**Schema:** Add the `User` model (`id`, `name`, `email`, `passwordHash`, `role`, `createdAt`, `updatedAt`) and run the migration.

**API:** Implement `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`. JWT is stored as an httpOnly cookie with a 7-day expiry. Passwords are hashed with bcrypt. Auth middleware (`authenticate`) and admin guard middleware (`requireAdmin`) are implemented and ready for use by later slices — but not yet applied to any product/cart/order routes.

**Frontend:** `/login` and `/register` pages with forms and error display. A `useAuth()` hook wrapping `GET /auth/me` via React Query providing `user`, `isLoading`, `isAuthenticated`. A `useRequireAuth()` hook that redirects to `/login` if unauthenticated. An `app/admin/layout.tsx` that redirects non-admins away from all `/admin/*` routes. The nav bar renders `Login` and `Register` links when logged out, and `Orders`, `Logout` (plus `Admin` if role is ADMIN) when logged in.

**Seed:** The seed script creates the admin user (`admin@store.com` / `password123`, role: ADMIN).

## Acceptance criteria
- [x] `POST /auth/register` creates a user with hashed password and returns a JWT cookie — curl-verified (201 + Set-Cookie)
- [x] `POST /auth/login` sets an httpOnly JWT cookie (7-day expiry) on success — curl-verified (HttpOnly, Max-Age=604800, SameSite=Lax)
- [x] `POST /auth/login` returns 401 with `{ "error": "..." }` on wrong credentials — curl-verified
- [x] `POST /auth/logout` clears the JWT cookie — curl-verified (Set-Cookie expires 1970)
- [x] `GET /auth/me` returns the current user or 401 if not authenticated — curl-verified both paths
- [x] `/register` page submits the form and redirects to `/` on success — implemented (router.push on success); page renders + prod build pass (browser flow not driven headlessly)
- [x] `/login` page submits the form and redirects to `/` on success — implemented; page renders + prod build pass (browser flow not driven headlessly)
- [x] Form validation errors are displayed inline — implemented (role="alert"; server `{error}` surfaced + client password-length pre-check)
- [x] Nav shows `Login` / `Register` when logged out — implemented in NavBar (renders after client auth state resolves)
- [x] Nav shows `Orders`, `Logout`, and `Admin` (admin only) when logged in — implemented (Admin gated on role === ADMIN)
- [x] `useRequireAuth()` redirects unauthenticated users to `/login` — implemented (hook ready for /cart,/checkout,/orders in later slices)
- [x] `app/admin/layout.tsx` redirects non-admin users away from `/admin/*` — implemented (unauth→/login, non-admin→/; placeholder /admin page added so guard is reachable)
- [x] `npx prisma db seed` creates the admin user — verified: `npm run db:seed` created admin@store.com (id 1, role ADMIN); idempotent via upsert
- [x] All auth errors return `{ "error": "message" }` shape — curl-verified across 400/401/409; central errorHandler enforces shape

## Verification notes (2026-06-01)
- Backend: `npm run typecheck` clean; `npm test` 8/8 pass (password hashing, JWT round-trip + existing health/CORS). All endpoints exercised live via curl against PostgreSQL — see commit body.
- Frontend: `npm run typecheck` clean; `npm run build` compiles all 7 routes. Auth-aware nav + form-submit flows are implemented and the pages render, but were not driven through a real browser this session (no headless browser available). Recommended next step: a manual click-through (register → nav updates → logout → login) when convenient.
- DB-backed integration tests for the auth *service* (login rejection, getMe) are deferred to issue 008, which owns the `.env.test` test-database infrastructure. Helper-level unit tests (no DB) are included here.

## Blocked by
Blocked by issues/001-monorepo-scaffold.md

## User stories addressed
- User story 8 (register)
- User story 9 (login)
- User story 10 (redirect to login on unauthenticated cart add — guard is set up here)
- User story 11 (logout)
- User story 12 (auth-aware nav)
- User story 13 (7-day session persistence)
- User story 36 (admin login)
- User story 37 (Admin nav link)
- User story 38 (non-admins blocked from admin pages)
- User story 39 (unauthenticated users redirected from admin pages)
