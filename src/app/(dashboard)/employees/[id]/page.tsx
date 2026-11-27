'use client';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { EmployeeForm } from '@/components/employees-form';
import { EmployeeGoals } from '@/components/people/employee-goals';
import { Button } from '@/components/ui/form';
import { Empty, Page } from '@/components/ui/page';
import { withDepartment } from '@/lib/employees';
import { fullName } from '@/lib/stats';
import { isoDate } from '@/lib/utils';
import { useAppStore, useWorkspace } from '@/stores/app';

export default function EmployeePage() {
  const id = useParams<{ id: string }>()?.id;
  const ws = useWorkspace();
  const update = useAppStore((s) => s.update);
  const employee = ws.employees.find((e) => e.id === id);
  if (!employee) return <Empty title="Employee not found" hint="This record does not exist in your workspace." href="/people" action="Back to people" />;
  const active = employee.status === 'Active';
  return <Page title={fullName(employee)} description={`${employee.role} · ${employee.department}${employee.endDate ? ` · Left ${employee.endDate}` : ''}`}
    action={<Button variant="ghost" onClick={() => {
      if (active && !window.confirm(`Mark ${fullName(employee)} as having left the company today?`)) return;
      update((w) => ({ employees: w.employees.map((e) => e.id === id ? { ...e, status: active ? 'Inactive' : 'Active', endDate: active ? isoDate() : undefined } : e) }), `${fullName(employee)} was ${active ? 'deactivated' : 'reactivated'}`);
    }}>{active ? 'Deactivate employee' : 'Reactivate employee'}</Button>}>
    <EmployeeForm key={employee.id} initial={employee} submitLabel="Save changes" onSave={(input) => {
      if (ws.employees.some((e) => e.id !== id && e.email === input.email)) return void toast.error('Another employee already uses this email');
      const { departments, draft } = withDepartment(ws.departments, input);
      update((w) => ({ departments, employees: w.employees.map((e) => e.id === id ? { ...e, ...draft } : e) }), `${draft.firstName} ${draft.lastName}'s record was updated`);
      toast.success('Changes saved');
    }} />
    <EmployeeGoals key={`goals-${employee.id}`} employee={employee} />
  </Page>;
}
