# Peopleflow HR

An HR workspace for people records, time off, hiring, payroll, and reports. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Zustand, and Recharts.

## Current limits

Accounts and records are stored **in the browser** (`localStorage`); the signed-in session lasts for the browser tab. Passwords are salted and hashed with PBKDF2, but this is not server-side authentication. There is no database, no roles, and no syncing between devices, and clearing site data deletes everything. Do not store real employee information yet.

## Run locally

Requirements: Node 22 and pnpm 10.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` and create an account. No environment variables are needed.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | Browser test (Playwright; run `pnpm exec playwright install` once) |
| `pnpm build` | Production build |
| `pnpm format` | Prettier |

CI runs typecheck, lint, test, and build on every push.

## Pages

| Section | Address | Tabs (`?tab=`) |
| --- | --- | --- |
| Overview | `/dashboard` | |
| People | `/people` | `employees`, `departments` |
| Time off | `/time-off` | `leave`, `attendance` |
| Hiring | `/hiring` | `pipeline`, `jobs`, `applicants`, `interviews` |
| Insights | `/insights` | `analytics`, `reports` |
| Payroll | `/payroll` | |
| Settings | `/settings` | |

Sign-in is at `/login` and `/signup`. Employee records are at `/employees/new` and `/employees/[id]`, where performance goals also live. Older addresses such as `/jobs` or `/attendance` redirect to the matching tab (`next.config.mjs`).

## Layout

```text
src/app/          routes and layouts
src/components/   one folder per section, plus layout and UI parts
src/config/       navigation and tabs
src/features/     Zod schemas (used by tests, ready for server validation)
src/lib/          types, calculations, validation, sample data
src/stores/       accounts and workspace data
tests/            unit tests and one browser test
```

## The old applicant tracking system

The Vite/Redux front end was removed. It is preserved in the git tag `legacy-ats` (`git checkout legacy-ats`). Its Express backend had been removed one step earlier and is in commit `7901178`.

## Deploy

Vercel builds `master` using `vercel.json`.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DECISIONS.md](docs/DECISIONS.md), and [CHANGELOG.md](CHANGELOG.md).
