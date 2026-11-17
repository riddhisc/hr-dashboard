# Performance

Baseline metrics could not be measured before migration because the repository had no reproducible production build or running backend environment. The new shell uses Server Components by default, keeps charts in a client-only leaf, avoids loading the legacy MUI bundle, and uses CSS-only layout primitives for the main view.

Target after database and auth integration: Lighthouse 95+ for Performance, Accessibility, and Best Practices; LCP under 2 seconds; CLS under 0.05. Record a production Vercel run here after the first deploy.
