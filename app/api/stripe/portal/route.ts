import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decodedToken = await auth.verifyIdToken(token)
    const firebaseUid = decodedToken.uid

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        stripeCustomerId: true
      }
    })

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({
        error: 'No active subscription found'
      }, { status: 404 })
    }

    const { returnUrl } = await request.json()

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl || `${request.nextUrl.origin}/billing`,
    })

    return NextResponse.json({
      url: portalSession.url
    })

  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.json({
      error: 'Failed to create portal session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}