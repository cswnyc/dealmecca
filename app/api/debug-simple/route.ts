import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Simple diagnostic endpoint working',
    timestamp: new Date().toISOString(),
    status: 'success'
  })
}

export async function POST() {
  return NextResponse.json({
    message: 'POST request working',
    timestamp: new Date().toISOString(),
    status: 'success'
  })
} 