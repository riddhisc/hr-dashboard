'use client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button, Field, formValues } from '@/components/ui/form';
import { Empty, Page, Table } from '@/components/ui/page';
import { newId } from '@/lib/utils';
import { useAppStore, useWorkspace } from '@/stores/app';

export default function JobsPage() {
  const ws = useWorkspace();
  const update = useAppStore((s) => s.update);
  return <Page title="Jobs" description="Open roles you are hiring for.">
    <Card className="mb-5 p-5"><form className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const v = formValues(form);
      if (!v.title || !v.department || !v.location) return;
      const department = ws.departments.find((d) => d.name.toLowerCase() === v.department.toLowerCase())?.name ?? v.department;
      update((w) => ({ departments: w.departments.some((d) => d.name === department) ? w.departments : [...w.departments, { id: newId(), name: department }], jobs: [{ id: newId(), title: v.title, department, location: v.location, status: 'Open' }, ...w.jobs] }), `${v.title} role was opened`);
      form.reset();
    }}>
      <Field name="title" label="Job title" /><Field name="department" label="Department" list="job-departments" /><datalist id="job-departments">{ws.departments.map((d) => <option key={d.id} value={d.name} />)}</datalist><Field name="location" label="Location" /><Button type="submit">Create job</Button>
    </form></Card>
    {!ws.jobs.length ? <Empty title="No jobs yet" hint="Create a job above, then add applicants to it." /> :
      <Table head={['Title', 'Department', 'Location', 'Applicants', 'Status', '']}>{ws.jobs.map((j) => <tr key={j.id}><td className="font-semibold">{j.title}</td><td>{j.department}</td><td>{j.location}</td><td>{ws.candidates.filter((c) => c.jobId === j.id).length}</td><td><Badge tone={j.status === 'Open' ? 'success' : 'default'}>{j.status}</Badge></td>
        <td className="text-right"><Button variant="ghost" onClick={() => update((w) => ({ jobs: w.jobs.map((x) => x.id === j.id ? { ...x, status: x.status === 'Open' ? 'Closed' : 'Open' } : x) }), `${j.title} role was ${j.status === 'Open' ? 'closed' : 'reopened'}`)}>{j.status === 'Open' ? 'Close' : 'Reopen'}</Button></td></tr>)}</Table>}
  </Page>;
}
