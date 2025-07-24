import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, STRIPE_PRICES, getPriceId } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier, interval = 'monthly', successUrl, cancelUrl } = body

    // Validate input
    if (!tier || !['PRO', 'TEAM'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 })
    }

    if (!['monthly', 'annual'].includes(interval)) {
      return NextResponse.json({ error: 'Invalid billing interval' }, { status: 400 })
    }

    // Get the price ID for the selected tier and interval
    const priceId = getPriceId(tier, interval)
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured for this plan' },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has an active subscription
    if (user.subscriptionTier !== 'FREE') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      )
    }

    let customerId = user.stripeCustomerId

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: user.id,
        },
      })

      customerId = customer.id

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/pricing`,
      metadata: {
        userId: user.id,
        tier,
        interval,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier,
        },
      },
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 