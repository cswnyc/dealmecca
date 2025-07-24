# 🔧 DEALMECCA PRODUCTION ENVIRONMENT VARIABLES SETUP

## 📋 COMPLETE .ENV.PRODUCTION FILE

Copy this content to create your `.env.production` file:

```bash
# ============================================================================
# DEALMECCA PRODUCTION ENVIRONMENT VARIABLES
# ============================================================================
# Priority: ⭐ = Essential (must have), 🔧 = Important, 💡 = Optional
# ============================================================================

# ============================================================================
# ⭐ CORE APPLICATION CONFIGURATION (ESSENTIAL)
# ============================================================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXTAUTH_URL=https://your-app.vercel.app

# ============================================================================
# ⭐ DATABASE CONFIGURATION (ESSENTIAL)
# ============================================================================
# Get from: https://neon.tech
# Replace with your actual Neon PostgreSQL connection string
DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require

# ============================================================================
# ⭐ AUTHENTICATION SECRETS (ESSENTIAL)
# ============================================================================
# CRITICAL: Use these generated secure secrets (already secure - use as-is)
NEXTAUTH_SECRET=eHUMoYSBd/p7zAx6Fek6PTgNHceytamkAmIvPGGD5ok=
JWT_SECRET=CDErOF54F/qXRrhCJ6hOxJyzV4YHStta6+64988RAz4=

# ============================================================================
# 🔧 GOOGLE OAUTH CONFIGURATION (IMPORTANT)
# ============================================================================
# Get from: https://console.cloud.google.com
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret

# ============================================================================
# 🔧 STRIPE PAYMENT CONFIGURATION (IMPORTANT)
# ============================================================================
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_endpoint_secret

# Stripe Price IDs (create products in Stripe dashboard)
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_price_id
STRIPE_PRO_ANNUAL_PRICE_ID=price_your_pro_annual_price_id
STRIPE_TEAM_MONTHLY_PRICE_ID=price_your_team_monthly_price_id
STRIPE_TEAM_ANNUAL_PRICE_ID=price_your_team_annual_price_id

# ============================================================================
# 💡 PUSHER REAL-TIME CONFIGURATION (OPTIONAL)
# ============================================================================
# Get from: https://pusher.com
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# ============================================================================
# 💡 FEATURE FLAGS (OPTIONAL)
# ============================================================================
NEXT_PUBLIC_ENABLE_BETA_FEATURES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_FORUM=true
NEXT_PUBLIC_ENABLE_EVENTS=true

# ============================================================================
# 💡 BRAND CONFIGURATION (OPTIONAL)
# ============================================================================
NEXT_PUBLIC_APP_NAME=DealMecca
NEXT_PUBLIC_BRAND_NAME=DealMecca
NEXT_PUBLIC_TAGLINE=The mecca for media deals
NEXT_PUBLIC_SITE_URL=https://dealmecca.com
NEXT_PUBLIC_DOMAIN=dealmecca.com
```

## 🔐 SECURE SECRETS GENERATED

**✅ Ready-to-use secure secrets (copy exactly as shown):**

```bash
NEXTAUTH_SECRET=eHUMoYSBd/p7zAx6Fek6PTgNHceytamkAmIvPGGD5ok=
JWT_SECRET=CDErOF54F/qXRrhCJ6hOxJyzV4YHStta6+64988RAz4=
```

**⚠️ IMPORTANT:** These secrets are cryptographically secure and ready for production use.

## 📋 EXTERNAL SERVICE SETUP INSTRUCTIONS

### 🗄️ **1. NEON DATABASE SETUP**

**Step-by-step instructions:**

1. **Go to [neon.tech](https://neon.tech)** and create account
2. **Click "Create Project"**
3. **Choose settings:**
   - Database name: `dealmecca`
   - Region: Choose closest to your users
4. **Copy connection string** from dashboard
5. **Replace in environment variables:**
   ```bash
   DATABASE_URL=postgresql://username:password@ep-wild-lake-afcy495t.us-west-2.aws.neon.tech/neondb?sslmode=require
   ```

### 🔐 **2. GOOGLE OAUTH SETUP**

**Step-by-step instructions:**

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Create or select project**
3. **Enable Google+ API:**
   - APIs & Services → Library
   - Search "Google+ API" → Enable
4. **Create OAuth credentials:**
   - APIs & Services → Credentials
   - Create Credentials → OAuth 2.0 Client IDs
   - Application type: Web application
5. **Configure authorized URLs:**
   - Authorized JavaScript origins: `https://your-app.vercel.app`
   - Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`
6. **Copy credentials:**
   ```bash
   GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abcd1234567890
   ```

### 💳 **3. STRIPE SETUP**

**Step-by-step instructions:**

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com)**
2. **Get API keys:**
   - Developers → API keys
   - Copy Publishable key (starts with `pk_test_` or `pk_live_`)
   - Copy Secret key (starts with `sk_test_` or `sk_live_`)
3. **Set up webhook:**
   - Developers → Webhooks → Add endpoint
   - Endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events: Select `checkout.session.completed`, `payment_intent.succeeded`
   - Copy webhook signing secret (starts with `whsec_`)
4. **Create products/prices:**
   - Products → Add Product
   - Create pricing tiers and copy price IDs
5. **Copy all values:**
   ```bash
   STRIPE_SECRET_KEY=sk_test_abcd1234567890
   STRIPE_PUBLISHABLE_KEY=pk_test_abcd1234567890
   STRIPE_WEBHOOK_SECRET=whsec_abcd1234567890
   ```

### ⚡ **4. PUSHER SETUP (OPTIONAL)**

**Step-by-step instructions:**

1. **Go to [pusher.com](https://pusher.com)** and create account
2. **Create new app:**
   - Choose app name: `dealmecca`
   - Select cluster: `us2` (or closest to your users)
3. **Copy app credentials:**
   - Go to App Keys tab
   - Copy app_id, key, secret, cluster
4. **Add to environment:**
   ```bash
   PUSHER_APP_ID=123456
   PUSHER_KEY=abcd1234567890
   PUSHER_SECRET=abcd1234567890
   PUSHER_CLUSTER=us2
   ```

## ✅ ENVIRONMENT VARIABLES VALIDATION SCRIPT

Create this file to validate your environment setup:

```javascript
// scripts/validate-env.js
const requiredVars = {
  // Essential variables
  essential: [
    'DATABASE_URL',
    'NEXTAUTH_SECRET', 
    'NEXTAUTH_URL',
    'NODE_ENV'
  ],
  // Important for full functionality
  important: [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ],
  // Optional but recommended
  optional: [
    'PUSHER_APP_ID',
    'PUSHER_KEY',
    'PUSHER_SECRET',
    'STRIPE_PRO_MONTHLY_PRICE_ID'
  ]
};

function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check essential variables
  console.log('⭐ Essential Variables:');
  requiredVars.essential.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`❌ ${varName} - MISSING (CRITICAL)`);
      hasErrors = true;
    }
  });
  
  // Check important variables
  console.log('\n🔧 Important Variables:');
  requiredVars.important.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`⚠️  ${varName} - Missing (reduced functionality)`);
      hasWarnings = true;
    }
  });
  
  // Check optional variables
  console.log('\n💡 Optional Variables:');
  requiredVars.optional.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`⚪ ${varName} - Not set (optional)`);
    }
  });
  
  // Validate specific formats
  console.log('\n🔍 Format Validation:');
  
  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.startsWith('postgresql://')) {
      console.log('✅ DATABASE_URL format valid');
    } else {
      console.log('❌ DATABASE_URL must start with postgresql://');
      hasErrors = true;
    }
  }
  
  if (process.env.NEXTAUTH_SECRET) {
    if (process.env.NEXTAUTH_SECRET.length >= 32) {
      console.log('✅ NEXTAUTH_SECRET length sufficient');
    } else {
      console.log('❌ NEXTAUTH_SECRET must be at least 32 characters');
      hasErrors = true;
    }
  }
  
  if (process.env.NEXTAUTH_URL) {
    if (process.env.NEXTAUTH_URL.startsWith('https://')) {
      console.log('✅ NEXTAUTH_URL format valid');
    } else {
      console.log('❌ NEXTAUTH_URL must start with https://');
      hasErrors = true;
    }
  }
  
  // Summary
  console.log('\n📊 Summary:');
  if (hasErrors) {
    console.log('❌ Critical errors found. Fix before deploying.');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Some important variables missing. Reduced functionality.');
  } else {
    console.log('✅ All variables configured correctly!');
  }
}

validateEnvironment();
```

**Run validation:**
```bash
node scripts/validate-env.js
```

## 📋 VERCEL DASHBOARD COPY-PASTE FORMAT

**Go to Vercel Dashboard → Your Project → Settings → Environment Variables**

**Copy and paste these one by one:**

### ⭐ ESSENTIAL VARIABLES (Set these first):

```
Name: DATABASE_URL
Value: postgresql://your-actual-connection-string-here
Environment: Production
```

```
Name: NEXTAUTH_SECRET
Value: eHUMoYSBd/p7zAx6Fek6PTgNHceytamkAmIvPGGD5ok=
Environment: Production
```

```
Name: NEXTAUTH_URL
Value: https://your-actual-vercel-domain.vercel.app
Environment: Production
```

```
Name: NODE_ENV
Value: production
Environment: Production
```

### 🔧 IMPORTANT VARIABLES (Set for full functionality):

```
Name: GOOGLE_CLIENT_ID
Value: your-google-client-id.apps.googleusercontent.com
Environment: Production
```

```
Name: GOOGLE_CLIENT_SECRET
Value: GOCSPX-your-google-client-secret
Environment: Production
```

```
Name: STRIPE_SECRET_KEY
Value: sk_test_your_stripe_secret_key
Environment: Production
```

```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_your_webhook_secret
Environment: Production
```

### 💡 OPTIONAL VARIABLES (Add as needed):

```
Name: PUSHER_APP_ID
Value: your-pusher-app-id
Environment: Production
```

```
Name: PUSHER_KEY
Value: your-pusher-key
Environment: Production
```

```
Name: PUSHER_SECRET
Value: your-pusher-secret
Environment: Production
```

```
Name: NEXT_PUBLIC_PUSHER_KEY
Value: your-pusher-key
Environment: Production
```

## 🚀 DEPLOYMENT CHECKLIST

### ✅ Before Deployment:
1. Set up Neon database
2. Configure Google OAuth
3. Set up Stripe (at least test keys)
4. Add essential environment variables to Vercel
5. Run validation script locally
6. Test build: `npm run build`

### ✅ After Deployment:
1. Test `/api/health` endpoint
2. Test login functionality
3. Verify database connection
4. Check company/contact data loading
5. Test search functionality

### 🔧 Quick Start (Minimum Viable Setup):
```bash
# Only these 4 variables needed for basic functionality:
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=eHUMoYSBd/p7zAx6Fek6PTgNHceytamkAmIvPGGD5ok=
NEXTAUTH_URL=https://your-app.vercel.app
NODE_ENV=production
```

Your DealMecca platform will be ready for production deployment! 🎉 