import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Export feature temporarily disabled during deployment migration' },
    { status: 501 }
  );
}