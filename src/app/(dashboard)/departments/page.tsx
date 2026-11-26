'use client';
import { toast } from 'sonner';
import { Button, controlClass, formValues } from '@/components/ui/form';
import { Empty, Page, Table } from '@/components/ui/page';
import { activeEmployees } from '@/lib/stats';
import { newId } from '@/lib/utils';
import { useAppStore, useWorkspace } from '@/stores/app';

export default function DepartmentsPage() {
  const ws = useWorkspace();
  const update = useAppStore((s) => s.update);
  const active = activeEmployees(ws);
  return <Page title="Departments" description="How your teams are structured.">
    <form className="mb-4 flex max-w-md gap-2" onSubmit={(event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const { name } = formValues(form);
      if (!name) return;
      if (ws.departments.some((d) => d.name.toLowerCase() === name.toLowerCase())) return void toast.error('That department already exists');
      update((w) => ({ departments: [...w.departments, { id: newId(), name }] }), `${name} department was created`);
      form.reset();
    }}><input name="name" required aria-label="Department name" placeholder="New department name" className={controlClass} /><Button type="submit" className="shrink-0">Add department</Button></form>
    {!ws.departments.length ? <Empty title="No departments yet" hint="Add one above. Departments are also created when you add an employee." /> :
      <Table head={['Department', 'Active employees', '']}>{ws.departments.map((d) => {
        const count = active.filter((e) => e.department === d.name).length;
        const used = ws.employees.some((e) => e.department === d.name) || ws.jobs.some((j) => j.department === d.name);
        return <tr key={d.id}><td className="font-semibold">{d.name}</td><td>{count}</td><td className="text-right"><Button variant="ghost" disabled={used} title={used ? 'In use by employees or jobs' : undefined} onClick={() => update((w) => ({ departments: w.departments.filter((x) => x.id !== d.id) }), `${d.name} department was removed`)}>Remove</Button></td></tr>;
      })}</Table>}
  </Page>;
}
