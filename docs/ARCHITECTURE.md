# Architecture

Peopleflow is organized around a thin App Router page layer and domain features. Server Components read through feature services; client components own only interaction state and call TanStack Query hooks or Server Actions. Drizzle is the only database boundary.

```text
App Router pages
      ↓
feature UI → TanStack Query / Server Actions → domain service → Drizzle → Neon Postgres
      ↓                         ↓
 Zustand (UI-only)        Zod shared schemas
```

The shell is shared by the dashboard route group. REST reads live under `src/app/api`; mutations are Server Actions. Permissions are intended to be centralized in `src/config/permissions.ts` as domains are migrated.
