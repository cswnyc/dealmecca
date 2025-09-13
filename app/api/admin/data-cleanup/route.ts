import { NextRequest, NextResponse } from 'next/server';

// Temporarily disabled for deployment - complex data cleanup operations
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Data cleanup operations temporarily disabled for deployment' 
  }, { status: 501 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Data cleanup operations temporarily disabled for deployment' 
  }, { status: 501 });
}