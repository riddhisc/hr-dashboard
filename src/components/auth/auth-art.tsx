'use client';
import { useEffect, useState } from 'react';
import { DOMINO_PIVOT, RADIUS, SCENE_SECONDS, scene } from '@/lib/scene';

/** Plays the sign-in chain reaction once; clicking it plays it again. */
export function AuthArt() {
  const [time, setTime] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    // People who turn animations off see the finished picture.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setTime(SCENE_SECONDS);
    let frame = 0;
    let started: number | undefined;
    const step = (now: number) => {
      started ??= now;
      const seconds = (now - started) / 1000;
      setTime(Math.min(seconds, SCENE_SECONDS));
      if (seconds < SCENE_SECONDS) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [run]);

  const { first, block, domino, second } = scene(time);
  const ball = (name: string, at: typeof first, radius: number, fill: string) =>
    <g data-part={name} transform={`translate(${at.x} ${at.y}) rotate(${at.spin})`}>
      <circle r={radius} fill={fill} />
      <path d={`M0 0V-${radius - 4}`} stroke="#2f2fa8" strokeWidth="4" strokeLinecap="round" />
    </g>;

  return <button type="button" aria-label="Replay animation" title="Click to replay" onClick={() => { setTime(0); setRun(run + 1); }} className="block h-full w-full cursor-pointer">
    <svg aria-hidden="true" viewBox="0 0 600 220" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
      <path d="M0 220V100Q85 220 170 220Z" fill="#6d5bd0" />
      <path d="M430 220Q515 220 600 100V220Z" fill="#ffb4b4" />
      <rect data-part="block" x={block} y="160" width="60" height="60" rx="4" fill="#1e9be0" />
      <rect data-part="domino" x={DOMINO_PIVOT - 16} y="130" width="16" height="90" rx="3" fill="#f47c7c" transform={`rotate(${domino} ${DOMINO_PIVOT} 220)`} />
      {ball('first', first, RADIUS.first, '#ffc9c9')}
      {ball('second', second, RADIUS.second, '#7dd3fc')}
    </svg>
  </button>;
}
