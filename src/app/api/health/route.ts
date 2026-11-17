import { NextResponse } from 'next/server';
export function GET(): NextResponse<{ status: 'ok'; service: string }> { return NextResponse.json({ status: 'ok', service: 'peopleflow' }); }
