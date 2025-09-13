import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Forum posts temporarily disabled during deployment' }, { status: 501 });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ error: 'Forum posts temporarily disabled during deployment' }, { status: 501 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Forum posts temporarily disabled during deployment' }, { status: 501 });
}