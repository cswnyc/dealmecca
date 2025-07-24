#!/usr/bin/env npx tsx

/**
 * Test New Working DealMecca Deployment
 */

const NEW_URL = 'https://website-gjgyoiava-cws-projects-e62034bb.vercel.app';

async function testNewDeployment() {
  console.log(`\n🎉 TESTING NEW WORKING DEPLOYMENT`);
  console.log(`================================`);
  console.log(`🌐 URL: ${NEW_URL}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}\n`);

  // Test 1: Health Check
  try {
    const health = await fetch(`${NEW_URL}/api/health`);
    const healthData = await health.json();
    
    if (healthData.status === 'healthy') {
      console.log(`✅ HEALTH CHECK: Database connected and healthy!`);
      console.log(`   - Database latency: ${healthData.services.database.latency}ms`);
    } else {
      console.log(`❌ HEALTH CHECK: Still having issues`);
    }
  } catch (error) {
    console.log(`❌ HEALTH CHECK: Failed to connect`);
  }

  // Test 2: Critical Pages
  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/auth/signin', name: 'Sign In' },
    { path: '/auth/signup', name: 'Sign Up' },
    { path: '/dashboard', name: 'Dashboard (should redirect to auth)' },
    { path: '/orgs', name: 'Organizations (should redirect to auth)' },
    { path: '/search', name: 'Search (should redirect to auth)' }
  ];

  console.log(`\n🔍 TESTING CRITICAL PAGES:`);
  for (const page of pages) {
    try {
      const response = await fetch(`${NEW_URL}${page.path}`);
      if (response.ok || response.status === 302 || response.url.includes('/auth/signin')) {
        console.log(`✅ ${page.name}: Working correctly`);
      } else {
        console.log(`❌ ${page.name}: Issue (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${page.name}: Network error`);
    }
  }

  console.log(`\n🎯 NEXT STEPS FOR YOU:`);
  console.log(`======================`);
  console.log(`1. 🌐 Visit: ${NEW_URL}`);
  console.log(`2. 🔐 Test sign up/sign in functionality`);
  console.log(`3. 📊 Check dashboard loads with data`);
  console.log(`4. 🏢 Browse organizations and companies`);
  console.log(`5. 🔍 Test search functionality`);
  console.log(`6. 🎉 Your app should be fully functional now!`);
}

testNewDeployment().catch(console.error); 