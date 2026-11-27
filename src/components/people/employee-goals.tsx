'use client';
import { Card } from '@/components/ui/card';
import { Button, Field, formValues } from '@/components/ui/form';
import { Progress } from '@/components/ui/page';
import { goalsFor } from '@/lib/stats';
import type { Employee } from '@/lib/types';
import { formatDate, isoDate, newId } from '@/lib/utils';
import { text } from '@/lib/validation';
import { useAppStore, useWorkspace } from '@/stores/app';

export function EmployeeGoals({ employee }: { employee: Employee }) {
  const ws = useWorkspace();
  const update = useAppStore((s) => s.update);
  const { goals, completed, average } = goalsFor(ws.goals, employee.id);
  return <section aria-labelledby="goals-heading" className="mt-6 max-w-3xl space-y-4">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 id="goals-heading" className="text-base font-bold text-slate-800">Performance goals</h2>
      {goals.length > 0 && <p className="text-xs text-slate-500">{completed} of {goals.length} completed · {average}% average progress</p>}
    </div>
    {employee.status === 'Active' && <Card className="p-5"><form className="grid items-start gap-3 sm:grid-cols-3" onSubmit={(event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const v = formValues(form);
      if (!v.title) return;
      update((w) => ({ goals: [{ id: newId(), title: v.title, ownerId: employee.id, due: v.due, progress: 0 }, ...w.goals] }), `New goal: ${v.title}`);
      form.reset();
    }}><Field name="title" label="Goal" check={text('Goal', 120)} /><Field name="due" type="date" label="Due date" min={isoDate()} /><Button type="submit" className="sm:mt-6">Add goal</Button></form></Card>}
    {!goals.length && <p className="text-xs text-slate-500">No goals yet.</p>}
    {goals.map((g) => <Card key={g.id} className="p-5">
      <div className="flex justify-between gap-3 text-xs"><div><p className="font-semibold text-slate-700">{g.title}</p><p className="mt-1 text-[11px] text-slate-400">Due {formatDate(g.due)}</p></div><span className="font-bold text-slate-700">{g.progress}%</span></div>
      <div className="mt-3"><Progress percent={g.progress} /></div>
      <input type="range" min={0} max={100} step={5} value={g.progress} aria-label={`Progress for ${g.title}`} onChange={(e) => update((w) => ({ goals: w.goals.map((x) => x.id === g.id ? { ...x, progress: Number(e.target.value) } : x) }))} className="mt-3 w-full accent-[#0a6fe0]" />
    </Card>)}
  </section>;
}
