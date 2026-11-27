'use client';
import { Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/form';
import { fullName, leaveUsed } from '@/lib/stats';
import { stages } from '@/lib/types';
import { downloadCsv, isoDate } from '@/lib/utils';
import { useWorkspace } from '@/stores/app';

export function ReportsTab() {
  const ws = useWorkspace();
  const year = new Date().getFullYear();
  const reports: { name: string; description: string; file: string; rows: (string | number)[][] }[] = [
    { name: 'Headcount', description: 'Every employee record with department, location, and status.', file: 'headcount', rows: [['Name', 'Title', 'Department', 'Location', 'Start date', 'End date', 'Status'], ...ws.employees.map((e) => [fullName(e), e.role, e.department, e.location, e.startDate, e.endDate ?? '', e.status])] },
    { name: 'Compensation', description: `Monthly gross salary per active employee (${ws.settings.currency}).`, file: 'compensation', rows: [['Name', 'Department', 'Monthly gross'], ...ws.employees.filter((e) => e.status === 'Active').map((e) => [fullName(e), e.department, e.monthlySalary])] },
    { name: 'Leave utilisation', description: `Approved working days taken in ${year}.`, file: 'leave', rows: [['Name', 'Annual', 'Sick', 'Personal'], ...ws.employees.map((e) => [fullName(e), leaveUsed(ws.leave, e.id, 'Annual', year), leaveUsed(ws.leave, e.id, 'Sick', year), leaveUsed(ws.leave, e.id, 'Personal', year)])] },
    { name: 'Hiring funnel', description: 'Candidate count at each stage.', file: 'hiring-funnel', rows: [['Stage', 'Candidates'], ...(ws.candidates.length ? stages.map((s) => [s, ws.candidates.filter((c) => c.stage === s).length]) : [])] },
  ];
  return <>
    <div className="grid gap-4 sm:grid-cols-2">{reports.map((r) => <Card key={r.file} className="p-5"><h2 className="text-sm font-bold text-slate-800">{r.name}</h2><p className="mt-2 min-h-9 text-xs leading-5 text-slate-400">{r.description}</p>
      <Button variant="ghost" className="mt-4" disabled={r.rows.length < 2} onClick={() => downloadCsv(`${r.file}-${isoDate()}.csv`, r.rows)}><Download size={14} /> {r.rows.length < 2 ? 'No data yet' : `Download (${r.rows.length - 1} rows)`}</Button></Card>)}</div>
  </>;
}
