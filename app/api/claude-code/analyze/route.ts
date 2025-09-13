import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Claude Code analyze feature temporarily disabled during deployment' },
    { status: 501 }
  );
}