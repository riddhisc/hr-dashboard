'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAppStore } from '@/stores/app';

/** Only renders workspace pages for a signed-in user. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sessionId = useAppStore((s) => s.sessionId);
  // Saved data exists only in the browser, so wait for mount to avoid a server/client mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => { if (mounted && !useAppStore.getState().sessionId) router.replace('/login'); }, [mounted, sessionId, router]);
  if (!mounted || !sessionId) return <div className="grid min-h-screen place-items-center text-sm text-slate-400">Loading workspace…</div>;
  return <AppShell>{children}</AppShell>;
}
