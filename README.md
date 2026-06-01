# Streetwear Store

Full-stack ecommerce MVP. Monorepo with two independent apps:

- **`/backend`** — Express + TypeScript REST API, Prisma ORM (PostgreSQL), JWT auth via httpOnly cookies. Layered `routes → controllers → services`. Runs on port **5000**.
- **`/frontend`** — Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, React Query. All API calls are client-side. Runs on port **3000**.

There is no root build orchestration and no shared types package — each app is built, run, and tested independently.

## Prerequisites

- Node.js 20+
- A local PostgreSQL instance (see `backend/.env.example` for the connection string)

## Backend

```bash
cd backend
cp .env.example .env        # set DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev      # apply schema to the database
npm run dev                 # http://localhost:5000
```

Health check: `GET http://localhost:5000/health` → `{ "status": "ok" }`

Scripts: `npm run dev` | `npm run build` | `npm run typecheck` | `npm test`

## Frontend

```bash
cd frontend
cp .env.example .env        # set NEXT_PUBLIC_API_URL
npm install
npm run dev                 # http://localhost:3000
```

Scripts: `npm run dev` | `npm run build` | `npm run typecheck`

## Environment variables

| App      | Variable              | Purpose                                   |
| -------- | --------------------- | ----------------------------------------- |
| backend  | `DATABASE_URL`        | PostgreSQL connection string (Prisma)     |
| backend  | `JWT_SECRET`          | Signs JWT auth cookies                    |
| backend  | `PORT`                | Server port (defaults to 5000)            |
| backend  | `FRONTEND_URL`        | Allowed CORS origin (defaults to :3000)   |
| frontend | `NEXT_PUBLIC_API_URL` | Backend base URL (defaults to :5000)      |
