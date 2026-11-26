'use client';
import { Card } from '@/components/ui/card';
import { Button, Field, SelectField, formValues } from '@/components/ui/form';
import { Empty, Page, Progress, Stat } from '@/components/ui/page';
import { activeEmployees, fullName } from '@/lib/stats';
import { formatDate, newId } from '@/lib/utils';
import { useAppStore, useWorkspace } from '@/stores/app';

export default function PerformancePage() {
  const ws = useWorkspace();
  const update = useAppStore((s) => s.update);
  const staff = activeEmployees(ws);
  const done = ws.goals.filter((g) => g.progress === 100).length;
  const average = ws.goals.length ? Math.round(ws.goals.reduce((s, g) => s + g.progress, 0) / ws.goals.length) : 0;
  return <Page title="Performance" description="Goals and progress for your team.">
    {!ws.employees.length ? <Empty title="No employees yet" hint="Goals are assigned to employees." href="/employees/new" action="Add employee" /> : <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3"><Stat label="Goals" value={ws.goals.length} detail="in total" /><Stat label="Completed" value={done} detail="at 100%" /><Stat label="Average progress" value={`${average}%`} detail="across all goals" /></div>
      <Card className="p-5"><form className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const v = formValues(form);
        if (!v.title) return;
        update((w) => ({ goals: [{ id: newId(), title: v.title, ownerId: v.ownerId, due: v.due, progress: 0 }, ...w.goals] }), `New goal: ${v.title}`);
        form.reset();
      }}><Field name="title" label="Goal" /><SelectField name="ownerId" label="Owner" options={staff.map((e) => ({ value: e.id, label: fullName(e) }))} /><Field name="due" type="date" label="Due date" /><Button type="submit" disabled={!staff.length}>Add goal</Button></form></Card>
      {ws.goals.map((g) => { const owner = ws.employees.find((e) => e.id === g.ownerId); return <Card key={g.id} className="p-5">
        <div className="flex justify-between gap-3 text-xs"><div><p className="font-semibold text-slate-700">{g.title}</p><p className="mt-1 text-[11px] text-slate-400">{owner ? fullName(owner) : 'Former employee'} · Due {formatDate(g.due)}</p></div><span className="font-bold text-slate-700">{g.progress}%</span></div>
        <div className="mt-3"><Progress percent={g.progress} /></div>
        <input type="range" min={0} max={100} step={5} value={g.progress} aria-label={`Progress for ${g.title}`} onChange={(e) => update((w) => ({ goals: w.goals.map((x) => x.id === g.id ? { ...x, progress: Number(e.target.value) } : x) }))} className="mt-3 w-full accent-[#6757e8]" />
      </Card>; })}
    </div>}
  </Page>;
}
