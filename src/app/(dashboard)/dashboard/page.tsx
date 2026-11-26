'use client';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DepartmentChart, HiringChart } from '@/components/dashboard/overview-charts';
import { Card } from '@/components/ui/card';
import { Button, buttonClass } from '@/components/ui/form';
import { Page, Stat } from '@/components/ui/page';
import { sampleData } from '@/lib/sample';
import { activeEmployees, attritionRate, headcountByDepartment, hiringTrend, onLeave } from '@/lib/stats';
import { formatDate, greeting, isoDate } from '@/lib/utils';
import { useAccount, useAppStore, useWorkspace } from '@/stores/app';

export default function DashboardPage() {
  const ws = useWorkspace();
  const account = useAccount();
  const update = useAppStore((s) => s.update);
  const today = isoDate();
  const active = activeEmployees(ws);
  const away = active.filter((e) => onLeave(ws, e.id)).length;
  const openJobs = ws.jobs.filter((j) => j.status === 'Open').length;
  const upcoming = [
    ...ws.interviews.filter((i) => i.status === 'Scheduled' && i.at.slice(0, 10) >= today).map((i) => ({ id: i.id, date: i.at.slice(0, 10), text: `Interview: ${ws.candidates.find((c) => c.id === i.candidateId)?.name ?? 'Candidate'}` })),
    ...ws.leave.filter((r) => r.status === 'Approved' && r.start >= today).map((r) => { const e = ws.employees.find((x) => x.id === r.employeeId); return { id: r.id, date: r.start, text: `${e?.firstName ?? 'Employee'} starts ${r.type.toLowerCase()} leave` }; }),
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const isEmpty = !ws.employees.length && !ws.jobs.length && !ws.departments.length;

  return <Page title={`${greeting()}, ${account?.name.split(' ')[0] ?? ''}`} description={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
    action={<Link href="/employees/new" className={buttonClass}><Plus size={16} /> Add employee</Link>}>
    {isEmpty && <Card className="mb-5 flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
      <div><h2 className="text-sm font-bold text-slate-800">Your workspace is empty</h2><p className="mt-1 text-xs text-slate-500">Add your first employee, or load example records to look around. You can clear them in Settings.</p></div>
      <Button variant="ghost" onClick={() => update(() => sampleData())}>Load sample data</Button>
    </Card>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Active employees" value={active.length} detail={`${ws.departments.length} departments`} />
      <Stat label="On leave today" value={away} detail={`Pending requests: ${ws.leave.filter((r) => r.status === 'Pending').length}`} />
      <Stat label="Attrition rate" value={`${attritionRate(ws.employees).toFixed(1)}%`} detail="Last 12 months" />
      <Stat label="Open positions" value={openJobs} detail={`Candidates in progress: ${ws.candidates.filter((c) => c.stage !== 'Hired' && c.stage !== 'Rejected').length}`} />
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <Card className="p-5"><h2 className="text-sm font-bold text-slate-800">Joiners and leavers</h2><p className="mb-3 mt-1 text-xs text-slate-400">Last 12 months</p><HiringChart data={hiringTrend(ws.employees)} /></Card>
      <Card className="p-5"><h2 className="text-sm font-bold text-slate-800">Headcount by department</h2><p className="mb-3 mt-1 text-xs text-slate-400">Active employees</p>{active.length ? <DepartmentChart data={headcountByDepartment(ws)} /> : <p className="py-16 text-center text-xs text-slate-400">No employees yet</p>}</Card>
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <Card className="p-5"><h2 className="mb-4 text-sm font-bold text-slate-800">Upcoming</h2>{upcoming.length ? <ul className="space-y-3">{upcoming.map((u) => <li key={u.id} className="flex justify-between gap-3 text-xs"><span className="font-medium text-slate-700">{u.text}</span><span className="shrink-0 text-slate-400">{formatDate(u.date)}</span></li>)}</ul> : <p className="text-xs text-slate-400">Nothing scheduled.</p>}</Card>
      <Card className="p-5"><h2 className="mb-4 text-sm font-bold text-slate-800">Recent activity</h2>{ws.activities.length ? <ul className="space-y-3">{ws.activities.slice(0, 6).map((a) => <li key={a.id} className="flex justify-between gap-3 text-xs"><span className="font-medium text-slate-700">{a.text}</span><span className="shrink-0 text-slate-400">{formatDate(isoDate(new Date(a.at)))}</span></li>)}</ul> : <p className="text-xs text-slate-400">Changes you make will appear here.</p>}</Card>
    </div>
  </Page>;
}
