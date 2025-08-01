import Stripe from 'stripe'

// Lazy initialization - only create Stripe instance when actually needed
let stripeInstance: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
      typescript: true,
    })
  }
  return stripeInstance
}

// Export stripe as a getter function that initializes on first use
export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    return getStripe()[prop as keyof Stripe]
  }
})

// Stripe Price IDs from environment
export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
  PRO_ANNUAL: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || '',
  TEAM_MONTHLY: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID || '',
  TEAM_ANNUAL: process.env.STRIPE_TEAM_ANNUAL_PRICE_ID || '',
}

// Subscription tier mapping
export const PRICE_TO_TIER: Record<string, 'PRO' | 'TEAM'> = {
  [STRIPE_PRICES.PRO_MONTHLY]: 'PRO',
  [STRIPE_PRICES.PRO_ANNUAL]: 'PRO',
  [STRIPE_PRICES.TEAM_MONTHLY]: 'TEAM',
  [STRIPE_PRICES.TEAM_ANNUAL]: 'TEAM',
}

// Utility function to get price by tier and interval
export function getPriceId(tier: 'PRO' | 'TEAM', interval: 'monthly' | 'annual'): string {
  const priceKey = `${tier}_${interval.toUpperCase()}` as keyof typeof STRIPE_PRICES
  return STRIPE_PRICES[priceKey]
}

// Subscription limits by tier
export const SUBSCRIPTION_LIMITS = {
  FREE: {
    searches: 10,
    searchesPerMonth: 10,
    canExportData: false,
    canAccessPremiumForum: false,
    canDirectMessage: false,
    prioritySupport: false,
  },
  PRO: {
    searches: -1, // Unlimited
    searchesPerMonth: -1, // Unlimited
    canExportData: true,
    canAccessPremiumForum: true,
    canDirectMessage: true,
    prioritySupport: true,
  },
  TEAM: {
    searches: -1, // Unlimited
    searchesPerMonth: -1, // Unlimited
    canExportData: true,
    canAccessPremiumForum: true,
    canDirectMessage: true,
    prioritySupport: true,
    teamAnalytics: true,
    userManagement: true,
    customIntegrations: true,
  },
} as const

// Helper function to check if user has access to a feature
export function hasFeatureAccess(
  userTier: 'FREE' | 'PRO' | 'TEAM',
  feature: keyof typeof SUBSCRIPTION_LIMITS.PRO
): boolean {
  const tierLimits = SUBSCRIPTION_LIMITS[userTier]
  return feature in tierLimits ? (tierLimits as any)[feature] : false
}

// Helper function to check search limits
export function canPerformSearch(userTier: 'FREE' | 'PRO' | 'TEAM', currentUsage: number): boolean {
  const limit = SUBSCRIPTION_LIMITS[userTier].searches
  return limit === -1 || currentUsage < limit
} 