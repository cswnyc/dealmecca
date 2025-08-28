'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getStripe, getPriceIdForTier } from '../../lib/stripe';
import { prisma } from '../../lib/db';

// Mock owner ID for demo - in real app, get from session
const DEMO_OWNER_ID = 'demo-owner-1';

const tierSchema = z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']);

export async function createCheckoutSession(tier: string) {
  const validatedTier = tierSchema.parse(tier);
  
  try {
    const stripe = getStripe();
    const priceId = await getPriceIdForTier(validatedTier);
    
    // Get or create owner profile with Stripe customer
    let ownerProfile = await prisma.ownerProfile.findUnique({
      where: { id: DEMO_OWNER_ID },
      include: { user: true },
    });
    
    if (!ownerProfile) {
      throw new Error('Owner profile not found');
    }
    
    // Create or get Stripe customer
    let customerId = ownerProfile.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: ownerProfile.user.email,
        name: ownerProfile.user.name || ownerProfile.businessName || undefined,
        metadata: {
          ownerId: ownerProfile.id,
        },
      });
      
      customerId = customer.id;
      
      // Update owner profile with customer ID
      await prisma.ownerProfile.update({
        where: { id: DEMO_OWNER_ID },
        data: { stripeCustomerId: customerId },
      });
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/owner/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/owner/billing?canceled=1`,
      metadata: {
        ownerId: DEMO_OWNER_ID,
        tier: validatedTier,
      },
      subscription_data: {
        metadata: {
          ownerId: DEMO_OWNER_ID,
          tier: validatedTier,
        },
      },
    });
    
    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }
    
    redirect(session.url);
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    throw new Error('Failed to create checkout session. Please try again.');
  }
}

export async function createPortalSession() {
  try {
    const stripe = getStripe();
    
    // Get owner profile with Stripe customer ID
    const ownerProfile = await prisma.ownerProfile.findUnique({
      where: { id: DEMO_OWNER_ID },
    });
    
    if (!ownerProfile?.stripeCustomerId) {
      throw new Error('No Stripe customer found. Please subscribe first.');
    }
    
    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: ownerProfile.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/owner/billing`,
    });
    
    redirect(session.url);
  } catch (error) {
    console.error('Portal session creation failed:', error);
    throw new Error('Failed to open billing portal. Please try again.');
  }
}