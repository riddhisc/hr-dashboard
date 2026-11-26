'use client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EmployeeForm } from '@/components/employees-form';
import { Page } from '@/components/ui/page';
import { withDepartment } from '@/lib/employees';
import { newId } from '@/lib/utils';
import { useAppStore, useWorkspace } from '@/stores/app';

export default function NewEmployeePage() {
  const router = useRouter();
  const ws = useWorkspace();
  const update = useAppStore((s) => s.update);
  return <Page title="Add employee" description="Create a new employee record.">
    <EmployeeForm submitLabel="Add employee" onSave={(input) => {
      if (ws.employees.some((e) => e.email === input.email)) return void toast.error('An employee with this email already exists');
      const { departments, draft } = withDepartment(ws.departments, input);
      const name = `${draft.firstName} ${draft.lastName}`;
      update((w) => ({ departments, employees: [{ ...draft, id: newId(), status: 'Active' }, ...w.employees] }), `${name} was added to ${draft.department}`);
      toast.success(`${name} added`);
      router.push('/employees');
    }} />
  </Page>;
}
