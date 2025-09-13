import { NextRequest, NextResponse } from 'next/server';

// Temporarily disabled for deployment - complex forum post management
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ 
    error: 'Forum post management temporarily disabled for deployment' 
  }, { status: 501 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ 
    error: 'Forum post management temporarily disabled for deployment' 
  }, { status: 501 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ 
    error: 'Forum post management temporarily disabled for deployment' 
  }, { status: 501 });
}