import { describe, expect, it } from 'vitest';
import { attritionRate, hiringTrend, leaveUsed, workingDays } from '@/lib/stats';
import type { Employee, LeaveRequest } from '@/lib/types';

const employee = (startDate: string, endDate?: string): Employee => ({ id: startDate, firstName: 'A', lastName: 'B', email: 'a@example.com', role: 'R', department: 'D', location: 'L', startDate, endDate, status: endDate ? 'Inactive' : 'Active', monthlySalary: 1 });

describe('workspace stats', () => {
  it('counts weekdays only', () => { expect(workingDays('2026-11-27', '2026-11-30')).toBe(2); });
  it('splits leave across calendar years', () => {
    const request: LeaveRequest = { id: '1', employeeId: 'e', type: 'Annual', start: '2026-12-31', end: '2027-01-04', reason: '', status: 'Approved' };
    expect(leaveUsed([request], 'e', 'Annual', 2026)).toBe(1);
    expect(leaveUsed([request], 'e', 'Annual', 2027)).toBe(2);
  });
  it('builds a monthly hiring trend', () => { expect(hiringTrend([employee('2026-11-02')], 2, new Date(2026, 10, 26)).map((m) => m.hires)).toEqual([0, 1]); });
  it('calculates attrition', () => { expect(attritionRate([employee('2025-01-01'), employee('2025-02-01', '2026-06-01')], new Date(2026, 10, 26))).toBe(50); });
});
