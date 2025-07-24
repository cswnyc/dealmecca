#!/usr/bin/env npx tsx

/**
 * Generate Production Secrets for DealMecca Vercel Deployment
 * 
 * Generates required environment variables and secrets for production
 */

import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

function generateSecrets() {
  console.log(`
🔐 DEALMECCA PRODUCTION SECRETS GENERATOR
========================================
🎯 Purpose: Generate secure secrets for Vercel deployment
📅 Date: ${new Date().toLocaleString()}
========================================
  `);

  const secrets = {
    NEXTAUTH_SECRET: randomBytes(32).toString('base64'),
    JWT_SECRET: randomBytes(32).toString('base64'),
    ENCRYPTION_KEY: randomBytes(32).toString('hex'),
    API_SECRET: randomBytes(16).toString('hex'),
    WEBHOOK_SECRET: randomBytes(24).toString('base64url'),
  };

  console.log('🔑 Generated Secrets:');
  console.log('====================');
  Object.entries(secrets).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });

  console.log(`
📋 VERCEL ENVIRONMENT VARIABLES SETUP
=====================================

Copy these to your Vercel dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your DealMecca project
3. Settings → Environment Variables
4. Add each variable below:

🔗 Required Variables:
━━━━━━━━━━━━━━━━━━━━━

DATABASE_URL=postgresql://username:password@host.neon.tech/dealmecca?sslmode=require
DIRECT_URL=postgresql://username:password@host.neon.tech/dealmecca?sslmode=require
NEXTAUTH_SECRET=${secrets.NEXTAUTH_SECRET}
NEXTAUTH_URL=https://your-app-name.vercel.app

🔧 Optional Variables (for full features):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=${secrets.WEBHOOK_SECRET}

PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=us2

📝 NEXT STEPS:
━━━━━━━━━━━━━━

1. Set up Neon database: https://neon.tech
2. Configure Vercel environment variables
3. Redeploy: vercel --prod
4. Test: https://your-app.vercel.app/api/health

💡 Tips:
━━━━━━━━

• Use the same DATABASE_URL for both DATABASE_URL and DIRECT_URL
• NEXTAUTH_URL must match your Vercel deployment URL exactly
• Set environment variables to "Production" scope in Vercel
• Redeploy after adding environment variables

`);

  return secrets;
}

async function checkRequiredTools() {
  const tools = ['vercel', 'prisma'];
  
  for (const tool of tools) {
    try {
      await execAsync(`which ${tool}`);
      console.log(`✅ ${tool} is installed`);
    } catch {
      console.log(`❌ ${tool} is not installed`);
      if (tool === 'vercel') {
        console.log(`   Install with: npm install -g vercel`);
      }
    }
  }
}

async function main() {
  const command = process.argv[2];

  if (command === 'check-tools') {
    await checkRequiredTools();
    return;
  }

  if (command === 'secrets') {
    generateSecrets();
    return;
  }

  if (command === 'env-template') {
    const secrets = generateSecrets();
    
    console.log(`
📄 ENVIRONMENT TEMPLATE FILE
============================

Save this to .env.production (DO NOT commit to git):

# DealMecca Production Environment Variables
NODE_ENV=production
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=${secrets.NEXTAUTH_SECRET}

# Database (get from neon.tech)
DATABASE_URL=postgresql://username:password@host.neon.tech/dealmecca?sslmode=require
DIRECT_URL=postgresql://username:password@host.neon.tech/dealmecca?sslmode=require

# Optional: Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=${secrets.WEBHOOK_SECRET}

# Optional: Pusher
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=us2

    `);
    return;
  }

  // Default: show usage
  console.log(`
🚀 DealMecca Production Secrets Generator

Usage:
  npx tsx deployment/scripts/generate-production-secrets.ts [command]

Commands:
  secrets       Generate new secrets for production
  env-template  Generate complete environment template
  check-tools   Check if required tools are installed

Examples:
  npx tsx deployment/scripts/generate-production-secrets.ts secrets
  npx tsx deployment/scripts/generate-production-secrets.ts env-template
  npx tsx deployment/scripts/generate-production-secrets.ts check-tools

  `);
}

if (require.main === module) {
  main().catch(console.error);
} 