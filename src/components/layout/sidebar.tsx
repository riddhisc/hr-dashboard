'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { navItems } from '@/config/nav';
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
      <div className="mb-6 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-3 shadow-md shadow-blue-300/50"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-blue-100">Workspace</p><p className="mt-1 truncate text-sm font-semibold text-white">{ws.settings.company}</p></div>
      <nav aria-label="Main" className="space-y-1">{navItems.map(({ label, href, icon: Icon, tone, also }) => {
        const active = [href, also].some((base) => base && (pathname === base || pathname.startsWith(`${base}/`)));
        return <Link key={href} href={href} onClick={onClose} aria-current={active ? 'page' : undefined} className={cn('flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium', active ? 'bg-gradient-to-r from-blue-100 to-indigo-100 font-semibold text-blue-800' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-800')}>
          <span className={cn('grid h-7 w-7 place-items-center rounded-lg', active ? 'bg-blue-600 text-white' : tone)}><Icon size={15} strokeWidth={2} /></span><span className="flex-1">{label}</span>
          {href === '/time-off' && pending > 0 && <span aria-label={`${pending} pending leave requests`} className="rounded-full bg-[#e3effd] px-1.5 py-0.5 text-[10px] font-bold text-[#0a6fe0]">{pending}</span>}
        </Link>;
      })}</nav>
    </aside>
  </>;
}
