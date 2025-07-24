#!/usr/bin/env npx tsx

/**
 * Quick Production Setup for DealMecca
 * 
 * Guides through Neon + Vercel setup process
 */

import { randomBytes } from 'crypto';

function generateNextAuthSecret() {
  return randomBytes(32).toString('base64');
}

function showQuickSetup() {
  const nextAuthSecret = generateNextAuthSecret();
  
  console.log(`
🚀 DEALMECCA PRODUCTION SETUP - QUICK START
==========================================
📅 ${new Date().toLocaleString()}
🎯 Goal: Get DealMecca running on Vercel with Neon database
==========================================

📋 CHECKLIST (15 minutes total):

┌─ STEP 1: Create Neon Database (5 min) ────────────────────────────┐
│                                                                    │
│  1. Open: https://neon.tech                                       │
│  2. Sign up with GitHub                                           │
│  3. Create project: "dealmecca-production"                        │
│  4. Copy the DATABASE_URL (starts with postgresql://)            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌─ STEP 2: Configure Vercel Environment (5 min) ────────────────────┐
│                                                                    │
│  1. Open: https://vercel.com/dashboard                           │
│  2. Select your project                                           │
│  3. Go to: Settings → Environment Variables                      │
│  4. Add these variables:                                          │
│                                                                    │
│     DATABASE_URL=your-neon-connection-string                     │
│     DIRECT_URL=your-neon-connection-string                       │
│     NEXTAUTH_SECRET=${nextAuthSecret}
│     NEXTAUTH_URL=https://your-app.vercel.app                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌─ STEP 3: Deploy & Test (5 min) ───────────────────────────────────┐
│                                                                    │
│  1. Redeploy: vercel --prod                                      │
│  2. Test: Visit https://your-app.vercel.app/api/health           │
│  3. Check database: Visit your app and try signing up            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

🔗 Your current deployment: 
   https://website-qszx7bymm-cws-projects-e62034bb.vercel.app

📝 Next steps after setup:
   • Run database migrations on production
   • Seed with sample data
   • Test user registration and login
   • Configure custom domain (optional)

💡 Need help? Run:
   npx tsx deployment/scripts/setup-neon-database.ts check

`);
}

function showDatabaseConnectionTest() {
  console.log(`
🔍 DATABASE CONNECTION TEST
===========================

To test your database connection:

1. Set DATABASE_URL temporarily:
   export DATABASE_URL="your-neon-connection-string"

2. Test connection:
   npx tsx deployment/scripts/setup-neon-database.ts check

3. Run migrations:
   npx prisma db push

4. Seed data:
   npx prisma db seed

`);
}

function showEnvironmentTemplate() {
  const secrets = {
    nextauth: generateNextAuthSecret(),
    webhook: randomBytes(24).toString('base64url'),
  };

  console.log(`
📄 ENVIRONMENT VARIABLES TEMPLATE
==================================

Add these to Vercel → Settings → Environment Variables:

DATABASE_URL=postgresql://username:password@host.neon.tech/dealmecca?sslmode=require
DIRECT_URL=postgresql://username:password@host.neon.tech/dealmecca?sslmode=require
NEXTAUTH_SECRET=${secrets.nextauth}
NEXTAUTH_URL=https://website-qszx7bymm-cws-projects-e62034bb.vercel.app

# Optional (for full features):
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=${secrets.webhook}

PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=us2

`);
}

function main() {
  const command = process.argv[2];

  switch (command) {
    case 'env':
      showEnvironmentTemplate();
      break;
    case 'test':
      showDatabaseConnectionTest();
      break;
    case 'help':
    default:
      showQuickSetup();
      break;
  }
}

if (require.main === module) {
  main();
} 