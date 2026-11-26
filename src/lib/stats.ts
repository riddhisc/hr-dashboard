import type { Employee, LeaveRequest, LeaveType, Workspace } from './types';
import { isoDate } from './utils';

export const fullName = (employee: Employee): string => `${employee.firstName} ${employee.lastName}`;
export const activeEmployees = (ws: Workspace): Employee[] => ws.employees.filter((e) => e.status === 'Active');

/** Weekdays between two yyyy-mm-dd dates, inclusive. */
export function workingDays(start: string, end: string): number {
  let count = 0;
  for (const day = new Date(`${start}T00:00:00`); isoDate(day) <= end; day.setDate(day.getDate() + 1)) {
    if (day.getDay() !== 0 && day.getDay() !== 6) count += 1;
  }
  return count;
}
export function onLeave(ws: Workspace, employeeId: string, date: string = isoDate()): boolean {
  return ws.leave.some((r) => r.employeeId === employeeId && r.status === 'Approved' && r.start <= date && r.end >= date);
}
/** Approved working days of a leave type taken by one employee in a calendar year. */
export function leaveUsed(requests: LeaveRequest[], employeeId: string, type: LeaveType, year: number): number {
  return requests
    .filter((r) => r.employeeId === employeeId && r.type === type && r.status === 'Approved')
    .reduce((sum, r) => {
      const start = r.start > `${year}-01-01` ? r.start : `${year}-01-01`;
      const end = r.end < `${year}-12-31` ? r.end : `${year}-12-31`;
      return sum + (start <= end ? workingDays(start, end) : 0);
    }, 0);
}
export function headcountByDepartment(ws: Workspace): { name: string; count: number }[] {
  const counts = new Map<string, number>(ws.departments.map((d) => [d.name, 0]));
  for (const e of activeEmployees(ws)) counts.set(e.department, (counts.get(e.department) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}
/** Joiners and leavers for each of the last `months` months, oldest first. */
export function hiringTrend(employees: Employee[], months = 12, today: Date = new Date()): { month: string; hires: number; exits: number }[] {
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (months - 1 - index), 1);
    const key = isoDate(date).slice(0, 7);
    return {
      month: date.toLocaleDateString('en-GB', { month: 'short' }),
      hires: employees.filter((e) => e.startDate.startsWith(key)).length,
      exits: employees.filter((e) => e.endDate?.startsWith(key)).length,
    };
  });
}
/** Exits in the last 365 days as a percentage of everyone employed at some point in that window. */
export function attritionRate(employees: Employee[], today: Date = new Date()): number {
  const from = isoDate(new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()));
  const to = isoDate(today);
  const inWindow = employees.filter((e) => e.startDate <= to && (!e.endDate || e.endDate > from));
  if (!inWindow.length) return 0;
  return (inWindow.filter((e) => e.endDate && e.endDate <= to).length / inWindow.length) * 100;
}
