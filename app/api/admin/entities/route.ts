import { NextRequest, NextResponse } from 'next/server';

// Temporarily disabled for deployment - complex entity operations
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Entity operations temporarily disabled for deployment' 
  }, { status: 501 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Entity operations temporarily disabled for deployment' 
  }, { status: 501 });
}