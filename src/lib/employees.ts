import type { Department, EmployeeDraft } from './types';
import { newId } from './utils';

/** Returns the department list including `draft.department`, reusing the existing spelling if present. */
export function withDepartment(departments: Department[], draft: EmployeeDraft): { departments: Department[]; draft: EmployeeDraft } {
  const match = departments.find((d) => d.name.toLowerCase() === draft.department.toLowerCase());
  if (match) return { departments, draft: { ...draft, department: match.name } };
  return { departments: [...departments, { id: newId(), name: draft.department }], draft };
}
