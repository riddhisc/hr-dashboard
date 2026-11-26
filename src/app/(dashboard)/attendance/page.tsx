'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, controlClass } from '@/components/ui/form';
import { Empty, Page, Stat, Table } from '@/components/ui/page';
import { activeEmployees, fullName, onLeave } from '@/lib/stats';
import type { AttendanceStatus } from '@/lib/types';
import { downloadCsv, isoDate } from '@/lib/utils';
import { useAppStore, useWorkspace } from '@/stores/app';

const options: AttendanceStatus[] = ['Present', 'Late', 'Absent'];

export default function AttendancePage() {
  const ws = useWorkspace();
  const update = useAppStore((s) => s.update);
  const [date, setDate] = useState(isoDate());
  const staff = activeEmployees(ws).filter((e) => e.startDate <= date);
  const marks = ws.attendance[date] ?? {};
  const expected = staff.filter((e) => !onLeave(ws, e.id, date));
  const count = (status: AttendanceStatus) => expected.filter((e) => marks[e.id] === status).length;
  const mark = (id: string, status: AttendanceStatus) => update((w) => ({ attendance: { ...w.attendance, [date]: { ...w.attendance[date], [id]: status } } }));

  return <Page title="Attendance" description="Record and review daily attendance."
    action={<input type="date" aria-label="Attendance date" value={date} max={isoDate()} onChange={(e) => e.target.value && setDate(e.target.value)} className={`${controlClass} sm:w-48`} />}>
    {!staff.length ? <Empty title="Nobody to mark on this date" hint="Active employees appear here from their start date." href="/employees/new" action="Add employee" /> : <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3"><Stat label="Present" value={count('Present')} detail={`of ${expected.length} expected`} /><Stat label="Late" value={count('Late')} detail="check-ins" /><Stat label="Absent" value={count('Absent')} detail={`${staff.length - expected.length} on approved leave`} /></div>
      <div className="flex justify-end"><Button variant="ghost" onClick={() => downloadCsv(`attendance-${date}.csv`, [['Name', 'Department', 'Status'], ...staff.map((e) => [fullName(e), e.department, onLeave(ws, e.id, date) ? 'On leave' : marks[e.id] ?? 'Not marked'])])}><Download size={14} /> Export CSV</Button></div>
      <Table head={['Employee', 'Department', 'Status']}>{staff.map((e) => <tr key={e.id}><td className="font-semibold">{fullName(e)}</td><td>{e.department}</td><td>
        {onLeave(ws, e.id, date) ? <Badge tone="warning">On leave</Badge> : <div className="flex gap-1">{options.map((o) => <button key={o} aria-label={`Mark ${fullName(e)} ${o}`} aria-pressed={marks[e.id] === o} onClick={() => mark(e.id, o)} className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold ${marks[e.id] === o ? 'border-[#6757e8] bg-[#6757e8] text-white' : 'border-[#e8eaf1] text-slate-500'}`}>{o}</button>)}</div>}
      </td></tr>)}</Table>
    </div>}
  </Page>;
}
