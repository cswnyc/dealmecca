import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'working',
    timestamp: new Date().toISOString(),
    message: 'Simple test endpoint is working',
    deployment: 'success'
  })
} 