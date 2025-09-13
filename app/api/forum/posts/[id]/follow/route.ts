import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Forum follows temporarily disabled during deployment' }, { status: 501 });
}