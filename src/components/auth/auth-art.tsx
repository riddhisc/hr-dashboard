/** Decorative geometric artwork for the sign-in screen. The motion is defined in globals.css. */
export function AuthArt() {
  const delay = (seconds: number) => ({ animationDelay: `-${seconds}s` });
  return <svg aria-hidden="true" viewBox="0 0 600 220" preserveAspectRatio="xMidYMax slice" className="art h-full w-full">
    <path className="art-grow" d="M0 220V130a90 90 0 0 1 90 90Z" fill="#ffb4b4" />
    <rect className="art-grow" style={delay(1.2)} x="90" y="130" width="90" height="90" fill="#1e9be0" />
    <path className="art-grow" style={delay(2.4)} d="M180 220a90 90 0 0 1 180 0Z" fill="#6d5bd0" />
    <path className="art-grow" style={delay(3.6)} d="M450 220V100a120 120 0 0 1 120 120Z" fill="#2f2fa8" />
    <circle className="art-float" style={delay(1)} cx="405" cy="175" r="45" fill="#ffb4b4" />
    <path className="art-turn" d="M370 142V92a50 50 0 0 1 50 50Z" fill="#8b7bd8" />
    <circle className="art-float" style={delay(3)} cx="545" cy="125" r="30" fill="#1e9be0" opacity=".85" />
    <circle className="art-float" style={delay(4.5)} cx="225" cy="108" r="13" fill="#fff" opacity=".35" />
    <g className="art-turn" style={delay(2)}><circle cx="95" cy="122" r="26" fill="none" stroke="#fff" strokeWidth="8" strokeDasharray="120 44" strokeLinecap="round" opacity=".28" /></g>
  </svg>;
}
