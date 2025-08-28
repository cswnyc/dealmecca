import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

export function getStripe(): Stripe {
  return stripe;
}

type TierType = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export async function getPriceIdForTier(tier: TierType): Promise<string> {
  const stripe = getStripe();
  
  // First try lookup keys from env
  const lookupKey = process.env[`STRIPE_PRICE_LOOKUP_${tier}`];
  if (lookupKey) {
    try {
      const prices = await stripe.prices.list({
        lookup_keys: [lookupKey],
        active: true,
        limit: 1,
      });
      
      if (prices.data.length > 0) {
        return prices.data[0].id;
      }
    } catch (error) {
      console.warn(`Failed to fetch price by lookup key ${lookupKey}:`, error);
    }
  }
  
  // Fallback to direct price IDs from env
  const priceId = process.env[`STRIPE_PRICE_ID_${tier}`];
  if (priceId) {
    return priceId;
  }
  
  throw new Error(`No Stripe price configured for tier: ${tier}. Set STRIPE_PRICE_LOOKUP_${tier} or STRIPE_PRICE_ID_${tier}`);
}

export function getTierFromPrice(price: Stripe.Price): TierType | null {
  // Try lookup key first
  if (price.lookup_key) {
    const lookupKey = price.lookup_key.toUpperCase();
    if (lookupKey.includes('BRONZE')) return 'BRONZE';
    if (lookupKey.includes('SILVER')) return 'SILVER';
    if (lookupKey.includes('GOLD')) return 'GOLD';
    if (lookupKey.includes('PLATINUM')) return 'PLATINUM';
  }
  
  // Try metadata
  if (price.metadata?.tier) {
    const tier = price.metadata.tier.toUpperCase() as TierType;
    if (['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].includes(tier)) {
      return tier;
    }
  }
  
  // Fallback: check against configured price IDs
  for (const tier of ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const) {
    if (process.env[`STRIPE_PRICE_ID_${tier}`] === price.id) {
      return tier;
    }
  }
  
  return null;
}