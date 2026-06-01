## Parent PRD
issues/prd.md

## What to build
Deliver end-to-end customer authentication: database schema, API, and frontend. A user should be able to register, log in, see the nav reflect their session, and log out. This slice also establishes the auth infrastructure (JWT middleware, role guard) that all protected routes in later slices depend on.

**Schema:** Add the `User` model (`id`, `name`, `email`, `passwordHash`, `role`, `createdAt`, `updatedAt`) and run the migration.

**API:** Implement `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`. JWT is stored as an httpOnly cookie with a 7-day expiry. Passwords are hashed with bcrypt. Auth middleware (`authenticate`) and admin guard middleware (`requireAdmin`) are implemented and ready for use by later slices — but not yet applied to any product/cart/order routes.

**Frontend:** `/login` and `/register` pages with forms and error display. A `useAuth()` hook wrapping `GET /auth/me` via React Query providing `user`, `isLoading`, `isAuthenticated`. A `useRequireAuth()` hook that redirects to `/login` if unauthenticated. An `app/admin/layout.tsx` that redirects non-admins away from all `/admin/*` routes. The nav bar renders `Login` and `Register` links when logged out, and `Orders`, `Logout` (plus `Admin` if role is ADMIN) when logged in.

**Seed:** The seed script creates the admin user (`admin@store.com` / `password123`, role: ADMIN).

## Acceptance criteria
- [ ] `POST /auth/register` creates a user with hashed password and returns a JWT cookie
- [ ] `POST /auth/login` sets an httpOnly JWT cookie (7-day expiry) on success
- [ ] `POST /auth/login` returns 401 with `{ "error": "..." }` on wrong credentials
- [ ] `POST /auth/logout` clears the JWT cookie
- [ ] `GET /auth/me` returns the current user or 401 if not authenticated
- [ ] `/register` page submits the form and redirects to `/` on success
- [ ] `/login` page submits the form and redirects to `/` on success
- [ ] Form validation errors are displayed inline
- [ ] Nav shows `Login` / `Register` when logged out
- [ ] Nav shows `Orders`, `Logout`, and `Admin` (admin only) when logged in
- [ ] `useRequireAuth()` redirects unauthenticated users to `/login`
- [ ] `app/admin/layout.tsx` redirects non-admin users away from `/admin/*`
- [ ] `npx prisma db seed` creates the admin user
- [ ] All auth errors return `{ "error": "message" }` shape

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
