import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ 
    error: 'Forum post tags temporarily disabled for deployment' 
  }, { status: 501 });
}