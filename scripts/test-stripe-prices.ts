import Stripe from 'stripe'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

const PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  PRO_ANNUAL: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
  TEAM_MONTHLY: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID!,
  TEAM_ANNUAL: process.env.STRIPE_TEAM_ANNUAL_PRICE_ID!,
}

async function testPriceIds() {
  console.log('\n🔍 Testing Stripe Price IDs...\n')

  for (const [key, priceId] of Object.entries(PRICE_IDS)) {
    try {
      console.log(`Testing ${key}: ${priceId}`)

      if (!priceId) {
        console.error(`  ❌ Missing price ID for ${key}\n`)
        continue
      }

      const price = await stripe.prices.retrieve(priceId)

      console.log(`  ✅ Valid price ID`)
      console.log(`  💰 Amount: $${(price.unit_amount || 0) / 100}`)
      console.log(`  🔄 Recurring: ${price.recurring?.interval || 'N/A'}`)
      console.log(`  📦 Product: ${price.product}`)
      console.log(`  🟢 Active: ${price.active}`)

      if (!price.active) {
        console.warn(`  ⚠️  Warning: This price is inactive!`)
      }

      console.log('')
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}\n`)
    }
  }
}

testPriceIds().catch(console.error)
