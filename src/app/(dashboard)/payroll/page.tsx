'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button, controlClass } from '@/components/ui/form';
import { Empty, Page, Stat, Table } from '@/components/ui/page';
import { activeEmployees, fullName } from '@/lib/stats';
import { downloadCsv, formatMoney, formatMonth, isoDate, newId } from '@/lib/utils';
import { useAppStore, useWorkspace } from '@/stores/app';

export default function PayrollPage() {
  const ws = useWorkspace();
  const update = useAppStore((s) => s.update);
  const [month, setMonth] = useState(isoDate().slice(0, 7));
  const money = (n: number) => formatMoney(n, ws.settings.currency);
  const run = ws.payroll.find((p) => p.month === month);
  // A finished run is a snapshot; before that, preview everyone employed during the month.
  const lines = run?.lines ?? activeEmployees(ws).filter((e) => e.startDate.slice(0, 7) <= month).map((e) => ({ employeeId: e.id, name: fullName(e), department: e.department, amount: e.monthlySalary }));
  const total = lines.reduce((sum, l) => sum + l.amount, 0);

  return <Page title="Payroll" description="Monthly gross pay, based on each employee's salary."
    action={<input type="month" aria-label="Payroll month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} className={`${controlClass} sm:w-48`} />}>
    {!lines.length ? <Empty title="No payroll for this month" hint="Active employees who had started by this month are included." href="/employees/new" action="Add employee" /> : <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3"><Stat label="Gross payroll" value={money(total)} detail={formatMonth(month)} /><Stat label="Employees" value={lines.length} detail="included" /><Stat label="Status" value={run ? 'Finalised' : 'Draft'} detail={run ? 'Amounts are locked' : 'Full month, before tax and deductions'} /></div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" className="h-10" onClick={() => downloadCsv(`payroll-${month}.csv`, [['Name', 'Department', `Gross (${ws.settings.currency})`], ...lines.map((l) => [l.name, l.department, l.amount])])}><Download size={14} /> Export CSV</Button>
        {!run && <Button onClick={() => { if (window.confirm(`Finalise payroll for ${formatMonth(month)}? Amounts will be locked.`)) update((w) => ({ payroll: [...w.payroll, { id: newId(), month, createdAt: new Date().toISOString(), lines }] }), `Payroll for ${formatMonth(month)} was finalised`); }}>Finalise run</Button>}
      </div>
      <Table head={['Employee', 'Department', 'Gross pay']}>{lines.map((l) => <tr key={l.employeeId}><td className="font-semibold">{l.name}</td><td>{l.department}</td><td>{money(l.amount)}</td></tr>)}</Table>
    </div>}
  </Page>;
}
