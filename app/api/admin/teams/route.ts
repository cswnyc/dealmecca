import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Teams management feature temporarily disabled during deployment' },
    { status: 501 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Teams management feature temporarily disabled during deployment' },
    { status: 501 }
  );
}