#!/usr/bin/env npx tsx

/**
 * Quick Vercel Production Test
 * 
 * Tests the most critical issues with DealMecca production deployment
 */

const VERCEL_TEST_URL = 'https://website-incne6jv0-cws-projects-e62034bb.vercel.app';

async function testHealthEndpoint() {
  console.log(`🔍 Testing Health Endpoint...`);
  try {
    const response = await fetch(`${VERCEL_TEST_URL}/api/health`);
    const data = await response.json();
    
    if (data.status === 'healthy') {
      console.log(`✅ SUCCESS: Database is connected and healthy!`);
      return true;
    } else {
      console.log(`❌ FAILED: Database connection issue`);
      console.log(`   Error: ${data.services?.database?.error || JSON.stringify(data)}`);
      return false;
    }
  } catch (error: any) {
    console.log(`❌ FAILED: Health endpoint unreachable`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testBasicPages() {
  console.log(`\n🔍 Testing Basic Pages...`);
  
  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/auth/signin', name: 'Sign In' }
  ];
  
  for (const page of pages) {
    try {
      const response = await fetch(`${VERCEL_TEST_URL}${page.path}`);
      if (response.ok) {
        console.log(`✅ ${page.name}: Loading correctly`);
      } else {
        console.log(`❌ ${page.name}: Failed (${response.status})`);
      }
    } catch (error: any) {
      console.log(`❌ ${page.name}: Network error`);
    }
  }
}

function showEnvironmentVariables() {
  console.log(`\n📋 REQUIRED ENVIRONMENT VARIABLES FOR VERCEL:`);
  console.log(`============================================`);
  console.log(`\n🔧 Go to: Vercel Dashboard → Your Project → Settings → Environment Variables`);
  console.log(`\n📝 Add these (copy exact values):\n`);
  
  console.log(`1. DATABASE_URL:`);
  console.log(`   postgresql://neondb_owner:npg_B3Sdq4aviYgN@ep-wild-lake-afcy495t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`);
  
  console.log(`\n2. DIRECT_URL:`);
  console.log(`   postgresql://neondb_owner:npg_B3Sdq4aviYgN@ep-wild-lake-afcy495t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`);
  
  console.log(`\n3. NEXTAUTH_SECRET:`);
  console.log(`   +bNfyxbjk+rMoly9VelAtuXLlczjsfIEa2X9RI1mVks=`);
  
  console.log(`\n4. NEXTAUTH_URL:`);
  console.log(`   https://website-incne6jv0-cws-projects-e62034bb.vercel.app`);
  
  console.log(`\n⚠️  IMPORTANT: Set Environment to "Production" for all variables`);
}

async function main() {
  console.log(`\n🚀 DEALMECCA VERCEL QUICK TEST`);
  console.log(`=============================`);
  console.log(`🌐 Testing: ${VERCEL_TEST_URL}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}\n`);

  const healthOK = await testHealthEndpoint();
  await testBasicPages();
  
  console.log(`\n📊 DIAGNOSIS:`);
  console.log(`=============`);
  
  if (healthOK) {
    console.log(`🎉 DATABASE IS WORKING!`);
    console.log(`   → Dashboard, Organizations, and Search should now function`);
    console.log(`   → Test the app in your browser`);
  } else {
    console.log(`🚨 DATABASE ISSUE DETECTED`);
    console.log(`   → This is why Dashboard, Organizations, and Search aren't working`);
    console.log(`   → Environment variables need to be fixed in Vercel`);
    
    showEnvironmentVariables();
    
    console.log(`\n🔄 NEXT STEPS:`);
    console.log(`1. Set environment variables in Vercel (see above)`);
    console.log(`2. Redeploy the application`);
    console.log(`3. Run this test again: npx tsx deployment/scripts/quick-vercel-test.ts`);
  }
}

main().catch(console.error); 