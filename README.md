# Peopleflow HR

Peopleflow is a modern HR workspace migrated from the original React/Vite ATS. The new runtime is Next.js App Router with strict TypeScript, Tailwind CSS, Recharts, Zustand UI state, Zod schemas, and Drizzle/Postgres scaffolding.

## Run locally

Requirements: Node LTS and pnpm.

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. The demo workspace is available without a database connection.

## Scripts

- `pnpm dev` — start the Next.js development server.
- `pnpm build` — create a production build.
- `pnpm typecheck` — run strict TypeScript validation.
- `pnpm lint` — run ESLint.
- `pnpm test` — run Vitest tests.
- `pnpm test:e2e` — run Playwright end-to-end tests.
- `pnpm format` — format source files with Prettier.

## Environment

Copy `.env.example` to `.env.local` and set `DATABASE_URL` for Neon Postgres and `AUTH_SECRET` for Auth.js. The current reviewable dashboard uses seeded demo data while the database/auth integration is being migrated.

## Routes

The App Router includes the overview dashboard, employees, departments, attendance, leave, payroll, recruitment, performance, reports, analytics, settings, and a login screen. Legacy ATS areas remain represented at `/jobs`, `/applicants`, and `/interviews` while their data services are migrated.

## Project structure

```text
src/app/          routes and layouts
src/components/   shell, UI primitives, dashboard widgets
src/features/     domain schemas, services, and actions
src/config/       navigation and role permissions
src/db/           Drizzle schema
src/lib/          env validation, data, and utilities
src/stores/       Zustand UI state
docs/             audit, architecture, decisions, performance
```

See [docs/AUDIT.md](docs/AUDIT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/DECISIONS.md](docs/DECISIONS.md) for migration context.

## Deploy to Vercel

```bash
pnpm dlx vercel login
pnpm dlx vercel --prod
```

Set `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, and `DATABASE_URL` in the Vercel project settings. The current demo works without `DATABASE_URL`; Neon persistence becomes active once that variable is configured.
