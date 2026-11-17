import { z } from 'zod';
export const leaveRequestSchema = z.object({ employeeId:z.uuid(), startsAt:z.coerce.date(), endsAt:z.coerce.date(), reason:z.string().max(500).optional() }).refine((value)=>value.endsAt>=value.startsAt,{message:'End date must be on or after start date',path:['endsAt']});
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
