import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Import preview temporarily disabled for deployment' 
  }, { status: 501 });
}