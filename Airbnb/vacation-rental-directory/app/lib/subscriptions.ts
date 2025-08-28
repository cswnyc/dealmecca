import { prisma } from './db';
import { Tier } from '@prisma/client';

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete';

export interface ActiveSubscription {
  id: string;
  tier: Tier;
  status: string;
  start: Date | null;
  end: Date | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
}

export async function getActiveSubscription(ownerId: string): Promise<ActiveSubscription | null> {
  const now = new Date();
  
  const subscription = await prisma.subscription.findFirst({
    where: {
      ownerId,
      status: 'active',
      OR: [
        { start: null }, // No start date set
        { start: { lte: now } }, // Started
      ],
      AND: [
        {
          OR: [
            { end: null }, // Never expires
            { end: { gte: now } }, // Not yet expired
          ],
        },
      ],
    },
    orderBy: {
      start: 'desc',
    },
  });
  
  return subscription;
}

export async function ownerCurrentTier(ownerId: string): Promise<Tier | null> {
  const subscription = await getActiveSubscription(ownerId);
  return subscription?.tier || null;
}

export async function requireActiveSub(ownerId: string): Promise<ActiveSubscription> {
  const subscription = await getActiveSubscription(ownerId);
  
  if (!subscription) {
    throw new Error('Active subscription required. Please subscribe to continue.');
  }
  
  return subscription;
}

export async function hasActiveSub(ownerId: string): Promise<boolean> {
  const subscription = await getActiveSubscription(ownerId);
  return !!subscription;
}

export function getTierDisplayName(tier: Tier): string {
  switch (tier) {
    case 'BRONZE':
      return 'Bronze Plan';
    case 'SILVER':
      return 'Silver Plan';
    case 'GOLD':
      return 'Gold Plan';
    case 'PLATINUM':
      return 'Platinum Plan';
    default:
      return 'Unknown Plan';
  }
}

export function getTierFeatures(tier: Tier): string[] {
  switch (tier) {
    case 'BRONZE':
      return ['Up to 3 listings', 'Basic support', 'Standard visibility'];
    case 'SILVER':
      return ['Up to 10 listings', 'Priority support', 'Enhanced visibility', 'Basic analytics'];
    case 'GOLD':
      return ['Up to 25 listings', 'Priority support', 'Premium visibility', 'Advanced analytics', 'AI descriptions'];
    case 'PLATINUM':
      return ['Unlimited listings', '24/7 support', 'Maximum visibility', 'Full analytics suite', 'AI features', 'Custom branding'];
    default:
      return [];
  }
}

export function getTierPrice(tier: Tier): { monthly: number; annual: number } {
  switch (tier) {
    case 'BRONZE':
      return { monthly: 29, annual: 290 };
    case 'SILVER':
      return { monthly: 59, annual: 590 };
    case 'GOLD':
      return { monthly: 99, annual: 990 };
    case 'PLATINUM':
      return { monthly: 199, annual: 1990 };
    default:
      return { monthly: 0, annual: 0 };
  }
}