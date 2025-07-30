import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Middleware debug endpoint reached successfully',
      timestamp: new Date().toISOString(),
      headers: {
        userAgent: request.headers.get('user-agent'),
        host: request.headers.get('host'),
        authorization: request.headers.get('authorization') ? 'present' : 'missing'
      },
      cookies: Object.fromEntries(
        request.cookies.getAll().map(cookie => [cookie.name, 'present'])
      )
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 