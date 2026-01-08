import { NextRequest, NextResponse } from 'next/server'
import { subscribeUserToNewsletter } from '@/lib/convertkit'
import { auth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, source = 'website' } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if user is authenticated to get their tier
    let userTier: 'FREE' | 'PRO' | 'TEAM' = 'FREE'
    const authHeader = request.headers.get('authorization')

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const decodedToken = await auth.verifyIdToken(token)

        const user = await prisma.user.findUnique({
          where: { firebaseUid: decodedToken.uid },
          select: { subscriptionTier: true }
        })

        if (user) {
          userTier = user.subscriptionTier as 'FREE' | 'PRO' | 'TEAM'
        }
      } catch (error) {
        // Continue as anonymous user if token is invalid
        console.log('Invalid token for newsletter subscription, continuing as anonymous')
      }
    }

    // Subscribe to ConvertKit
    const subscriber = await subscribeUserToNewsletter(email, firstName, userTier)

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email_address,
        state: subscriber.state
      }
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)

    // Handle specific ConvertKit errors
    if (error instanceof Error && error.message.includes('already subscribed')) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter'
      })
    }

    return NextResponse.json({
      error: 'Failed to subscribe to newsletter',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Newsletter subscription API',
    endpoints: {
      'POST /api/newsletter/subscribe': 'Subscribe to newsletter',
      'DELETE /api/newsletter/unsubscribe': 'Unsubscribe from newsletter'
    }
  })
}