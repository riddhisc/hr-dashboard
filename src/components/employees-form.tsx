'use client';
import { Button, Field, formValues } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import type { Employee, EmployeeDraft } from '@/lib/types';
import { isoDate } from '@/lib/utils';
import { useWorkspace } from '@/stores/app';

export function EmployeeForm({ initial, submitLabel, onSave }: { initial?: Employee; submitLabel: string; onSave: (draft: EmployeeDraft) => void }) {
  const ws = useWorkspace();
  return <Card className="max-w-3xl p-6"><form onSubmit={(event) => {
    event.preventDefault();
    const v = formValues(event.currentTarget);
    onSave({ firstName: v.firstName, lastName: v.lastName, email: v.email.toLowerCase(), role: v.role, department: v.department, location: v.location, startDate: v.startDate, monthlySalary: Number(v.monthlySalary) });
  }} className="grid gap-4 sm:grid-cols-2">
    <Field name="firstName" label="First name" defaultValue={initial?.firstName} pattern=".*\S.*" />
    <Field name="lastName" label="Last name" defaultValue={initial?.lastName} pattern=".*\S.*" />
    <Field name="email" type="email" label="Work email" defaultValue={initial?.email} />
    <Field name="role" label="Job title" defaultValue={initial?.role} pattern=".*\S.*" />
    <Field name="department" label="Department" list="departments" defaultValue={initial?.department} pattern=".*\S.*" />
    <datalist id="departments">{ws.departments.map((d) => <option key={d.id} value={d.name} />)}</datalist>
    <Field name="location" label="Location" defaultValue={initial?.location} pattern=".*\S.*" />
    <Field name="startDate" type="date" label="Start date" defaultValue={initial?.startDate ?? isoDate()} />
    <Field name="monthlySalary" type="number" min={0} step="1" label={`Monthly gross salary (${ws.settings.currency})`} defaultValue={initial?.monthlySalary} />
    <div className="sm:col-span-2"><Button type="submit">{submitLabel}</Button></div>
  </form></Card>;
}
