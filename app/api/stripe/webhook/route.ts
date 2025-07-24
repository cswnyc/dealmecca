import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, PRICE_TO_TIER } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Processing Stripe webhook:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout completed:', session.id)

  if (!session.customer || !session.subscription) {
    console.error('No customer or subscription in checkout session')
    return
  }

  const userId = session.metadata?.userId
  if (!userId) {
    console.error('No userId in checkout session metadata')
    return
  }

  // Get the subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  const priceId = subscription.items.data[0]?.price.id

  if (!priceId) {
    console.error('No price ID found in subscription')
    return
  }

  const tier = PRICE_TO_TIER[priceId]
  if (!tier) {
    console.error('Unknown price ID:', priceId)
    return
  }

  // Update user and create subscription record
  try {
    await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tier,
          subscriptionStatus: 'ACTIVE',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      })

      // Create subscription record
      await tx.subscription.create({
        data: {
          userId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          status: 'ACTIVE',
          tier,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      })

      // Create payment record
      if (session.payment_intent) {
        await tx.payment.create({
          data: {
            userId,
            stripePaymentIntentId: session.payment_intent as string,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'SUCCEEDED',
            description: `${tier} subscription - ${session.metadata?.interval || 'monthly'}`,
          },
        })
      }
    })

    console.log('Successfully processed checkout completion for user:', userId)
  } catch (error) {
    console.error('Error updating user subscription:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing payment succeeded:', invoice.id)

  if (!(invoice as any).subscription) {
    return
  }

  const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!user) {
    console.error('User not found for subscription:', subscription.id)
    return
  }

  // Create payment record
  await prisma.payment.create({
    data: {
      userId: user.id,
      stripePaymentIntentId: (invoice as any).payment_intent as string,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'SUCCEEDED',
      description: `Subscription renewal - ${invoice.description || ''}`,
    },
  })

  console.log('Payment recorded for user:', user.id)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing payment failed:', invoice.id)

  if (!(invoice as any).subscription) {
    return
  }

  const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!user) {
    console.error('User not found for subscription:', subscription.id)
    return
  }

  // Update subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionStatus: 'PAST_DUE' },
  })

  console.log('Marked user subscription as past due:', user.id)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id)

  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!user) {
    console.error('User not found for subscription:', subscription.id)
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  const tier = priceId ? PRICE_TO_TIER[priceId] : user.subscriptionTier

  // Update user subscription details
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: subscription.status.toUpperCase() as any,
      subscriptionTier: tier || user.subscriptionTier,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })

  console.log('Updated subscription for user:', user.id)
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  console.log('Processing subscription cancelled:', subscription.id)

  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!user) {
    console.error('User not found for subscription:', subscription.id)
    return
  }

  // Update user to free tier
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: 'FREE',
      subscriptionStatus: 'CANCELED',
      stripeSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
  })

  console.log('Cancelled subscription for user:', user.id)
} 