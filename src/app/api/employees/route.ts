import { NextResponse } from 'next/server';
import { z } from 'zod';
import { people } from '@/lib/data';
import { employeeSchema } from '@/features/employees/schemas';

const querySchema = z.object({ search: z.string().trim().default('') });
export async function GET(request: Request): Promise<NextResponse> { const url = new URL(request.url); const { search } = querySchema.parse({ search: url.searchParams.get('search') ?? '' }); const records = people.filter((person) => `${person.name} ${person.role} ${person.department}`.toLowerCase().includes(search.toLowerCase())); return NextResponse.json({ records, total: records.length }); }
export async function POST(request: Request): Promise<NextResponse> { const parsed = employeeSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 }); return NextResponse.json({ employee: parsed.data }, { status: 201 }); }
