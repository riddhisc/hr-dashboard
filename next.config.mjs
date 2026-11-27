// Old page addresses, kept so bookmarks still work.
const moved = {
  '/employees': '/people?tab=employees', '/departments': '/people?tab=departments', '/performance': '/people',
  '/leave': '/time-off?tab=leave', '/attendance': '/time-off?tab=attendance',
  '/recruitment': '/hiring?tab=pipeline', '/jobs': '/hiring?tab=jobs', '/applicants': '/hiring?tab=applicants', '/interviews': '/hiring?tab=interviews',
  '/analytics': '/insights?tab=analytics', '/reports': '/insights?tab=reports',
};
const nextConfig = { async redirects() { return Object.entries(moved).map(([source, destination]) => ({ source, destination, permanent: false })); }, pageExtensions: ['ts', 'tsx'], images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] } };
export default nextConfig;
