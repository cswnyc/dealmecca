import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Claude Code suggestions feature temporarily disabled during deployment' },
    { status: 501 }
  );
}