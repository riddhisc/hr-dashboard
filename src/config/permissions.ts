export const roles = ['admin', 'hr', 'manager', 'employee'] as const;
export type Role = (typeof roles)[number];
export type Permission = 'employees:read' | 'employees:write' | 'leave:approve' | 'leave:request' | 'payroll:read' | 'reports:read';
export const permissions = {
  admin: ['employees:read', 'employees:write', 'leave:approve', 'payroll:read', 'reports:read'],
  hr: ['employees:read', 'employees:write', 'leave:approve', 'payroll:read', 'reports:read'],
  manager: ['employees:read', 'leave:approve', 'reports:read'],
  employee: ['employees:read', 'leave:request'],
} as const satisfies Record<Role, readonly Permission[]>;
export function can(role: Role, permission: Permission): boolean { const granted: readonly Permission[] = permissions[role]; return granted.includes(permission); }
