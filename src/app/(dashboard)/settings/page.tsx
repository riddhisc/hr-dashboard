'use client';
import { personName, text } from '@/lib/validation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button, Field, SelectField, formValues } from '@/components/ui/form';
import { Page } from '@/components/ui/page';
import { emptyWorkspace, useAccount, useAppStore, useWorkspace } from '@/stores/app';

export default function SettingsPage() {
  const ws = useWorkspace();
  const account = useAccount();
  const update = useAppStore((s) => s.update);
  const rename = useAppStore((s) => s.renameAccount);
  const { settings } = ws;
  return <Page title="Settings" description={`Signed in as ${account?.email ?? ''}`}>
    <Card className="max-w-3xl p-6"><form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => {
      event.preventDefault();
      const v = formValues(event.currentTarget);
      if (!v.name || !v.company) return void toast.error('Name and company are required');
      rename(v.name);
      update(() => ({ settings: { company: v.company, currency: v.currency, leaveAllowance: { Annual: Number(v.annual), Sick: Number(v.sick), Personal: Number(v.personal) } } }));
      toast.success('Settings saved');
    }}>
      <Field name="name" label="Your name" check={personName('Your name')} defaultValue={account?.name} />
      <Field name="company" label="Company name" check={text('Company name')} defaultValue={settings.company} />
      {/* Locked once salaries exist: changing it would relabel amounts without converting them. */}
      <SelectField name="currency" label="Currency" defaultValue={settings.currency} options={ws.employees.length ? [settings.currency] : ['INR', 'USD', 'EUR', 'GBP']} />
      <Field name="annual" type="number" min={0} max={365} step="1" label="Annual leave days per year" defaultValue={settings.leaveAllowance.Annual} />
      <Field name="sick" type="number" min={0} max={365} step="1" label="Sick leave days per year" defaultValue={settings.leaveAllowance.Sick} />
      <Field name="personal" type="number" min={0} max={365} step="1" label="Personal days per year" defaultValue={settings.leaveAllowance.Personal} />
      <div className="sm:col-span-2"><Button type="submit">Save changes</Button></div>
    </form></Card>
    <Card className="mt-5 max-w-3xl p-6"><h2 className="text-sm font-bold text-slate-800">Clear workspace data</h2><p className="mt-1 text-xs text-slate-500">Removes all employees, leave, payroll, hiring, and goal records. Your account and settings stay.</p>
      <Button variant="ghost" className="mt-4" onClick={() => { if (window.confirm('Permanently delete all workspace records?')) { update(() => ({ ...emptyWorkspace(settings.company), settings })); toast.success('Workspace cleared'); } }}>Clear all records</Button></Card>
  </Page>;
}
