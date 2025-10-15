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
  TEAM_MONTHLY: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID!,
}

async function testCheckoutSession() {
  console.log('\n🔍 Testing Stripe Checkout Session Creation...\n')

  try {
    // Create a test customer
    console.log('1️⃣  Creating test customer...')
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test User',
      metadata: {
        userId: 'test-user-id',
        firebaseUid: 'test-firebase-uid'
      }
    })
    console.log(`   ✅ Customer created: ${customer.id}\n`)

    // Test PRO_MONTHLY checkout
    console.log('2️⃣  Creating PRO_MONTHLY checkout session...')
    try {
      const proSession = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: PRICE_IDS.PRO_MONTHLY,
            quantity: 1,
          },
        ],
        success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://example.com/cancel',
        metadata: {
          userId: 'test-user-id',
          firebaseUid: 'test-firebase-uid',
          tier: 'PRO',
          interval: 'monthly'
        },
        subscription_data: {
          metadata: {
            userId: 'test-user-id',
            firebaseUid: 'test-firebase-uid'
          }
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      })
      console.log(`   ✅ PRO_MONTHLY session created: ${proSession.id}`)
      console.log(`   🔗 URL: ${proSession.url}\n`)
    } catch (error: any) {
      console.error(`   ❌ PRO_MONTHLY session failed: ${error.message}\n`)
      console.error('   Full error:', error)
    }

    // Test TEAM_MONTHLY checkout
    console.log('3️⃣  Creating TEAM_MONTHLY checkout session...')
    try {
      const teamSession = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: PRICE_IDS.TEAM_MONTHLY,
            quantity: 1,
          },
        ],
        success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://example.com/cancel',
        metadata: {
          userId: 'test-user-id',
          firebaseUid: 'test-firebase-uid',
          tier: 'TEAM',
          interval: 'monthly'
        },
        subscription_data: {
          metadata: {
            userId: 'test-user-id',
            firebaseUid: 'test-firebase-uid'
          }
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      })
      console.log(`   ✅ TEAM_MONTHLY session created: ${teamSession.id}`)
      console.log(`   🔗 URL: ${teamSession.url}\n`)
    } catch (error: any) {
      console.error(`   ❌ TEAM_MONTHLY session failed: ${error.message}\n`)
      console.error('   Full error:', error)
    }

    // Clean up test customer
    console.log('4️⃣  Cleaning up test customer...')
    await stripe.customers.del(customer.id)
    console.log(`   ✅ Customer deleted\n`)

    console.log('✨ All tests completed!\n')
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error)
  }
}

testCheckoutSession().catch(console.error)
