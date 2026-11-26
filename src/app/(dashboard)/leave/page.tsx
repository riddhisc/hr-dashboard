'use client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button, Field, SelectField, formValues } from '@/components/ui/form';
import { Empty, Page, Table } from '@/components/ui/page';
import { activeEmployees, fullName, leaveUsed, workingDays } from '@/lib/stats';
import type { LeaveRequest, LeaveStatus, LeaveType } from '@/lib/types';
import { formatDate, isoDate, newId } from '@/lib/utils';
import { useAppStore, useWorkspace } from '@/stores/app';

const types: LeaveType[] = ['Annual', 'Sick', 'Personal'];

export default function LeavePage() {
  const ws = useWorkspace();
  const update = useAppStore((s) => s.update);
  const staff = activeEmployees(ws);
  const year = new Date().getFullYear();
  const nameOf = (id: string) => { const e = ws.employees.find((x) => x.id === id); return e ? fullName(e) : 'Former employee'; };

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const v = formValues(form);
    if (v.end < v.start) return void toast.error('End date must be on or after the start date');
    if (!workingDays(v.start, v.end)) return void toast.error('Those dates contain no working days');
    if (ws.leave.some((r) => r.employeeId === v.employeeId && r.status !== 'Declined' && r.start <= v.end && r.end >= v.start)) return void toast.error('This overlaps an existing request');
    const request: LeaveRequest = { id: newId(), employeeId: v.employeeId, type: v.type as LeaveType, start: v.start, end: v.end, reason: v.reason, status: 'Pending' };
    update((w) => ({ leave: [request, ...w.leave] }), `${nameOf(v.employeeId)} requested ${v.type.toLowerCase()} leave`);
    form.reset();
    toast.success('Leave request submitted');
  }
  function decide(request: LeaveRequest, status: LeaveStatus) {
    if (status === 'Approved') {
      // A request may span two calendar years, each with its own allowance.
      for (const y of new Set([request.start, request.end].map((d) => Number(d.slice(0, 4))))) {
        const total = leaveUsed([...ws.leave.filter((r) => r.id !== request.id), { ...request, status }], request.employeeId, request.type, y);
        if (total > ws.settings.leaveAllowance[request.type]) return void toast.error(`This exceeds the ${request.type.toLowerCase()} leave allowance for ${y}`);
      }
    }
    update((w) => ({ leave: w.leave.map((r) => r.id === request.id ? { ...r, status } : r) }), `${nameOf(request.employeeId)}'s leave was ${status.toLowerCase()}`);
  }

  return <Page title="Leave" description="Requests, approvals, and balances.">
    {!ws.employees.length ? <Empty title="No employees yet" hint="Add employees before recording leave." href="/employees/new" action="Add employee" /> : <div className="space-y-5">
      <Card className="p-5"><h2 className="mb-4 text-sm font-bold text-slate-800">New request</h2><form onSubmit={submit} className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <SelectField name="employeeId" label="Employee" options={staff.map((e) => ({ value: e.id, label: fullName(e) }))} />
        <SelectField name="type" label="Type" options={types} />
        <Field name="start" type="date" label="From" defaultValue={isoDate()} />
        <Field name="end" type="date" label="To" defaultValue={isoDate()} />
        <Field name="reason" label="Reason (optional)" required={false} maxLength={500} />
        <Button type="submit" disabled={!staff.length}>Submit request</Button>
      </form></Card>
      {!ws.leave.length ? <Empty title="No leave requests" hint="Submitted requests appear here for approval." /> :
        <Table head={['Employee', 'Type', 'Dates', 'Days', 'Status', '']}>{ws.leave.map((r) => <tr key={r.id}><td><span className="font-semibold">{nameOf(r.employeeId)}</span>{r.reason && <p className="text-[11px] text-slate-400">{r.reason}</p>}</td><td>{r.type}</td><td>{formatDate(r.start)} – {formatDate(r.end)}</td><td>{workingDays(r.start, r.end)}</td>
          <td><Badge tone={r.status === 'Pending' ? 'warning' : r.status === 'Approved' ? 'success' : 'danger'}>{r.status}</Badge></td>
          <td>{r.status === 'Pending' && <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => decide(r, 'Approved')}>Approve</Button><Button variant="ghost" onClick={() => decide(r, 'Declined')}>Decline</Button></div>}</td></tr>)}</Table>}
      <h2 className="text-sm font-bold text-slate-800">Days remaining in {year}</h2>
      <Table head={['Employee', ...types]}>{staff.map((e) => <tr key={e.id}><td className="font-semibold">{fullName(e)}</td>{types.map((t) => <td key={t}>{ws.settings.leaveAllowance[t] - leaveUsed(ws.leave, e.id, t, year)} of {ws.settings.leaveAllowance[t]}</td>)}</tr>)}</Table>
    </div>}
  </Page>;
}
