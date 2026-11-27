/**
 * The sign-in artwork as a five-second chain reaction, in SVG units (600 x 220, floor at y = 220).
 * A ball rolls down a slope and pushes a block, the block tips a domino, and the domino sends a
 * second ball up the opposite slope, where it slows, rolls back, and comes to rest.
 */
export const SCENE_SECONDS = 5;
export const RADIUS = { first: 16, second: 18 };
export const DOMINO_PIVOT = 351;

const FLOOR = 220;
const START = 0.4;
const RAMP_END = START + 1;
export const BLOCK_HIT = RAMP_END + 44 / 316;
export const DOMINO_HIT = BLOCK_HIT + 0.52;
const DOMINO_FALL = 0.85;
/** The tip of the domino reaches the second ball when it has leaned 70 of its 90 degrees. */
export const BALL_HIT = DOMINO_HIT + DOMINO_FALL * Math.sqrt(70 / 90);
const TOP = 3.8;
const BACK = 4.55;

/** Progress from 0 to 1 between two moments. */
const progress = (t: number, from: number, to: number) => Math.min(1, Math.max(0, (t - from) / (to - from)));
const speedUp = (p: number) => p * p;
const slowDown = (p: number) => 1 - (1 - p) * (1 - p);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** Centre of a ball touching the ground at horizontal position u, given the ground height and gradient there. */
function resting(u: number, height: number, gradient: number, radius: number): { x: number; y: number } {
  const length = Math.hypot(gradient, 1);
  return { x: u + (radius * gradient) / length, y: height - radius / length };
}
/** Left slope: starts high at x = 0 and levels out at x = 170. */
function leftGround(u: number): [number, number] {
  const s = Math.max(0, 1 - u / 170);
  return [FLOOR - 120 * s * s, (240 / 170) * s];
}
/** Right slope: flat until x = 430, then climbs to x = 600. */
function rightGround(u: number): [number, number] {
  const s = Math.max(0, (u - 430) / 170);
  return [FLOOR - 120 * s * s, (-240 / 170) * s];
}

export function scene(time: number) {
  const t = Math.min(SCENE_SECONDS, Math.max(0, time));

  const u1 = t < RAMP_END ? mix(12, 170, speedUp(progress(t, START, RAMP_END)))
    : t < BLOCK_HIT ? mix(170, 214, progress(t, RAMP_END, BLOCK_HIT))
    : mix(214, 188, slowDown(progress(t, BLOCK_HIT, BLOCK_HIT + 0.8)));

  const block = 230 + 48 * slowDown(progress(t, BLOCK_HIT, BLOCK_HIT + 0.7));

  const flat = DOMINO_HIT + DOMINO_FALL;
  const domino = 90 * speedUp(progress(t, DOMINO_HIT, flat)) - 7 * Math.sin(Math.PI * progress(t, flat, flat + 0.3));

  const waiting = 454;
  const u2 = t < TOP ? mix(waiting, 560, slowDown(progress(t, BALL_HIT, TOP)))
    : t < BACK ? mix(560, 463, speedUp(progress(t, TOP, BACK)))
    : 463 + 12 * Math.sin(Math.PI * progress(t, BACK, SCENE_SECONDS));

  const ball = (u: number, from: number, ground: (u: number) => [number, number], radius: number) => ({
    ...resting(u, ...ground(u), radius),
    spin: ((u - from) / radius) * (180 / Math.PI),
  });
  return { first: ball(u1, 12, leftGround, RADIUS.first), block, domino, second: ball(u2, waiting, rightGround, RADIUS.second) };
}
