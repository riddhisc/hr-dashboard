# Decisions

## Current
- Data stays in the browser until a database and server authentication are added.
- The session ends with the browser tab, so the app opens on sign-in.
- Related pages are grouped into tabs on one address per section; the tab is in the URL so it can be bookmarked.
- Old addresses use temporary redirects, so they can still be changed.
- Performance goals live on the employee page. The team-wide goal totals from the old Performance page were dropped.
- The Zod schemas in `src/features` are only used by tests today. They are kept for server-side validation.
- The unused Drizzle scaffold was removed; it covered two tables and no page read it. A full schema will replace it.

## History
- Migrated from the Vite/Express applicant tracking system to Next.js (see AUDIT.md).
- Replaced a built-in demo identity and fixed figures with browser accounts and per-account workspaces.
