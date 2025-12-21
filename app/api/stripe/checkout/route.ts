import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPriceId } from '@/lib/stripe'
import { prisma } from '@/lib/db'
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
        email: true,
        name: true,
        stripeCustomerId: true,
        subscriptionTier: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse request body
    const { priceId, tier, interval, quantity = 1, successUrl, cancelUrl } = await request.json()

    // Validate required fields
    if (!priceId && (!tier || !interval)) {
      return NextResponse.json({
        error: 'Either priceId or tier+interval must be provided'
      }, { status: 400 })
    }

    // Validate quantity based on tier
    if (tier === 'TEAM' && quantity < 10) {
      return NextResponse.json({
        error: 'Team plan requires a minimum of 10 seats'
      }, { status: 400 })
    }

    if (quantity < 1) {
      return NextResponse.json({
        error: 'Quantity must be at least 1'
      }, { status: 400 })
    }

    // Determine final price ID
    const finalPriceId = priceId || getPriceId(tier as 'PRO' | 'TEAM', interval as 'monthly' | 'annual')

    if (!finalPriceId) {
      console.error('No price ID found for tier and interval:', { tier, interval })
      return NextResponse.json({
        error: 'Invalid subscription tier or price ID not found'
      }, { status: 400 })
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
          firebaseUid: firebaseUid
        }
      })
      customerId = customer.id

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Create Stripe checkout session
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: finalPriceId,
            quantity,
          },
        ],
        success_url: successUrl || `${request.nextUrl.origin}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${request.nextUrl.origin}/billing?canceled=true`,
        metadata: {
          userId: user.id,
          firebaseUid: firebaseUid,
          tier: tier || '',
          interval: interval || ''
        },
        subscription_data: {
          metadata: {
            userId: user.id,
            firebaseUid: firebaseUid
          }
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      })

      return NextResponse.json({
        url: session.url,
        sessionId: session.id
      })
    } catch (stripeError) {
      console.error('Stripe session creation failed:', stripeError)
      throw stripeError
    }

  } catch (error) {
    console.error('Stripe checkout error:', error)

    return NextResponse.json({
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error && typeof error === 'object' && 'type' in error ? (error as any).type : undefined
    }, { status: 500 })
  }
}

// GET endpoint to retrieve checkout session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      id: session.id,
      status: session.status,
      customer: session.customer,
      subscription: session.subscription,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata
    })

  } catch (error) {
    console.error('Stripe session retrieval error:', error)
    return NextResponse.json({
      error: 'Failed to retrieve session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
