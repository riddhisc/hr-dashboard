# Decisions

- The existing ATS remains represented by `jobs`, `applicants`, and `interviews` routes while the product expands into the requested HRIS domains.
- The initial migration uses realistic in-memory demo data so the UI is reviewable without a Neon connection. Database tables and environment validation are scaffolded for the next integration step.
- The old Vite/Express source is retained temporarily during migration to preserve a readable compatibility reference; the Next.js app is the new root runtime.
