import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions)
    
    // Get cookies from request
    const cookies = request.cookies.getAll()
    const sessionCookies = cookies.filter(cookie => 
      cookie.name.includes('next-auth') || 
      cookie.name.includes('session')
    )
    
    // Get headers
    const relevantHeaders = {
      host: request.headers.get('host'),
      'user-agent': request.headers.get('user-agent'),
      cookie: request.headers.get('cookie'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    }
    
    return NextResponse.json({
      session: session || null,
      hasSession: !!session,
      sessionCookies,
      allCookies: cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })),
      headers: relevantHeaders,
      nodeEnv: process.env.NODE_ENV,
      nextauthUrl: process.env.NEXTAUTH_URL,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      session: null,
      hasSession: false,
    })
  }
} 