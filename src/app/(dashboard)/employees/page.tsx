'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonClass, controlClass } from '@/components/ui/form';
import { Empty, Page, Table } from '@/components/ui/page';
import { fullName, onLeave } from '@/lib/stats';
import { downloadCsv, initials } from '@/lib/utils';
import { useWorkspace } from '@/stores/app';

const avatarTones = ['bg-violet-100 text-violet-700', 'bg-pink-100 text-pink-700', 'bg-sky-100 text-sky-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-800'];

export default function EmployeesPage() {
  const ws = useWorkspace();
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const rows = ws.employees.filter((e) => (!department || e.department === department) && `${fullName(e)} ${e.role} ${e.email}`.toLowerCase().includes(query.toLowerCase()));
  return <Page title="Employees" description="Your people, roles, and employee records." action={<Link href="/employees/new" className={buttonClass}><Plus size={16} /> Add employee</Link>}>
    {!ws.employees.length ? <Empty title="No employees yet" hint="Add your first employee to start the directory." href="/employees/new" action="Add employee" /> : <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input aria-label="Search employees" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, title, or email" className={controlClass} />
        <select aria-label="Filter by department" value={department} onChange={(e) => setDepartment(e.target.value)} className={`${controlClass} sm:w-56`}><option value="">All departments</option>{ws.departments.map((d) => <option key={d.id}>{d.name}</option>)}</select>
        <Button variant="ghost" className="h-10 shrink-0" disabled={!rows.length} onClick={() => downloadCsv('employees.csv', [['Name', 'Email', 'Title', 'Department', 'Location', 'Start date', 'Status'], ...rows.map((e) => [fullName(e), e.email, e.role, e.department, e.location, e.startDate, e.status])])}><Download size={14} /> Export CSV</Button>
      </div>
      <Table head={['Employee', 'Department', 'Location', 'Status']}>
        {rows.map((e) => <tr key={e.id}><td><div className="flex items-center gap-3"><span aria-hidden="true" className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-bold ${avatarTones[e.firstName.charCodeAt(0) % avatarTones.length]}`}>{initials(fullName(e))}</span><div><Link href={`/employees/${e.id}`} className="font-semibold text-slate-800 hover:text-violet-700">{fullName(e)}</Link><p className="text-[11px] text-slate-400">{e.role}</p></div></div></td><td>{e.department}</td><td>{e.location}</td>
          <td>{e.status === 'Inactive' ? <Badge>Inactive</Badge> : onLeave(ws, e.id) ? <Badge tone="warning">On leave</Badge> : <Badge tone="success">Active</Badge>}</td></tr>)}
      </Table>
      <p className="text-[11px] text-slate-400">Showing {rows.length} of {ws.employees.length}</p>
    </div>}
  </Page>;
}
