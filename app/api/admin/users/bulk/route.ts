import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Feature temporarily disabled for deployment' }, { status: 501 });
}