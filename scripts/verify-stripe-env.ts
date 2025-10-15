/**
 * Verify Stripe environment variables are correctly set
 */

const EXPECTED_KEYS = {
  // Should be LIVE keys (pk_live_ and sk_live_)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Price IDs
  STRIPE_PRO_MONTHLY_PRICE_ID: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
  STRIPE_PRO_ANNUAL_PRICE_ID: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || '',
  STRIPE_TEAM_MONTHLY_PRICE_ID: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID || '',
  STRIPE_TEAM_ANNUAL_PRICE_ID: process.env.STRIPE_TEAM_ANNUAL_PRICE_ID || '',
}

console.log('\n🔍 Stripe Environment Variables Verification\n')
console.log('=' .repeat(60))

let hasErrors = false

// Check publishable key
console.log('\n1️⃣  Publishable Key')
if (!EXPECTED_KEYS.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.log('   ❌ MISSING: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
  hasErrors = true
} else if (EXPECTED_KEYS.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_')) {
  console.log('   ✅ Valid LIVE key: ' + EXPECTED_KEYS.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...')
} else if (EXPECTED_KEYS.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')) {
  console.log('   ⚠️  WARNING: Using TEST key in production!')
  console.log('   Key: ' + EXPECTED_KEYS.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...')
  hasErrors = true
} else {
  console.log('   ❌ Invalid format: ' + EXPECTED_KEYS.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 20))
  hasErrors = true
}

// Check secret key
console.log('\n2️⃣  Secret Key')
if (!EXPECTED_KEYS.STRIPE_SECRET_KEY) {
  console.log('   ❌ MISSING: STRIPE_SECRET_KEY')
  hasErrors = true
} else if (EXPECTED_KEYS.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
  console.log('   ✅ Valid LIVE key: ' + EXPECTED_KEYS.STRIPE_SECRET_KEY.substring(0, 20) + '...')
} else if (EXPECTED_KEYS.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  console.log('   ⚠️  WARNING: Using TEST key in production!')
  console.log('   Key: ' + EXPECTED_KEYS.STRIPE_SECRET_KEY.substring(0, 20) + '...')
  hasErrors = true
} else {
  console.log('   ❌ Invalid format: ' + EXPECTED_KEYS.STRIPE_SECRET_KEY.substring(0, 20))
  hasErrors = true
}

// Check webhook secret
console.log('\n3️⃣  Webhook Secret')
if (!EXPECTED_KEYS.STRIPE_WEBHOOK_SECRET) {
  console.log('   ❌ MISSING: STRIPE_WEBHOOK_SECRET')
  hasErrors = true
} else if (EXPECTED_KEYS.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
  console.log('   ✅ Valid webhook secret: ' + EXPECTED_KEYS.STRIPE_WEBHOOK_SECRET.substring(0, 15) + '...')
} else {
  console.log('   ❌ Invalid format: ' + EXPECTED_KEYS.STRIPE_WEBHOOK_SECRET.substring(0, 15))
  hasErrors = true
}

// Check price IDs
console.log('\n4️⃣  Price IDs')
const priceIds = [
  { name: 'PRO Monthly ($29/month)', key: 'STRIPE_PRO_MONTHLY_PRICE_ID', value: EXPECTED_KEYS.STRIPE_PRO_MONTHLY_PRICE_ID },
  { name: 'PRO Annual ($299/year)', key: 'STRIPE_PRO_ANNUAL_PRICE_ID', value: EXPECTED_KEYS.STRIPE_PRO_ANNUAL_PRICE_ID },
  { name: 'TEAM Monthly ($99/month)', key: 'STRIPE_TEAM_MONTHLY_PRICE_ID', value: EXPECTED_KEYS.STRIPE_TEAM_MONTHLY_PRICE_ID },
  { name: 'TEAM Annual ($999/year)', key: 'STRIPE_TEAM_ANNUAL_PRICE_ID', value: EXPECTED_KEYS.STRIPE_TEAM_ANNUAL_PRICE_ID },
]

for (const price of priceIds) {
  if (!price.value) {
    console.log(`   ❌ MISSING: ${price.key}`)
    hasErrors = true
  } else if (price.value.startsWith('price_')) {
    console.log(`   ✅ ${price.name}: ${price.value}`)
  } else {
    console.log(`   ❌ Invalid format for ${price.name}: ${price.value}`)
    hasErrors = true
  }
}

console.log('\n' + '='.repeat(60))

if (hasErrors) {
  console.log('\n❌ Configuration has errors! Please fix the issues above.\n')
  process.exit(1)
} else {
  console.log('\n✅ All Stripe environment variables are correctly configured!\n')
  process.exit(0)
}
