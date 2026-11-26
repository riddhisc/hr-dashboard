'use client';
import { email, personName } from '@/lib/validation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button, Field, SelectField, controlClass, formValues } from '@/components/ui/form';
import { Empty, Page, Table } from '@/components/ui/page';
import { stages, type Stage } from '@/lib/types';
import { newId } from '@/lib/utils';
import { useAppStore, useWorkspace } from '@/stores/app';

export default function ApplicantsPage() {
  const ws = useWorkspace();
  const update = useAppStore((s) => s.update);
  const [query, setQuery] = useState('');
  const open = ws.jobs.filter((j) => j.status === 'Open');
  const jobTitle = (id: string) => ws.jobs.find((j) => j.id === id)?.title ?? '';
  const rows = ws.candidates.filter((c) => `${c.name} ${c.email} ${jobTitle(c.jobId)}`.toLowerCase().includes(query.toLowerCase()));
  return <Page title="Applicants" description="Everyone who has applied to your roles.">
    {!open.length && !ws.candidates.length ? <Empty title="No open jobs" hint="Create a job before adding applicants." href="/jobs" action="Go to jobs" /> : <div className="space-y-4">
      {open.length > 0 && <Card className="p-5"><form className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const v = formValues(form);
        const address = v.email.toLowerCase();
        if (!v.name) return;
        if (ws.candidates.some((c) => c.email === address && c.jobId === v.jobId)) return void toast.error('This person has already applied for that job');
        update((w) => ({ candidates: [{ id: newId(), name: v.name, email: address, jobId: v.jobId, stage: 'Applied' }, ...w.candidates] }), `${v.name} applied for ${jobTitle(v.jobId)}`);
        form.reset();
      }}>
        <Field name="name" label="Full name" check={personName('Full name')} /><Field name="email" type="email" label="Email" check={email} /><SelectField name="jobId" label="Job" options={open.map((j) => ({ value: j.id, label: j.title }))} /><Button type="submit" className="sm:mt-6">Add applicant</Button>
      </form></Card>}
      {!ws.candidates.length ? <Empty title="No applicants yet" hint="Applicants you add appear here and on the recruitment board." /> : <>
        <input aria-label="Search applicants" placeholder="Search by name, email, or job" value={query} onChange={(e) => setQuery(e.target.value)} className={controlClass} />
        <Table head={['Applicant', 'Job', 'Stage']}>{rows.map((c) => <tr key={c.id}><td><span className="font-semibold">{c.name}</span><p className="text-[11px] text-slate-400">{c.email}</p></td><td>{jobTitle(c.jobId)}</td>
          <td><select aria-label={`Stage for ${c.name}`} value={c.stage} onChange={(e) => update((w) => ({ candidates: w.candidates.map((x) => x.id === c.id ? { ...x, stage: e.target.value as Stage } : x) }), `${c.name} moved to ${e.target.value}`)} className={`${controlClass} w-36`}>{stages.map((s) => <option key={s}>{s}</option>)}</select></td></tr>)}</Table>
      </>}
    </div>}
  </Page>;
}
