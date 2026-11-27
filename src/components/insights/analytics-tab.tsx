'use client';
import { DepartmentChart, HiringChart } from '@/components/dashboard/overview-charts';
import { Card } from '@/components/ui/card';
import { Empty, Progress, Stat } from '@/components/ui/page';
import { activeEmployees, attritionRate, headcountByDepartment, hiringTrend } from '@/lib/stats';
import { stages } from '@/lib/types';
import { formatMoney } from '@/lib/utils';
import { useWorkspace } from '@/stores/app';

export function AnalyticsTab() {
  const ws = useWorkspace();
  const active = activeEmployees(ws);
  const salary = active.reduce((s, e) => s + e.monthlySalary, 0);
  const tenure = active.length ? active.reduce((s, e) => s + Math.max(0, Date.now() - new Date(e.startDate).getTime()), 0) / active.length / (365.25 * 864e5) : 0;
  return <>
    {!ws.employees.length && !ws.candidates.length ? <Empty title="Nothing to analyse yet" hint="Add employees or applicants to see trends." href="/employees/new" action="Add employee" /> : <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3"><Stat label="Average monthly salary" value={formatMoney(active.length ? salary / active.length : 0, ws.settings.currency)} detail={`${active.length} active employees`} /><Stat label="Average tenure" value={`${tenure.toFixed(1)} yrs`} detail="Active employees" /><Stat label="Attrition rate" value={`${attritionRate(ws.employees).toFixed(1)}%`} detail="Last 12 months" /></div>
      <div className="grid gap-5 xl:grid-cols-2"><Card className="p-5"><h2 className="mb-3 text-sm font-bold text-slate-800">Joiners and leavers</h2><HiringChart data={hiringTrend(ws.employees)} /></Card><Card className="p-5"><h2 className="mb-3 text-sm font-bold text-slate-800">Headcount by department</h2><DepartmentChart data={headcountByDepartment(ws)} /></Card></div>
      <Card className="p-5"><h2 className="mb-4 text-sm font-bold text-slate-800">Candidates by stage</h2><div className="space-y-4">{stages.map((s) => { const n = ws.candidates.filter((c) => c.stage === s).length; return <div key={s}><div className="mb-1 flex justify-between text-xs text-slate-600"><span>{s}</span><span className="font-semibold">{n}</span></div><Progress percent={ws.candidates.length ? (n / ws.candidates.length) * 100 : 0} /></div>; })}</div></Card>
    </div>}
  </>;
}
