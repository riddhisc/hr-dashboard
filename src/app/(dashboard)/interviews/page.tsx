'use client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button, Field, SelectField, formValues } from '@/components/ui/form';
import { Empty, Page, Table } from '@/components/ui/page';
import type { InterviewStatus } from '@/lib/types';
import { newId } from '@/lib/utils';
import { useAppStore, useWorkspace } from '@/stores/app';

export default function InterviewsPage() {
  const ws = useWorkspace();
  const update = useAppStore((s) => s.update);
  const eligible = ws.candidates.filter((c) => c.stage !== 'Hired' && c.stage !== 'Rejected');
  const nameOf = (id: string) => ws.candidates.find((c) => c.id === id)?.name ?? 'Candidate';
  const setStatus = (id: string, candidateId: string, status: InterviewStatus) => update((w) => ({ interviews: w.interviews.map((i) => i.id === id ? { ...i, status } : i) }), `Interview with ${nameOf(candidateId)} was ${status.toLowerCase()}`);
  return <Page title="Interviews" description="Schedule interviews and track their outcome.">
    {!eligible.length && !ws.interviews.length ? <Empty title="No candidates to interview" hint="Add an applicant first." href="/applicants" action="Go to applicants" /> : <div className="space-y-4">
      {eligible.length > 0 && <Card className="p-5"><form className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const v = formValues(form);
        if (!v.interviewer) return;
        if (ws.interviews.some((i) => i.status === 'Scheduled' && i.at === v.at && i.interviewer.toLowerCase() === v.interviewer.toLowerCase())) return void toast.error('That interviewer is already booked at this time');
        update((w) => ({ interviews: [...w.interviews, { id: newId(), candidateId: v.candidateId, interviewer: v.interviewer, at: v.at, status: 'Scheduled' }], candidates: w.candidates.map((c) => c.id === v.candidateId && (c.stage === 'Applied' || c.stage === 'Screening') ? { ...c, stage: 'Interview' } : c) }), `Interview scheduled with ${nameOf(v.candidateId)}`);
        form.reset();
      }}>
        <SelectField name="candidateId" label="Candidate" options={eligible.map((c) => ({ value: c.id, label: c.name }))} /><Field name="interviewer" label="Interviewer" list="interviewers" /><datalist id="interviewers">{ws.employees.map((e) => <option key={e.id} value={`${e.firstName} ${e.lastName}`} />)}</datalist><Field name="at" type="datetime-local" label="Date and time" /><Button type="submit">Schedule</Button>
      </form></Card>}
      {!ws.interviews.length ? <Empty title="No interviews scheduled" hint="Scheduled interviews appear here and on the overview." /> :
        <Table head={['Candidate', 'Interviewer', 'When', 'Status', '']}>{[...ws.interviews].sort((a, b) => a.at.localeCompare(b.at)).map((i) => <tr key={i.id}><td className="font-semibold">{nameOf(i.candidateId)}</td><td>{i.interviewer}</td><td>{new Date(i.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</td><td><Badge tone={i.status === 'Scheduled' ? 'info' : i.status === 'Completed' ? 'success' : 'default'}>{i.status}</Badge></td>
          <td>{i.status === 'Scheduled' && <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setStatus(i.id, i.candidateId, 'Completed')}>Complete</Button><Button variant="ghost" onClick={() => setStatus(i.id, i.candidateId, 'Cancelled')}>Cancel</Button></div>}</td></tr>)}</Table>}
    </div>}
  </Page>;
}
