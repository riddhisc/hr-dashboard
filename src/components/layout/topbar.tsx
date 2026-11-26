'use client';
import Link from 'next/link';
import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { navGroups } from '@/config/nav';
import { fullName } from '@/lib/stats';
import { initials } from '@/lib/utils';
import { useAccount, useAppStore, useWorkspace } from '@/stores/app';

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const account = useAccount();
  const ws = useWorkspace();
  const signOut = useAppStore((s) => s.signOut);
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const pending = ws.leave.filter((r) => r.status === 'Pending').length;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); input.current?.focus(); }
      if (event.key === 'Escape') setQuery('');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const term = query.trim().toLowerCase();
  const results = term ? [
    ...navGroups.flatMap((g) => g.items).map((i) => ({ href: i.href, label: i.label, hint: 'Page' })),
    ...ws.employees.map((e) => ({ href: `/employees/${e.id}`, label: fullName(e), hint: e.role })),
  ].filter((r) => `${r.label} ${r.hint}`.toLowerCase().includes(term)).slice(0, 8) : [];

  return <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-[#e9e7fb] bg-white/85 px-5 backdrop-blur sm:px-8 lg:px-10">
    <button aria-label="Open navigation" onClick={onMenu} className="text-slate-500 lg:hidden"><Menu size={20} /></button>
    <div className="relative min-w-0 max-w-sm flex-1">
      <div className="flex h-9 items-center gap-2 rounded-lg border border-[#ececf2] bg-[#fafafd] px-3 text-slate-400"><Search size={16} /><input ref={input} value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" placeholder="Search people and pages" className="w-full bg-transparent text-xs text-slate-700 outline-none" /></div>
      {term && <div className="absolute inset-x-0 top-11 rounded-xl border border-[#e8eaf1] bg-white p-2 shadow-xl">
        {results.map((r) => <Link key={r.href} href={r.href} onClick={() => setQuery('')} className="flex justify-between gap-3 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-[#f7f6ff]"><span>{r.label}</span><span className="truncate text-slate-400">{r.hint}</span></Link>)}
        {!results.length && <p className="px-3 py-2 text-xs text-slate-400">No matches</p>}
      </div>}
    </div>
    <div className="ml-auto flex items-center gap-1 sm:gap-3">
      <Link href="/leave" aria-label={`${pending} pending leave requests`} className="relative rounded-lg p-2.5 text-slate-500 hover:bg-slate-50"><Bell size={18} />{pending > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />}</Link>
      <Link href="/settings" className="flex items-center gap-2 border-l border-[#ececf2] pl-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-bold text-white">{initials(account?.name ?? '')}</span><span className="hidden text-left md:block"><span className="block text-xs font-semibold text-slate-700">{account?.name}</span><span className="block text-[10px] text-slate-400">{account?.email}</span></span></Link>
      <button onClick={signOut} aria-label="Sign out" title="Sign out" className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-50"><LogOut size={18} /></button>
    </div>
  </header>;
}
