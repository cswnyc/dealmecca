import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Feature temporarily disabled for deployment' }, { status: 501 });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ error: 'Feature temporarily disabled for deployment' }, { status: 501 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Feature temporarily disabled for deployment' }, { status: 501 });
}