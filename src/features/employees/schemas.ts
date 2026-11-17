import { z } from 'zod';
export const employeeSchema = z.object({ firstName:z.string().min(1), lastName:z.string().min(1), email:z.email(), department:z.string().min(1), role:z.string().min(1) });
export type EmployeeInput = z.infer<typeof employeeSchema>;
