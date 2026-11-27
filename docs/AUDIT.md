# Phase 0 Audit (historical)

> Historical record of the old Vite/Express system as it was on 2026-11-16. It does not describe the current app. The old front end is in the git tag `legacy-ats`; the backend is in commit `7901178`. For today see ARCHITECTURE.md.

Date: 2026-11-16
Repository: `riddhisc/hr-dashboard`

## Executive summary

The repository is an Applicant Tracking System (ATS), not a general HRIS. It is split into a Vite-powered React single-page application and a separate Express/Mongoose API. The UI has accumulated several parallel state and API paths: Redux Toolkit slices, a second `src/redux` tree, direct Axios calls, localStorage-backed demo/Google-user data, and a health-check interception shim. The backend uses MongoDB, JWT authentication, Multer uploads, and REST endpoints for users, jobs, applicants, and interviews.

The migration must preserve the existing ATS workflows while expanding the product toward the requested HR dashboard domains. Existing public URLs, data concepts, demo behavior, uploads, and role-aware flows are the must-keep baseline.

## Current stack and versions

### Frontend

- Framework: React 18.2.0, Vite 6.2.2.
- Language: JavaScript/JSX. There is no TypeScript configuration.
- Package/runtime: npm lockfile; README targets Node 14+; no Node version file; no pnpm configuration.
- Styling: Tailwind CSS 3.4.1 with a JavaScript config, PostCSS, and `@tailwindcss/forms`; substantial UI also uses MUI 6.4.7 and Emotion 11.14.0.
- Routing: `react-router-dom` 6.22.1 with `BrowserRouter` and a hand-written protected-route wrapper.
- State: Redux Toolkit 2.2.1 and React Redux 9.1.0. There are duplicated state trees under `src/features` and `src/redux`, plus a separate `src/store` entry point.
- Data/API: Axios 1.6.7, REST calls to `/api`, localStorage demo fallbacks, and hard-coded/mock data paths.
- Forms/validation: React Hook Form 7.50.1 with Yup 1.3.3 and ad hoc validation.
- Charts/documents/dates: Recharts 2.12.0, `react-pdf` 9.2.1, `date-fns` 4.1.0, Day.js 1.11.10.
- Auth/UI feedback: `@react-oauth/google` 0.12.1, JWT handled by the backend, `react-toastify` 11.0.5.
- Icons: `@heroicons/react` 2.2.0.
- Testing: Jest 29.7.0, jsdom, Testing Library 16.2.0, Babel Jest; no Playwright or Vitest.
- Build/deploy: Vite build; Vercel rewrites API calls to `hr-dashboard-backend.onrender.com` and includes an API health mock.

### Backend

- Runtime/framework: Node.js with Express 4.18.2, ES modules, `nodemon` 2.0.22.
- Database: MongoDB via Mongoose 7.0.3; local default `mongodb://localhost:27017/ats_db`.
- Auth/security: `jsonwebtoken` 9.0.0, `bcryptjs` 2.4.3, Google auth library 9.15.1, role middleware.
- REST/middleware: CORS 2.8.5, dotenv 16.0.3, morgan 1.10.0, express-async-handler 1.2.0.
- Uploads: Multer 1.4.5-lts.1 and a checked-in `backend/uploads` directory containing resume PDFs.
- Testing: Jest 29.7.0 and Supertest 7.1.0; backend tests mix CommonJS `require` with the ESM package configuration.
- Seed/admin scripts: `backend/seed.js`, `backend/src/utils/seedData.js`, `createAdminUser.js`, and `updateAdminPassword.js`.

## Existing pages and routes

Declared in `src/App.jsx`:

- `/` redirects to `/dashboard`.
- `/login` login page.
- `/dashboard` overview dashboard.
- `/jobs` job postings list/create flow.
- `/jobs/:jobId` job detail.
- `/applicants` applicants list.
- `/applicants/:applicantId` applicant detail.
- `/add-applicant` public/HR applicant form with resume upload.
- `/compare-candidates` candidate comparison.
- `/interviews` interview list.
- `/interviews/:interviewId` interview detail and feedback.
- `/interviewers` interviewer management.
- `/question-bank` interview question bank.
- `/analytics` analytics dashboard.
- `/profile-edit` profile editing.
- A catch-all not-found page.

The code also navigates to `/jobs/create`, `/interviews/new`, and `/scheduler`, but those routes are not declared. These are broken or incomplete navigation paths that must be reconciled during migration.

## Existing components, models, and utilities

### Layout and shared components

- `src/layouts/MainLayout.jsx`: authenticated shell and navigation.
- `ApplicantCard`, `InterviewCard`, `JobCard`, `JobForm`: reusable domain UI.
- `BackendStatus`, `HealthCheck`: backend/localStorage health indicators.
- `src/models/InterviewerSchedule.js`: scheduling/availability model logic.
- `src/models/InterviewQuestionBank.js`: question bank model/data.

### Feature/state modules

- Applicants: list/filter/pagination, create with resume, status changes, notes, delete, localStorage merge paths.
- Jobs: list/detail/create/update/delete, status filtering, localStorage demo/Google-user persistence.
- Interviews: list/detail/schedule/update/status/feedback/delete, filtering, interviewer assignment, localStorage fallback.
- Auth: login, registration, Google login, logout, profile fetch/update, JWT/localStorage persistence, demo mode initialization.
- Analytics: applicant/job counts, applicant sources, job/application aggregation, Recharts visualizations.

## Existing API surface

### Health and test endpoints

- `GET /api/health-check` returns `{ status: 'ok' }`.
- `GET /api/test` returns a basic API message.
- Vercel rewrites `/api/health-check` to `public/api-health-mock.json`.

### Users

- `POST /api/users/register`.
- `POST /api/users/login`.
- `POST /api/users/google`.
- `GET /api/users/profile` (protected).
- `PUT /api/users/profile` (protected).

### Jobs

- `GET /api/jobs`.
- `GET /api/jobs/:id`.
- `POST /api/jobs` (protected/admin).
- `PUT /api/jobs/:id` (protected/admin).
- `DELETE /api/jobs/:id` (protected/admin).

### Applicants

- `GET /api/applicants` with page/status/job/source/search query parameters (protected).
- `GET /api/applicants/:id` (protected).
- `GET /api/applicants/job/:jobId` (protected).
- `POST /api/applicants` with Multer resume upload (public).
- `PUT /api/applicants/:id/status` (protected).
- `PUT /api/applicants/:id/notes` (protected).
- `DELETE /api/applicants/:id` (protected/admin), including resume file deletion.

### Interviews

- `GET /api/interviews` (protected).
- `GET /api/interviews/:id` (protected).
- `GET /api/interviews/applicant/:applicantId` (protected).
- `POST /api/interviews` (protected).
- `PATCH /api/interviews/:id` (protected).
- `PUT /api/interviews/:id/status` (protected).
- `PUT /api/interviews/:id/feedback` (protected).
- `DELETE /api/interviews/:id` (protected/admin).

## Must-keep feature checklist

- Login, registration, JWT persistence, logout, protected navigation, and Google sign-in/demo behavior.
- Job posting CRUD, job details, job status/location/department/type/skills/salary/closing-date fields.
- Applicant creation with resume upload, applicant list search/filter/pagination, detail view, status changes, notes, and deletion.
- Candidate comparison workflow.
- Interview scheduling, interviewer assignment, availability helpers, list/detail views, status changes, feedback/recommendations, and deletion.
- Interviewer management and interview question bank.
- Analytics dashboard and existing charts.
- Profile editing.
- LocalStorage-backed demo and Google-user workflows when the backend is unavailable.
- Backend health endpoint, API proxy/deployment rewrites, and static resume serving.
- Seed data and admin setup scripts, updated to the new database/auth model.

## Performance and code-quality findings

### Architecture and state

- Two Redux slice locations (`src/features` and `src/redux`) and multiple store entry points create unclear ownership and duplicate logic.
- Server state, UI state, auth state, and demo persistence are mixed inside Redux slices and page components; there is no cache invalidation model.
- Pages contain large amounts of data fetching, transformation, validation, and presentation code. Examples include `Dashboard.jsx`, `Applicants.jsx`, `Interviews.jsx`, and `InterviewDetails.jsx`.
- LocalStorage is read and written directly throughout UI/state code, creating divergent data sources and browser-only behavior.
- `disableHealthCheck.js` monkey-patches Axios and suppresses network checks, which obscures real backend failures.

### Rendering and bundle concerns

- Vite ships a single SPA bundle; no route-level server rendering or streaming.
- Heavy modules such as Recharts and `react-pdf` are imported into the client application without an identified dynamic-import boundary.
- No virtualization is present for applicant/interview/job lists.
- Filtering and aggregation frequently happen client-side after broad fetches, rather than using server-side pagination/sorting/filtering consistently.
- Repeated console logging and debug paths add noise and can leak data in production.
- No evidence of image optimization, font optimization, bundle analysis, Lighthouse measurements, or performance budgets.

### Correctness and maintainability

- The project is JavaScript, so strict type safety is absent; there are no shared client/server schemas.
- Backend tests mix `require` with ESM modules and rely on a local MongoDB instance, making CI portability weak.
- Frontend and backend each have separate package manifests and lockfiles; the root scripts do not orchestrate the backend.
- README describes features/dependencies that do not fully match the implementation (for example ShadCN/UI and React Table are mentioned but not represented in the root dependency list).
- API error handling often falls back to mock/localStorage data, which can hide production failures.
- `cors()` is unrestricted, and environment validation is absent.
- Authorization is implemented at route middleware level but is not centralized as a reusable permission matrix.
- Several routes referenced by navigation are missing from the route table.
- Resume uploads are stored in the repository workspace; there is no storage abstraction or lifecycle policy.
- The backend includes checked-in generated resume files and test/deployment helpers that should be separated from source/runtime artifacts.
- No migration system, database indexes audit, request schema validation, rate limiting, audit log, or structured logging is present.

## Migration implications

The target architecture should be introduced as a new typed Next.js App Router application in this repository, with the existing REST endpoints and user-facing workflows mapped into feature modules. Data migration is not a literal MongoDB-to-PostgreSQL table copy because the current system has sparse/dual localStorage data; the first seed and compatibility layer should preserve the existing ATS entities, then add employee/department/leave/payroll/performance/reporting domains. Any intentional behavior change should be recorded in `docs/DECISIONS.md`.

