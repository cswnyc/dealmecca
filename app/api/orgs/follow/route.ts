import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Follow temporarily disabled during deployment' }, { status: 501 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Follow temporarily disabled during deployment' }, { status: 501 });
}