import { NextResponse } from 'next/server';
import { leaveRequestSchema } from '@/features/leave/schemas';
export async function POST(request: Request): Promise<NextResponse> { const parsed = leaveRequestSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 }); return NextResponse.json({ ok: true, request: parsed.data }, { status: 201 }); }
