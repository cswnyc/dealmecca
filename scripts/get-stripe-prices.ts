import Stripe from 'stripe'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

async function getAllPrices() {
  console.log('\n🔍 Fetching all Stripe prices...\n')

  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 100,
    })

    console.log(`Found ${prices.data.length} active prices:\n`)

    for (const price of prices.data) {
      const product = price.product as Stripe.Product
      const amount = (price.unit_amount || 0) / 100
      const interval = price.recurring?.interval || 'one-time'

      console.log(`📦 Product: ${product.name}`)
      console.log(`   💰 Amount: $${amount}`)
      console.log(`   🔄 Interval: ${interval}`)
      console.log(`   🔑 Price ID: ${price.id}`)
      console.log(`   🟢 Active: ${price.active}`)
      console.log('')
    }

    // Group by product
    console.log('\n' + '='.repeat(60))
    console.log('\n📋 Environment Variable Format:\n')

    const pricesByProduct: { [key: string]: Stripe.Price[] } = {}
    for (const price of prices.data) {
      const product = price.product as Stripe.Product
      if (!pricesByProduct[product.name]) {
        pricesByProduct[product.name] = []
      }
      pricesByProduct[product.name].push(price)
    }

    for (const [productName, productPrices] of Object.entries(pricesByProduct)) {
      console.log(`\n# ${productName}`)
      for (const price of productPrices) {
        const amount = (price.unit_amount || 0) / 100
        const interval = price.recurring?.interval || 'one-time'
        const envVarName = productName.toUpperCase().replace(/\s+/g, '_') + '_' + interval.toUpperCase()

        if (interval === 'month') {
          console.log(`STRIPE_${envVarName}LY_PRICE_ID=${price.id}  # $${amount}/month`)
        } else if (interval === 'year') {
          console.log(`STRIPE_${envVarName}LY_PRICE_ID=${price.id}  # $${amount}/year`)
        }
      }
    }

    console.log('\n')
  } catch (error: any) {
    console.error('❌ Error fetching prices:', error.message)
    process.exit(1)
  }
}

getAllPrices()
