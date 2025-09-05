// Setup Stripe Products and Prices
// First: npm install stripe
// Then: STRIPE_SECRET_KEY=sk_test_... node setup-stripe-products.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  console.log('🏗️  Setting up DealMecca Stripe products...\n');

  try {
    // Create DealMecca product
    console.log('1️⃣ Creating DealMecca product...');
    const proProduct = await stripe.products.create({
      name: 'DealMecca',
      description: 'Unlimited searches, advanced ROI tracking, full event networking, premium forum access, data export, priority support',
      images: ['https://your-domain.com/logo.png'], // Optional: Add your logo URL
      metadata: {
        tier: 'PRO',
        features: 'unlimited_searches,advanced_roi,event_networking,premium_forum,data_export,priority_support'
      }
    });
    console.log('✅ Pro product created:', proProduct.id);

    // Create Pro prices
    console.log('\n2️⃣ Creating Pro prices...');
    const proMonthly = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 9900, // $99.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'Pro Monthly',
      metadata: {
        tier: 'PRO',
        interval: 'monthly'
      }
    });
    console.log('✅ Pro Monthly price created:', proMonthly.id);

    const proAnnual = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 99000, // $990.00 (17% discount)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      nickname: 'Pro Annual',
      metadata: {
        tier: 'PRO',
        interval: 'annual'
      }
    });
    console.log('✅ Pro Annual price created:', proAnnual.id);

    // Create DealMecca Team product
    console.log('\n3️⃣ Creating DealMecca Team product...');
    const teamProduct = await stripe.products.create({
      name: 'DealMecca Team',
      description: 'Everything in Pro for up to 5 users, team analytics, shared goal tracking, admin controls, bulk operations, custom integrations',
      images: ['https://your-domain.com/logo.png'], // Optional: Add your logo URL
      metadata: {
        tier: 'TEAM',
        max_users: '5',
        features: 'all_pro_features,team_analytics,shared_goals,admin_controls,bulk_operations,custom_integrations'
      }
    });
    console.log('✅ Team product created:', teamProduct.id);

    // Create Team prices
    console.log('\n4️⃣ Creating Team prices...');
    const teamMonthly = await stripe.prices.create({
      product: teamProduct.id,
      unit_amount: 29900, // $299.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'Team Monthly',
      metadata: {
        tier: 'TEAM',
        interval: 'monthly'
      }
    });
    console.log('✅ Team Monthly price created:', teamMonthly.id);

    const teamAnnual = await stripe.prices.create({
      product: teamProduct.id,
      unit_amount: 299000, // $2990.00 (17% discount)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      nickname: 'Team Annual',
      metadata: {
        tier: 'TEAM',
        interval: 'annual'
      }
    });
    console.log('✅ Team Annual price created:', teamAnnual.id);

    // Output env variables
    console.log('\n🎯 SUCCESS! Copy these to your .env file:\n');
    console.log('# Stripe Price IDs');
    console.log(`STRIPE_PRO_MONTHLY_PRICE_ID="${proMonthly.id}"`);
    console.log(`STRIPE_PRO_ANNUAL_PRICE_ID="${proAnnual.id}"`);
    console.log(`STRIPE_TEAM_MONTHLY_PRICE_ID="${teamMonthly.id}"`);
    console.log(`STRIPE_TEAM_ANNUAL_PRICE_ID="${teamAnnual.id}"`);

    console.log('\n📋 Summary:');
    console.log(`Pro Monthly: $99/month (${proMonthly.id})`);
    console.log(`Pro Annual: $990/year (${proAnnual.id})`);
    console.log(`Team Monthly: $299/month (${teamMonthly.id})`);
    console.log(`Team Annual: $2990/year (${teamAnnual.id})`);

  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error.message);
    console.log('\nMake sure you:');
    console.log('1. Have set STRIPE_SECRET_KEY environment variable');
    console.log('2. Are using a valid Stripe test secret key (starts with sk_test_)');
    console.log('3. Have installed stripe: npm install stripe');
  }
}

if (require.main === module) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ Please set STRIPE_SECRET_KEY environment variable');
    console.log('Usage: STRIPE_SECRET_KEY=sk_test_... node setup-stripe-products.js');
    process.exit(1);
  }
  
  setupStripeProducts().catch(console.error);
} 