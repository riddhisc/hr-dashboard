import type { Workspace } from './types';
import { isoDate } from './utils';

/** Optional demo records, loaded only when the user asks for them. Dates are relative to today. */
export function sampleData(): Omit<Workspace, 'settings'> {
  const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return isoDate(d); };
  const people = [
    ['Maya', 'Patel', 'VP of Engineering', 'Engineering', 'Bengaluru', -900, 250000],
    ['Jon', 'Bell', 'Product Designer', 'Design', 'New York', -400, 140000],
    ['Arjun', 'Nair', 'Senior Recruiter', 'People', 'Mumbai', -210, 120000],
    ['Lena', 'Ortiz', 'Account Executive', 'Sales', 'Austin', -95, 110000],
    ['David', 'Kim', 'Finance Manager', 'Finance', 'Seoul', -20, 150000],
  ] as const;
  return {
    employees: people.map(([firstName, lastName, role, department, location, offset, monthlySalary], i) => ({ id: `sample-e${i}`, firstName, lastName, email: `${firstName}.${lastName}@example.com`.toLowerCase(), role, department, location, startDate: day(offset), status: 'Active', monthlySalary })),
    departments: ['Engineering', 'Design', 'People', 'Sales', 'Finance'].map((name, i) => ({ id: `sample-d${i}`, name })),
    attendance: { [day(0)]: { 'sample-e0': 'Present', 'sample-e1': 'Late', 'sample-e2': 'Present' } },
    leave: [{ id: 'sample-l0', employeeId: 'sample-e3', type: 'Annual', start: day(7), end: day(9), reason: 'Family visit', status: 'Pending' }],
    payroll: [],
    jobs: [{ id: 'sample-j0', title: 'Frontend Developer', department: 'Engineering', location: 'Bengaluru', status: 'Open' }],
    candidates: [{ id: 'sample-c0', name: 'Aditi Mehra', email: 'aditi.mehra@example.com', jobId: 'sample-j0', stage: 'Interview' }],
    interviews: [{ id: 'sample-i0', candidateId: 'sample-c0', interviewer: 'Maya Patel', at: `${day(2)}T11:00`, status: 'Scheduled' }],
    goals: [{ id: 'sample-g0', title: 'Reduce time to hire', ownerId: 'sample-e2', due: day(45), progress: 40 }],
    activities: [{ id: 'sample-a0', text: 'Sample data loaded', at: new Date().toISOString() }],
  };
}
