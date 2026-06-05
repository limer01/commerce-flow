# Deployment

This is a two-service app: a Next.js frontend (`/frontend`) and an Express +
Prisma backend (`/backend`) talking to PostgreSQL. They are deployed as
**separate services**, and the frontend reaches the backend via client-side API
calls that carry an httpOnly auth cookie.

Recommended hosting (cheap, no idle cold-starts — good for a QA target):

| Piece                | Host                          |
| -------------------- | ----------------------------- |
| Frontend (`/frontend`) | Vercel                      |
| Backend (`/backend`)   | Railway (web service)       |
| PostgreSQL             | Railway managed Postgres (or Neon) |

> Render's free tier spins down on idle (30–60s cold start), which causes flaky
> timeouts in automated test runs. Prefer a host that stays warm.

---

## The cross-site cookie rule (read this first)

Auth is a JWT in an httpOnly cookie. The browser only attaches that cookie to
the cross-origin API calls React Query makes **if the cookie is `SameSite`
-correct for your domain layout**:

- **Frontend & backend on different sites** (e.g. `app.vercel.app` +
  `api.up.railway.app`) → set **`COOKIE_CROSS_SITE=true`** on the backend. This
  makes the cookie `SameSite=None; Secure` (required for cross-site XHR). This is
  the default expectation for the recommended hosting above.
- **Frontend & backend share a registrable domain** (e.g. `app.example.com` +
  `api.example.com`) → leave `COOKIE_CROSS_SITE` unset; `SameSite=Lax` works.

If login appears to succeed but every following request is treated as logged-out,
this setting is wrong.

---

## Backend (`/backend`)

**Environment variables**

| Variable            | Value                                                            |
| ------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`      | Postgres connection string (from your DB host)                  |
| `JWT_SECRET`        | A strong random string (NOT the dev value)                      |
| `FRONTEND_URL`      | Exact frontend origin, no trailing slash (CORS allowlist)       |
| `COOKIE_CROSS_SITE` | `true` if frontend/backend are on different sites (see above)   |
| `NODE_ENV`          | `production`                                                     |
| `PORT`              | Usually injected by the host; the app reads it (defaults 5000)  |

**Build & start**

```
npm install          # postinstall runs `prisma generate`
npm run build        # tsc -> dist/
npm start            # node dist/index.js
```

**Release step (every deploy):** apply migrations against the prod DB:

```
npx prisma migrate deploy
```

**First deploy only:** seed the catalogue + admin user, then change the admin
password (the seeded `admin@store.com` / `password123` is dev-only):

```
npm run db:seed
```

---

## Frontend (`/frontend`)

**Environment variables**

| Variable              | Value                                                        |
| --------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | The deployed backend origin, e.g. `https://api.up.railway.app` |

> `NEXT_PUBLIC_*` vars are inlined at **build time**, so this must be set in the
> build environment, not just at runtime. Changing it requires a rebuild.

**Build & start**

```
npm install
npm run build
npm start            # or let Vercel handle build/start automatically
```

On Vercel, set the project root to `frontend/` and it auto-detects Next.js.

---

## Deploy order (avoids a chicken-and-egg with URLs)

1. Provision PostgreSQL; copy its `DATABASE_URL`.
2. Deploy the backend with `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`,
   and `COOKIE_CROSS_SITE` as appropriate. Note its URL.
3. Run `prisma migrate deploy`, then `npm run db:seed` once.
4. Deploy the frontend with `NEXT_PUBLIC_API_URL` = the backend URL. Note its URL.
5. Set the backend's `FRONTEND_URL` = the frontend URL and redeploy/restart so
   CORS allows it.
6. Smoke test: register → log in → add to cart → checkout.

---

## Notes for the QA framework (later)

- Point your test suite's base URL at the deployed frontend via its own env var,
  mirroring how the app reads `NEXT_PUBLIC_API_URL`.
- Use a **separate database** for test runs vs. the demo instance so automated
  tests don't mutate the data you're showcasing.
- The seed script is idempotent; for a known starting state between runs,
  re-seed or reset the test database (`prisma migrate reset --force` against the
  test DB only).
