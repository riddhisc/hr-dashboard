# Peopleflow HR

Peopleflow is a modern HR workspace migrated from the original React/Vite ATS. The new runtime is Next.js App Router with strict TypeScript, Tailwind CSS, Recharts, a Zustand store, and Zod schemas.

## Run locally

Requirements: Node LTS and pnpm.

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

Open `http://localhost:3000` and create an account. No database is needed.

## Accounts and data

Accounts, sessions, and workspace records are stored in the browser (localStorage). Passwords are salted and hashed, but this is not server-side authentication: data does not sync between devices or users, and clearing site data deletes it. Add a database and server authentication before storing real employee information.

## Scripts

- `pnpm dev` — start the Next.js development server.
- `pnpm build` — create a production build.
- `pnpm typecheck` — run strict TypeScript validation.
- `pnpm lint` — run ESLint.
- `pnpm test` — run Vitest tests.
- `pnpm test:e2e` — run Playwright end-to-end tests.
- `pnpm format` — format source files with Prettier.

## Environment

Copy `.env.example` to `.env.local` and set `DATABASE_URL` for Neon Postgres and `AUTH_SECRET` for Auth.js. The app does not read these yet; they are reserved for the database/auth integration.

## Routes

`/login` and `/signup`, then `/dashboard`, `/employees` (with `/employees/new` and `/employees/[id]`), `/departments`, `/attendance`, `/leave`, `/payroll`, `/recruitment`, `/jobs`, `/applicants`, `/interviews`, `/performance`, `/reports`, `/analytics`, and `/settings`. Each has its own file under `src/app/`.

## Project structure

```text
src/app/          routes and layouts
src/components/   shell, UI primitives, dashboard widgets
src/features/     domain schemas, services, and actions
src/config/       navigation
src/db/           Drizzle schema
src/lib/          types, calculations, sample data, and utilities
src/stores/       Zustand store (accounts and workspace data)
docs/             audit, architecture, decisions, performance
```

See [docs/AUDIT.md](docs/AUDIT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/DECISIONS.md](docs/DECISIONS.md) for migration context.

## Deploy to Vercel

```bash
pnpm dlx vercel login
pnpm dlx vercel --prod
```

Set `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, and `DATABASE_URL` in the Vercel project settings. The app currently runs without any of them.
