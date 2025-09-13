import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Publisher mentions temporarily disabled for deployment' 
  }, { status: 501 });
}