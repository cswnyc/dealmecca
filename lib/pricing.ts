/**
 * Centralized pricing configuration for DealMecca
 * All pricing amounts and features in one place
 */

export const TEAM_MIN_SEATS = 10;

export type BillingPeriod = 'monthly' | 'yearly';
export type PlanKey = 'free' | 'pro' | 'team';

interface PricingInfo {
  price: number;
  label: string;
  total?: number;
  note?: string;
}

interface PlanConfig {
  name: string;
  tagline: string;
  featured?: boolean;
  monthly: PricingInfo;
  yearly: PricingInfo;
  features: string[];
  featuresHeading?: string;
  cta: {
    text: string;
    variant: 'gradient' | 'dark' | 'disabled';
  };
}

export const PRICING: Record<PlanKey, PlanConfig> = {
  free: {
    name: 'Free',
    tagline: 'Get started for free',
    monthly: { price: 0, label: '/month' },
    yearly: { price: 0, label: '/month' },
    features: [
      'Basic company profiles',
      'Community forum access',
      'Email support (48hr)',
    ],
    featuresHeading: "What's included",
    cta: { text: 'Current Plan', variant: 'disabled' },
  },
  pro: {
    name: 'Pro',
    tagline: 'For media professionals',
    featured: true,
    monthly: { price: 29, label: '/month' },
    yearly: {
      price: 24,
      label: '/month',
      total: 288,
      note: 'Billed annually ($288/year)',
    },
    features: [
      'Unlimited company & contact searches',
      'Advanced filtering & insights',
      'Premium forum access',
      'Priority support',
    ],
    featuresHeading: 'All Free features, plus',
    cta: { text: 'Start Free Trial', variant: 'gradient' },
  },
  team: {
    name: 'Team',
    tagline: 'For agencies & teams',
    monthly: {
      price: 20,
      label: '/user/month',
      note: `Minimum ${TEAM_MIN_SEATS} users ($${20 * TEAM_MIN_SEATS}/mo)`,
    },
    yearly: {
      price: 16,
      label: '/user/month',
      note: `Billed annually ($${16 * 12 * TEAM_MIN_SEATS}/year for ${TEAM_MIN_SEATS} users)`,
    },
    features: [
      'Team performance analytics',
      'User roles & permissions',
      'Dedicated success manager',
      'Custom integrations',
    ],
    featuresHeading: 'All Pro features, plus',
    cta: { text: 'Start Free Trial', variant: 'dark' },
  },
};

/**
 * Get displayed price for a plan in a given billing period
 */
export function getDisplayedPrice(
  planKey: PlanKey,
  billingPeriod: BillingPeriod
): PricingInfo {
  return PRICING[planKey][billingPeriod];
}

/**
 * Calculate total annual cost for Team plan
 */
export function getTeamAnnualTotal(seats: number): number {
  const pricePerUser = PRICING.team.yearly.price;
  return pricePerUser * seats * 12;
}

/**
 * Calculate monthly cost for Team plan
 */
export function getTeamMonthlyTotal(seats: number): number {
  const pricePerUser = PRICING.team.monthly.price;
  return pricePerUser * seats;
}

/**
 * Get savings percentage for yearly billing
 */
export function getYearlySavings(planKey: 'pro' | 'team'): number {
  const monthly = PRICING[planKey].monthly.price;
  const yearly = PRICING[planKey].yearly.price;
  return Math.round(((monthly - yearly) / monthly) * 100);
}
