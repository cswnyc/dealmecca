import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Analytics contacts feature temporarily disabled during deployment' },
    { status: 501 }
  );
}