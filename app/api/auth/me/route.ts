import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Return user data from session
    const user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      isActive: true,
      subscriptionTier: session.user.subscriptionTier || 'FREE'
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('❌ Error in /api/auth/me:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}