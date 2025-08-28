import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { getStripe, getTierFromPrice } from '../../../lib/stripe';
import { prisma } from '../../../lib/db';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');
  
  if (!signature) {
    console.error('Missing stripe-signature header');
    return new Response('Missing signature', { status: 400 });
  }
  
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return new Response('Webhook secret not configured', { status: 500 });
  }
  
  let event: Stripe.Event;
  
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`, {
      status: 400,
    });
  }
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return new Response('Success', { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response('Webhook handler failed', { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== 'subscription' || !session.subscription || !session.customer) {
    console.log('Skipping non-subscription checkout session');
    return;
  }
  
  const stripe = getStripe();
  const ownerId = session.metadata?.ownerId;
  
  if (!ownerId) {
    console.error('No ownerId in session metadata');
    return;
  }
  
  // Get the subscription from Stripe to get pricing info
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const priceId = subscription.items.data[0]?.price?.id;
  
  if (!priceId) {
    console.error('No price ID found in subscription');
    return;
  }
  
  // Get price details to determine tier
  const price = await stripe.prices.retrieve(priceId);
  const tier = getTierFromPrice(price);
  
  if (!tier) {
    console.error('Could not determine tier from price:', price.id);
    return;
  }
  
  // Create or update subscription record
  await prisma.subscription.upsert({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    create: {
      ownerId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      tier,
      status: subscription.status,
      start: new Date(subscription.current_period_start * 1000),
      end: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000) 
        : null,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      tier,
      status: subscription.status,
      start: new Date(subscription.current_period_start * 1000),
      end: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000) 
        : null,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
  
  console.log(`Subscription created/updated for owner ${ownerId}, tier: ${tier}, status: ${subscription.status}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) {
    console.log('Skipping invoice without subscription');
    return;
  }
  
  // Ensure subscription status is active
  await prisma.subscription.updateMany({
    where: {
      stripeSubscriptionId: invoice.subscription as string,
    },
    data: {
      status: 'active',
    },
  });
  
  console.log(`Payment succeeded for subscription: ${invoice.subscription}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripe = getStripe();
  const priceId = subscription.items.data[0]?.price?.id;
  
  if (!priceId) {
    console.error('No price ID found in updated subscription');
    return;
  }
  
  // Get price details to determine tier
  const price = await stripe.prices.retrieve(priceId);
  const tier = getTierFromPrice(price);
  
  if (!tier) {
    console.error('Could not determine tier from price:', price.id);
    return;
  }
  
  // Update subscription record
  await prisma.subscription.updateMany({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      tier,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      end: subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000)
        : subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000) 
        : null,
    },
  });
  
  console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Update subscription record to mark as canceled
  await prisma.subscription.updateMany({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      status: 'canceled',
      end: new Date(subscription.canceled_at ? subscription.canceled_at * 1000 : Date.now()),
    },
  });
  
  console.log(`Subscription canceled: ${subscription.id}`);
}