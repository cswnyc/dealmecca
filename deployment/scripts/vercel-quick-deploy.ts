#!/usr/bin/env npx tsx

/**
 * Quick Vercel Deployment Script for DealMecca
 * 
 * Rapid deployment with minimal setup for immediate testing
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function quickDeploy() {
  console.log(`
🚀 DEALMECCA QUICK VERCEL DEPLOYMENT
===================================
🎯 Objective: Deploy DealMecca to Vercel immediately
📅 Date: ${new Date().toLocaleString()}
⚡ Mode: Quick deployment for testing
===================================
  `);

  try {
    console.log('🔍 Checking Vercel CLI...');
    try {
      await execAsync('vercel --version');
      console.log('✅ Vercel CLI is available');
    } catch (error) {
      console.log('❌ Vercel CLI not found. Installing...');
      await execAsync('npm install -g vercel');
      console.log('✅ Vercel CLI installed');
    }

    console.log('\n🔑 Checking authentication...');
    try {
      const { stdout } = await execAsync('vercel whoami');
      console.log(`✅ Logged in as: ${stdout.trim()}`);
    } catch (error) {
      console.log('❌ Not logged in to Vercel. Please run: vercel login');
      process.exit(1);
    }

    console.log('\n🔨 Building application...');
    await execAsync('npm run build');
    console.log('✅ Build successful');

    console.log('\n🚀 Deploying to Vercel...');
    const { stdout: deployOutput } = await execAsync('vercel --prod --yes');
    console.log('✅ Deployment successful!');
    
    // Extract deployment URL from output
    const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
    const deploymentUrl = urlMatch ? urlMatch[0] : 'URL not found in output';
    
    console.log(`
🎉 DEPLOYMENT COMPLETE!
======================
🌐 Your app is live at: ${deploymentUrl}
📊 Vercel Dashboard: https://vercel.com/dashboard
📝 View logs: vercel logs

⚠️  IMPORTANT NEXT STEPS:
========================
1. Set up your production database (Neon recommended)
2. Configure environment variables in Vercel dashboard
3. Run database migrations on production
4. Test the deployment thoroughly

🔧 MANUAL CONFIGURATION NEEDED:
==============================
• DATABASE_URL - Your production database connection
• NEXTAUTH_SECRET - Authentication secret (32+ chars)
• NEXTAUTH_URL - Your deployment URL
• Stripe keys for payments
• Pusher credentials for real-time features

📚 HELPFUL COMMANDS:
===================
• Configure environment: vercel env add
• View deployment logs: vercel logs
• Re-deploy: vercel --prod
• Check domains: vercel domains ls

🔗 RESOURCES:
============
• Deployment Guide: deployment/VERCEL_DEPLOYMENT_GUIDE.md
• Neon Setup: npx tsx deployment/scripts/setup-neon-database.ts check
• Full Deployment: npx tsx deployment/scripts/deploy-to-vercel.ts full

======================
    `);

  } catch (error: any) {
    console.error(`
❌ DEPLOYMENT FAILED!
====================
Error: ${error.message}

🔧 TROUBLESHOOTING:
==================
1. Ensure you're logged in: vercel login
2. Check build works locally: npm run build
3. Verify dependencies: npm install
4. Check network connection
5. View detailed logs for more info

💡 Need Help?
============
• Run: npx tsx deployment/scripts/deploy-to-vercel.ts check
• Check: deployment/VERCEL_DEPLOYMENT_GUIDE.md
• Contact: support@dealmecca.com
    `);
    process.exit(1);
  }
}

if (require.main === module) {
  quickDeploy();
} 