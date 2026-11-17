'use server';
import { employeeSchema, type EmployeeInput } from '../schemas';
export async function saveEmployee(input: EmployeeInput): Promise<{ ok: true; employee: EmployeeInput }> { const employee = employeeSchema.parse(input); return { ok: true, employee }; }
