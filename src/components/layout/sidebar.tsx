'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { navGroups } from '@/config/nav';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/stores/app';

export function Sidebar({ open, onClose }: Readonly<{ open: boolean; onClose: () => void }>) {
  const pathname = usePathname() ?? '';
  const ws = useWorkspace();
  const pending = ws.leave.filter((r) => r.status === 'Pending').length;
  return <>
    <div onClick={onClose} className={cn('fixed inset-0 z-40 bg-slate-950/25 lg:hidden', !open && 'hidden')} />
    <aside className={cn('fixed inset-y-0 left-0 z-50 w-[238px] -translate-x-full overflow-y-auto border-r border-[#e8eaf1] bg-white px-4 py-5 transition-transform lg:translate-x-0', open && 'translate-x-0')}>
      <div className="mb-6 flex items-center justify-between px-2">
        <Link href="/dashboard"><Logo /></Link>
        <button aria-label="Close navigation" onClick={onClose} className="text-slate-400 lg:hidden"><X size={18} /></button>
      </div>
      <div className="mb-6 rounded-xl border border-[#e7e5fc] bg-[#f7f6ff] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#7467da]">Workspace</p><p className="mt-1 truncate text-sm font-semibold text-slate-800">{ws.settings.company}</p></div>
      {navGroups.map((group) => <div key={group.title} className="mb-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.13em] text-slate-400">{group.title}</p>
        <nav className="space-y-0.5">{group.items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={href} href={href} onClick={onClose} aria-current={active ? 'page' : undefined} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium', active ? 'bg-[#f0effe] text-[#6757e8]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')}>
            <Icon size={17} strokeWidth={1.8} /><span className="flex-1">{label}</span>
            {href === '/leave' && pending > 0 && <span className="rounded-full bg-[#edeafd] px-1.5 py-0.5 text-[10px] font-bold text-[#6757e8]">{pending}</span>}
          </Link>;
        })}</nav>
      </div>)}
    </aside>
  </>;
}
