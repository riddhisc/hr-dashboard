/** Decorative geometric artwork for the sign-in screen. */
export function AuthArt() {
  return <svg aria-hidden="true" viewBox="0 0 600 220" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
    <path d="M0 220V130a90 90 0 0 1 90 90Z" fill="#ffb4b4" />
    <rect x="90" y="130" width="90" height="90" fill="#1e9be0" />
    <path d="M180 220a90 90 0 0 1 180 0Z" fill="#6d5bd0" />
    <circle cx="405" cy="175" r="45" fill="#ffb4b4" />
    <path d="M450 220V100a120 120 0 0 1 120 120Z" fill="#2f2fa8" />
    <path d="M360 130V40a90 90 0 0 1 90 90Z" fill="#8b7bd8" />
    <rect x="510" y="40" width="90" height="90" rx="45" fill="#1e9be0" opacity=".85" />
    <circle cx="225" cy="90" r="14" fill="#fff" opacity=".35" />
    <circle cx="90" cy="60" r="38" fill="none" stroke="#fff" strokeWidth="10" opacity=".18" />
  </svg>;
}
