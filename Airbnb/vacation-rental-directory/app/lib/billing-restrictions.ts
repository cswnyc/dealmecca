import { Tier } from '@prisma/client';
import { getActiveSubscription } from './subscriptions';

export class BillingRestrictionError extends Error {
  constructor(
    message: string,
    public requiredTier: Tier,
    public currentTier: Tier | null,
    public feature: string
  ) {
    super(message);
    this.name = 'BillingRestrictionError';
  }
}

export interface TierLimits {
  maxListings: number;
  maxPhotosPerListing: number;
  canUseAIFeatures: boolean;
  canUseAdvancedAnalytics: boolean;
  canUseCustomBranding: boolean;
  supportLevel: 'basic' | 'priority' | '24/7';
  maxInquiriesPerMonth: number;
}

export function getTierLimits(tier: Tier | null): TierLimits {
  switch (tier) {
    case 'BRONZE':
      return {
        maxListings: 3,
        maxPhotosPerListing: 10,
        canUseAIFeatures: false,
        canUseAdvancedAnalytics: false,
        canUseCustomBranding: false,
        supportLevel: 'basic',
        maxInquiriesPerMonth: 50,
      };
    case 'SILVER':
      return {
        maxListings: 10,
        maxPhotosPerListing: 15,
        canUseAIFeatures: false,
        canUseAdvancedAnalytics: true,
        canUseCustomBranding: false,
        supportLevel: 'priority',
        maxInquiriesPerMonth: 200,
      };
    case 'GOLD':
      return {
        maxListings: 25,
        maxPhotosPerListing: 25,
        canUseAIFeatures: true,
        canUseAdvancedAnalytics: true,
        canUseCustomBranding: false,
        supportLevel: 'priority',
        maxInquiriesPerMonth: 500,
      };
    case 'PLATINUM':
      return {
        maxListings: -1, // unlimited
        maxPhotosPerListing: 50,
        canUseAIFeatures: true,
        canUseAdvancedAnalytics: true,
        canUseCustomBranding: true,
        supportLevel: '24/7',
        maxInquiriesPerMonth: -1, // unlimited
      };
    default:
      // No subscription - very limited
      return {
        maxListings: 0,
        maxPhotosPerListing: 5,
        canUseAIFeatures: false,
        canUseAdvancedAnalytics: false,
        canUseCustomBranding: false,
        supportLevel: 'basic',
        maxInquiriesPerMonth: 5,
      };
  }
}

export async function checkListingLimit(ownerId: string, currentListingCount: number): Promise<void> {
  const subscription = await getActiveSubscription(ownerId);
  const limits = getTierLimits(subscription?.tier || null);
  
  if (limits.maxListings !== -1 && currentListingCount >= limits.maxListings) {
    throw new BillingRestrictionError(
      `You've reached your listing limit of ${limits.maxListings}. Upgrade your plan to add more listings.`,
      subscription?.tier === 'BRONZE' ? 'SILVER' : 
      subscription?.tier === 'SILVER' ? 'GOLD' : 'PLATINUM',
      subscription?.tier || null,
      'Additional listings'
    );
  }
}

export async function checkAIFeatureAccess(ownerId: string, feature: string): Promise<void> {
  const subscription = await getActiveSubscription(ownerId);
  const limits = getTierLimits(subscription?.tier || null);
  
  if (!limits.canUseAIFeatures) {
    throw new BillingRestrictionError(
      `${feature} requires a Gold or Platinum plan. Upgrade to access AI-powered features.`,
      'GOLD',
      subscription?.tier || null,
      feature
    );
  }
}

export async function checkAnalyticsAccess(ownerId: string): Promise<void> {
  const subscription = await getActiveSubscription(ownerId);
  const limits = getTierLimits(subscription?.tier || null);
  
  if (!limits.canUseAdvancedAnalytics) {
    throw new BillingRestrictionError(
      'Advanced analytics requires a Silver plan or higher. Upgrade to view detailed insights.',
      'SILVER',
      subscription?.tier || null,
      'Advanced analytics'
    );
  }
}

export async function checkPhotoLimit(ownerId: string, currentPhotoCount: number): Promise<void> {
  const subscription = await getActiveSubscription(ownerId);
  const limits = getTierLimits(subscription?.tier || null);
  
  if (currentPhotoCount >= limits.maxPhotosPerListing) {
    throw new BillingRestrictionError(
      `You've reached your photo limit of ${limits.maxPhotosPerListing} per listing. Upgrade for more photos.`,
      subscription?.tier === 'BRONZE' ? 'SILVER' : 
      subscription?.tier === 'SILVER' ? 'GOLD' : 'PLATINUM',
      subscription?.tier || null,
      'Additional photos'
    );
  }
}

export async function requireMinimumTier(ownerId: string, minTier: Tier, feature: string): Promise<void> {
  const subscription = await getActiveSubscription(ownerId);
  const currentTier = subscription?.tier;
  
  const tierOrder = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
  const currentIndex = currentTier ? tierOrder.indexOf(currentTier) : -1;
  const requiredIndex = tierOrder.indexOf(minTier);
  
  if (currentIndex < requiredIndex) {
    throw new BillingRestrictionError(
      `${feature} requires ${minTier} tier or higher. ${currentTier ? `You're currently on ${currentTier}.` : 'Please subscribe to a plan.'}`,
      minTier,
      currentTier || null,
      feature
    );
  }
}

// Helper function to handle billing restriction errors in UI components
export function isBillingRestrictionError(error: unknown): error is BillingRestrictionError {
  return error instanceof BillingRestrictionError;
}