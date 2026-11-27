# Architecture

## Runtime
A Next.js App Router application with no backend of its own. The only route handler is `/api/health`.

## Rendering
`src/app/(dashboard)/layout.tsx` is a client guard: it waits for the browser, redirects to `/login` without a session, and wraps pages in the app shell. Each section page is a server component that reads `?tab=` (`src/config/tabs.ts`) and renders one client tab component.

## Data
`src/stores/app.ts` is a Zustand store. Accounts and one workspace per account persist to `localStorage` under `peopleflow`. The session id is kept in `sessionStorage`. Components read with `useWorkspace()` and write with `update()`. Calculations are pure functions in `src/lib/stats.ts`.

## Security
Authentication runs entirely in the browser, so it separates accounts on one device but protects nothing from someone with access to that browser. Anyone using the browser can read stored salaries. Server authentication, roles, and a database are required before real data is stored.

## Not built yet
Database and migrations, server authentication and roles, candidate comparison, interviewer availability, a question bank, CSV import, sorting and pagination, and dark mode.
