'use server';
import { leaveRequestSchema, type LeaveRequestInput } from '../schemas';
export async function requestLeave(input: LeaveRequestInput): Promise<{ok:boolean}> { leaveRequestSchema.parse(input); return {ok:true}; }
