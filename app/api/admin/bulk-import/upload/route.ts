import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'This API endpoint is temporarily disabled during system optimization',
    message: 'Please try again later or use alternative features'
  }, { status: 503 })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'This API endpoint is temporarily disabled during system optimization',
    message: 'Please try again later or use alternative features'
  }, { status: 503 })
}
