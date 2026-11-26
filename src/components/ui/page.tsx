import Link from 'next/link';
import { Card } from './card';
import { buttonClass } from './form';

export function Page({ title, description, action, children }: { title: string; description: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1500px]">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><h1 className="text-[26px] font-bold tracking-[-.03em] text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-500">{description}</p></div>
      {action}
    </div>
    {children}
  </div>;
}
export function Empty({ title, hint, href, action }: { title: string; hint: string; href?: string; action?: string }) {
  return <Card className="px-5 py-12 text-center"><p className="text-sm font-semibold text-slate-700">{title}</p><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">{hint}</p>{href && <Link href={href} className={`${buttonClass} mt-5`}>{action}</Link>}</Card>;
}
export function Stat({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <Card className="p-5"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-[26px] font-bold tracking-[-.04em] text-slate-900">{value}</p><p className="mt-1 text-[11px] text-slate-400">{detail}</p></Card>;
}
export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return <Card className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-xs text-slate-600 [&_td]:px-5 [&_td]:py-3.5 [&_tbody_tr]:border-t [&_tbody_tr]:border-[#f2f3f7]">
    <thead><tr className="text-[10px] uppercase tracking-[.08em] text-slate-400">{head.map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead>
    <tbody>{children}</tbody>
  </table></Card>;
}
export function Progress({ percent }: { percent: number }) {
  return <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-[#6757e8]" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} /></div>;
}
