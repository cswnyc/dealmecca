import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICE_TO_TIER } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { updateUserTierInMailerLite } from '@/lib/mailerlite'
import Stripe from 'stripe'

// Disable body parser for webhook
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('Missing webhook secret')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price.id

    if (!priceId) {
      console.error('No price ID found in subscription')
      return
    }

    // Determine subscription tier from price ID
    const tier = PRICE_TO_TIER[priceId] || 'FREE'

    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error(`User not found for Stripe customer: ${customerId}`)
      return
    }

    // Update user subscription
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      }
    })

    // Update user tier in MailerLite if they have an email
    if (user.email) {
      try {
        await updateUserTierInMailerLite(user.email, tier)
        console.log(`Updated MailerLite tier for user ${user.email}: ${tier}`)
      } catch (error) {
        console.error(`Failed to update MailerLite tier for user ${user.email}:`, error)
        // Don't fail the webhook if MailerLite update fails
      }
    }

    console.log(`Updated subscription for user ${user.id}: ${tier} (${subscription.status})`)

  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error(`User not found for Stripe customer: ${customerId}`)
      return
    }

    // Downgrade user to FREE tier
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: 'FREE',
        subscriptionStatus: 'INACTIVE',
        stripeSubscriptionId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      }
    })

    console.log(`Downgraded user ${user.id} to FREE tier (subscription canceled)`)

  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string

    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error(`User not found for Stripe customer: ${customerId}`)
      return
    }

    // Ensure subscription is active
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'ACTIVE',
      }
    })

    console.log(`Payment succeeded for user ${user.id}`)

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string

    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error(`User not found for Stripe customer: ${customerId}`)
      return
    }

    // Mark subscription as past due
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'PAST_DUE',
      }
    })

    console.log(`Payment failed for user ${user.id} - marked as past due`)

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    if (!subscriptionId) {
      console.log('No subscription ID in checkout session')
      return
    }

    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Handle as subscription update
    await handleSubscriptionUpdate(subscription)

    console.log(`Checkout completed for customer ${customerId}`)

  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}
