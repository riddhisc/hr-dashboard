'use client';
import Link from 'next/link';
import { X, ChevronDown, Sparkles } from 'lucide-react';
import { mainNav, talentNav, settingsNav, type NavItem } from '@/config/nav';
import { cn } from '@/lib/utils';
export function Sidebar({ open, onClose }: Readonly<{ open:boolean; onClose:()=>void }>) {
  return <><div onClick={onClose} className={cn('fixed inset-0 z-40 bg-slate-950/25 lg:hidden', !open && 'hidden')} /><aside className={cn('fixed inset-y-0 left-0 z-50 w-[238px] -translate-x-full border-r border-[#e8eaf1] bg-white px-4 py-5 transition-transform lg:translate-x-0', open && 'translate-x-0')}>
    <div className="mb-8 flex items-center justify-between px-2"><Link href="/dashboard" className="flex items-center gap-2.5 font-semibold tracking-tight text-slate-900"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#6757e8] text-white"><Sparkles size={17}/></span><span className="text-[18px]">peopleflow</span></Link><button aria-label="Close navigation" onClick={onClose} className="text-slate-400 lg:hidden"><X size={18}/></button></div>
    <div className="mb-7 rounded-xl border border-[#e7e5fc] bg-[#f7f6ff] p-3"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#7467da]">Workspace</p><p className="mt-1 text-sm font-semibold text-slate-800">Acme Corporation</p></div><ChevronDown size={15} className="text-slate-400"/></div></div>
    <NavGroup title="Workspace" items={mainNav} onClose={onClose}/><NavGroup title="People & talent" items={talentNav} onClose={onClose}/><NavGroup title="Manage" items={settingsNav} onClose={onClose}/>
    <div className="absolute bottom-5 left-4 right-4 rounded-xl bg-slate-900 p-3.5 text-white"><p className="text-xs font-semibold">Need a hand?</p><p className="mt-1 text-[11px] leading-4 text-slate-400">Visit the help center or talk to our team.</p><Link href="/settings?tab=help" onClick={onClose} className="mt-3 inline-block text-[11px] font-semibold text-violet-300">Open help center →</Link></div>
  </aside></>;
}
function NavGroup({title,items,onClose}:{title:string;items:NavItem[];onClose:()=>void}) { return <div className="mb-6"><p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.13em] text-slate-400">{title}</p><nav className="space-y-0.5">{items.map(({label,href,icon:Icon,badge})=><Link key={href} href={href} onClick={onClose} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"><Icon size={17} strokeWidth={1.8}/><span className="flex-1">{label}</span>{badge && <span className="rounded-full bg-[#edeafd] px-1.5 py-0.5 text-[10px] font-bold text-[#6757e8]">{badge}</span>}</Link>)}</nav></div>; }
