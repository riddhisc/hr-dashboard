# Changelog

## Unreleased (`cleanup`)

### Changed
- Navigation reduced from 15 items to 7: Overview, People, Time off, Hiring, Insights, Payroll, Settings.
- Old addresses redirect to the matching section and tab.
- Performance goals moved to the employee page; team-wide goal totals removed.
- CI now runs lint.
- `pnpm-workspace.yaml` lists the packages allowed to run build scripts.

### Removed
The old applicant tracking system is preserved in the tag `legacy-ats`.

- Unused packages: `@hookform/resolvers`, `@neondatabase/serverless`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-slot`, `@tanstack/react-query`, `@tanstack/react-table`, `@tanstack/react-virtual`, `class-variance-authority`, `cmdk`, `date-fns`, `drizzle-orm`, `jose`, `motion`, `next-auth`, `next-themes`, `react-hook-form`, `@testing-library/jest-dom`, `@testing-library/react`, `@vitejs/plugin-react`, `drizzle-kit`, `eslint-config-next`, `husky`, `jsdom`, `lint-staged`.
- Unused export `formatNumber`.
- Unused database scaffold (`src/db`, `drizzle.config.ts`, `src/lib/env.ts`).
- `backend/` and `public/` were removed earlier; they are in commit `7901178`.

#### Moved
- `src/app/(dashboard)/applicants/page.tsx` → `src/components/hiring/applicants-tab.tsx`
- `src/app/(dashboard)/interviews/page.tsx` → `src/components/hiring/interviews-tab.tsx`
- `src/app/(dashboard)/jobs/page.tsx` → `src/components/hiring/jobs-tab.tsx`
- `src/app/(dashboard)/recruitment/page.tsx` → `src/components/hiring/pipeline-tab.tsx`
- `src/app/(dashboard)/analytics/page.tsx` → `src/components/insights/analytics-tab.tsx`
- `src/app/(dashboard)/reports/page.tsx` → `src/components/insights/reports-tab.tsx`
- `src/app/(dashboard)/departments/page.tsx` → `src/components/people/departments-tab.tsx`
- `src/app/(dashboard)/employees/page.tsx` → `src/components/people/employees-tab.tsx`
- `src/app/(dashboard)/attendance/page.tsx` → `src/components/time-off/attendance-tab.tsx`
- `src/app/(dashboard)/leave/page.tsx` → `src/components/time-off/leave-tab.tsx`

#### Deleted files
- `.env.production`
- `drizzle.config.ts`
- `index.html`
- `jest.config.cjs`
- `jest.setup.cjs`
- `package-lock.json`
- `src/App.jsx`
- `src/__tests__/Dashboard.test.jsx`
- `src/__tests__/api.test.js`
- `src/app/(dashboard)/performance/page.tsx`
- `src/components/ApplicantCard.jsx`
- `src/components/BackendStatus.jsx`
- `src/components/HealthCheck.jsx`
- `src/components/InterviewCard.jsx`
- `src/components/JobCard.jsx`
- `src/components/JobForm.jsx`
- `src/db/index.ts`
- `src/db/schema.ts`
- `src/disableHealthCheck.js`
- `src/features/applicants/applicantsSlice.js`
- `src/features/auth/authSlice.js`
- `src/features/interviews/interviewsAPI.js`
- `src/features/interviews/interviewsSlice.js`
- `src/features/jobs/jobsSlice.js`
- `src/health-check.js`
- `src/index.css`
- `src/layouts/MainLayout.jsx`
- `src/lib/env.ts`
- `src/main.jsx`
- `src/models/InterviewQuestionBank.js`
- `src/models/InterviewerSchedule.js`
- `src/pages/AddApplicant.jsx`
- `src/pages/Analytics.jsx`
- `src/pages/ApplicantDetails.jsx`
- `src/pages/Applicants.jsx`
- `src/pages/CandidateComparison.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/InterviewDetails.jsx`
- `src/pages/InterviewQuestionBank.jsx`
- `src/pages/InterviewScheduler.jsx`
- `src/pages/InterviewerManagement.jsx`
- `src/pages/Interviews.jsx`
- `src/pages/JobDetails.jsx`
- `src/pages/JobPostings.jsx`
- `src/pages/Login.jsx`
- `src/pages/NotFound.jsx`
- `src/pages/ProfileEdit.jsx`
- `src/redux/slices/applicantsSlice.js`
- `src/redux/slices/authSlice.js`
- `src/redux/slices/interviewsSlice.js`
- `src/redux/store.js`
- `src/store/index.js`
- `src/utils/api.js`
- `src/utils/googleUserTestHelper.js`
- `src/utils/initializeGoogleUserData.js`
- `tailwind.config.js`
- `test-deployment.html`
- `tests/setup.ts`
- `vite.config.js`

## 1.0.0 - 2026-11-16

- Added Phase 0 audit and migration decision record.
- Added a typed Next.js App Router foundation with a responsive Peopleflow shell.
- Added overview KPIs, hiring and department charts, activity, upcoming events, and employee directory views.
- Added route coverage for employees, departments, attendance, leave, payroll, recruitment, performance, reports, analytics, settings, and legacy ATS areas.
- Added Drizzle schema scaffolding for employees and leave requests, plus environment validation.
