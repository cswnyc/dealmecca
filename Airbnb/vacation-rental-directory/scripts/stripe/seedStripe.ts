// scripts/stripe/seedStripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is required');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

async function seedStripeProducts() {
  console.log('🏗️ Creating Stripe products and prices...\n');

  // Bronze Tier
  const bronzeProduct = await stripe.products.create({
    name: 'Bronze Tier',
    description: 'Basic listing plan - 1 listing',
    metadata: {
      tier: 'BRONZE',
      maxListings: '1',
      featuredListings: '0',
    },
  });

  const bronzePrice = await stripe.prices.create({
    unit_amount: 2900, // $29.00
    currency: 'usd',
    recurring: { interval: 'month' },
    product: bronzeProduct.id,
    metadata: {
      tier: 'BRONZE',
    },
  });

  console.log(`✅ Bronze: ${bronzeProduct.id} / ${bronzePrice.id}`);

  // Silver Tier
  const silverProduct = await stripe.products.create({
    name: 'Silver Tier',
    description: 'Professional plan - 5 listings, 1 featured',
    metadata: {
      tier: 'SILVER',
      maxListings: '5',
      featuredListings: '1',
    },
  });

  const silverPrice = await stripe.prices.create({
    unit_amount: 7900, // $79.00
    currency: 'usd',
    recurring: { interval: 'month' },
    product: silverProduct.id,
    metadata: {
      tier: 'SILVER',
    },
  });

  console.log(`✅ Silver: ${silverProduct.id} / ${silverPrice.id}`);

  // Gold Tier
  const goldProduct = await stripe.products.create({
    name: 'Gold Tier',
    description: 'Business plan - 15 listings, 3 featured',
    metadata: {
      tier: 'GOLD',
      maxListings: '15',
      featuredListings: '3',
    },
  });

  const goldPrice = await stripe.prices.create({
    unit_amount: 14900, // $149.00
    currency: 'usd',
    recurring: { interval: 'month' },
    product: goldProduct.id,
    metadata: {
      tier: 'GOLD',
    },
  });

  console.log(`✅ Gold: ${goldProduct.id} / ${goldPrice.id}`);

  // Platinum Tier
  const platinumProduct = await stripe.products.create({
    name: 'Platinum Tier',
    description: 'Enterprise plan - Unlimited listings, 10 featured',
    metadata: {
      tier: 'PLATINUM',
      maxListings: '999',
      featuredListings: '10',
    },
  });

  const platinumPrice = await stripe.prices.create({
    unit_amount: 29900, // $299.00
    currency: 'usd',
    recurring: { interval: 'month' },
    product: platinumProduct.id,
    metadata: {
      tier: 'PLATINUM',
    },
  });

  console.log(`✅ Platinum: ${platinumProduct.id} / ${platinumPrice.id}`);

  console.log('\n🌟 Stripe products and prices created successfully!');
  console.log('\n📝 Add these to your .env file:');
  console.log(`STRIPE_BRONZE_PRICE_ID=${bronzePrice.id}`);
  console.log(`STRIPE_SILVER_PRICE_ID=${silverPrice.id}`);
  console.log(`STRIPE_GOLD_PRICE_ID=${goldPrice.id}`);
  console.log(`STRIPE_PLATINUM_PRICE_ID=${platinumPrice.id}`);
}

async function main() {
  try {
    await seedStripeProducts();
  } catch (error) {
    console.error('❌ Error seeding Stripe:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { seedStripeProducts };