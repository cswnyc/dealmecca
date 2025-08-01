import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
    success: true,
    deployment: 'active'
  })
} 