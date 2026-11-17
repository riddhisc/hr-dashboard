import { describe, expect, it } from 'vitest';
import { employeeSchema } from '@/features/employees/schemas';
import { leaveRequestSchema } from '@/features/leave/schemas';

describe('domain schemas', () => {
  it('accepts a valid employee', () => { expect(employeeSchema.safeParse({ firstName: 'Maya', lastName: 'Patel', email: 'maya@example.com', department: 'Engineering', role: 'VP Engineering' }).success).toBe(true); });
  it('rejects an invalid employee email', () => { expect(employeeSchema.safeParse({ firstName: 'Maya', lastName: 'Patel', email: 'bad', department: 'Engineering', role: 'VP Engineering' }).success).toBe(false); });
  it('rejects a leave request whose end is before its start', () => { expect(leaveRequestSchema.safeParse({ employeeId: '00000000-0000-0000-0000-000000000000', startsAt: '2024-12-20', endsAt: '2024-12-19' }).success).toBe(false); });
});
