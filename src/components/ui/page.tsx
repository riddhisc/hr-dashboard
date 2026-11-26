import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Card } from './card';
import { buttonClass } from './form';

export function Page({ title, description, action, children }: { title: string; description: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1500px]">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="border-l-4 border-fuchsia-500 pl-3"><h1 className="text-[26px] font-bold tracking-[-.03em] text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-500">{description}</p></div>
      {action}
    </div>
    {children}
  </div>;
}
export function Empty({ title, hint, href, action }: { title: string; hint: string; href?: string; action?: string }) {
  return <Card className="border-dashed border-violet-200 bg-gradient-to-b from-white to-violet-50/70 px-5 py-12 text-center">
    <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-300/50"><Sparkles size={24} /></span>
    <p className="text-sm font-semibold text-slate-800">{title}</p><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">{hint}</p>{href && <Link href={href} className={`${buttonClass} mt-5`}>{action}</Link>}
  </Card>;
}
/** Stat cards take their colour from their position in the row. */
export function Stat({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <div className="rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg shadow-slate-300/40 [&:nth-child(4n+1)]:from-violet-600 [&:nth-child(4n+1)]:to-indigo-500 [&:nth-child(4n+2)]:from-pink-600 [&:nth-child(4n+2)]:to-rose-500 [&:nth-child(4n+3)]:from-sky-700 [&:nth-child(4n+3)]:to-cyan-600 [&:nth-child(4n+4)]:from-emerald-700 [&:nth-child(4n+4)]:to-teal-600">
    <p className="text-xs font-semibold text-white/90">{label}</p><p className="mt-2 text-[28px] font-bold tracking-[-.04em]">{value}</p><p className="mt-1 text-[11px] text-white/85">{detail}</p>
  </div>;
}
export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return <Card className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs text-slate-600 [&_td]:px-5 [&_td]:py-3.5 [&_tbody_tr]:border-t [&_tbody_tr]:border-violet-50 [&_tbody_tr:hover]:bg-violet-50/60">
    <thead className="bg-gradient-to-r from-violet-100 to-fuchsia-50"><tr className="text-[10px] uppercase tracking-[.08em] text-violet-800">{head.map((h) => <th key={h} className="px-5 py-3 font-bold">{h}</th>)}</tr></thead>
    <tbody>{children}</tbody>
  </table></Card>;
}
export function Progress({ percent }: { percent: number }) {
  return <div className="h-2.5 rounded-full bg-violet-100"><div className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} /></div>;
}
