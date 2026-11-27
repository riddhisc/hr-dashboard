import { describe, expect, it } from 'vitest';
import { BALL_HIT, BLOCK_HIT, DOMINO_HIT, DOMINO_PIVOT, RADIUS, SCENE_SECONDS, scene } from '@/lib/scene';

const frames = Array.from({ length: SCENE_SECONDS * 60 + 1 }, (_, i) => scene(i / 60));

describe('sign-in chain reaction', () => {
  it('stops after five seconds', () => {
    expect(SCENE_SECONDS).toBe(5);
    expect(scene(60)).toEqual(scene(SCENE_SECONDS));
  });
  it('moves each piece only after it has been hit', () => {
    const start = scene(0);
    expect(scene(BLOCK_HIT).block).toBe(start.block);
    expect(scene(BLOCK_HIT + 0.1).block).toBeGreaterThan(start.block);
    expect(scene(DOMINO_HIT).domino).toBe(0);
    expect(scene(DOMINO_HIT + 0.2).domino).toBeGreaterThan(0);
    expect(scene(BALL_HIT).second).toEqual(start.second);
    expect(scene(BALL_HIT + 0.1).second.x).toBeGreaterThan(start.second.x);
  });
  it('slows the second ball as it climbs', () => {
    const travelled = (from: number) => scene(from + 0.2).second.x - scene(from).second.x;
    expect(travelled(BALL_HIT)).toBeGreaterThan(travelled(BALL_HIT + 0.4));
    expect(travelled(BALL_HIT + 0.4)).toBeGreaterThan(travelled(BALL_HIT + 0.8));
  });
  it('never lets the domino pass through the second ball', () => {
    const closest = Math.min(...frames.map(({ domino, second }) => {
      const angle = (domino * Math.PI) / 180;
      const dx = second.x - DOMINO_PIVOT;
      const dy = second.y - 220;
      const along = Math.min(90, Math.max(0, dx * Math.sin(angle) - dy * Math.cos(angle)));
      return Math.hypot(dx - along * Math.sin(angle), dy + along * Math.cos(angle));
    }));
    expect(closest).toBeGreaterThan(RADIUS.second - 2);
  });
  it('never jumps between frames', () => {
    const largest = Math.max(...frames.slice(1).map((now, i) => {
      const before = frames[i]!;
      return Math.max(Math.hypot(now.first.x - before.first.x, now.first.y - before.first.y), Math.hypot(now.second.x - before.second.x, now.second.y - before.second.y), Math.abs(now.block - before.block));
    }));
    expect(12).toBeGreaterThan(largest);
  });
});
