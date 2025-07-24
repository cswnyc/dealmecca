#!/usr/bin/env npx tsx

/**
 * Production Functionality Test
 * 
 * Test all major functionality areas to identify what's missing vs working
 */

const PRODUCTION_APP_URL = 'https://website-gjgyoiava-cws-projects-e62034bb.vercel.app';

async function testProductionFunctionality() {
  console.log(`🔍 DEALMECCA PRODUCTION FUNCTIONALITY TEST`);
  console.log(`==========================================`);
  console.log(`🌐 URL: ${PRODUCTION_APP_URL}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}\n`);

  const results = {
    working: [] as string[],
    missing: [] as string[],
    authRequired: [] as string[],
    errors: [] as string[]
  };

  // Test 1: Core Search Functionality
  console.log(`1️⃣ TESTING SEARCH FUNCTIONALITY`);
  console.log(`==============================`);
  
  const searchEndpoints = [
    { name: 'Companies API', url: '/api/companies?q=WPP' },
    { name: 'Contacts API', url: '/api/contacts?q=CEO' },
    { name: 'Organizations API', url: '/api/orgs/companies' },
    { name: 'Search Suggestions', url: '/api/search/suggestions?q=WPP' }
  ];

  for (const endpoint of searchEndpoints) {
    try {
      const response = await fetch(`${PRODUCTION_APP_URL}${endpoint.url}`);
      if (response.ok) {
        results.working.push(`${endpoint.name}: ${response.status}`);
        console.log(`   ✅ ${endpoint.name}: Working (${response.status})`);
      } else if (response.status === 401) {
        results.authRequired.push(`${endpoint.name}: Auth required`);
        console.log(`   🔒 ${endpoint.name}: Auth required (expected)`);
      } else {
        results.missing.push(`${endpoint.name}: ${response.status}`);
        console.log(`   ❌ ${endpoint.name}: Error ${response.status}`);
      }
    } catch (error) {
      results.errors.push(`${endpoint.name}: ${(error as Error).message}`);
      console.log(`   ❌ ${endpoint.name}: Network error`);
    }
  }

  // Test 2: Events Functionality
  console.log(`\n2️⃣ TESTING EVENTS FUNCTIONALITY`);
  console.log(`===============================`);
  
  const eventEndpoints = [
    { name: 'Events List API', url: '/api/events' },
    { name: 'Event Attendees API', url: '/api/events/1/attendees' },
    { name: 'Events Page', url: '/events' },
    { name: 'Event Detail Page', url: '/events/1' }
  ];

  for (const endpoint of eventEndpoints) {
    try {
      const response = await fetch(`${PRODUCTION_APP_URL}${endpoint.url}`);
      if (response.ok) {
        results.working.push(`${endpoint.name}: ${response.status}`);
        console.log(`   ✅ ${endpoint.name}: Working (${response.status})`);
      } else if (response.status === 401 || response.url.includes('/auth/signin')) {
        results.authRequired.push(`${endpoint.name}: Auth required`);
        console.log(`   🔒 ${endpoint.name}: Auth required (expected)`);
      } else {
        results.missing.push(`${endpoint.name}: ${response.status}`);
        console.log(`   ❌ ${endpoint.name}: Error ${response.status}`);
      }
    } catch (error) {
      results.errors.push(`${endpoint.name}: ${(error as Error).message}`);
      console.log(`   ❌ ${endpoint.name}: Network error`);
    }
  }

  // Test 3: Community/Forum Functionality
  console.log(`\n3️⃣ TESTING COMMUNITY/FORUM FUNCTIONALITY`);
  console.log(`========================================`);
  
  const forumEndpoints = [
    { name: 'Forum Posts API', url: '/api/forum/posts' },
    { name: 'Forum Categories API', url: '/api/forum/categories' },
    { name: 'Forum Search API', url: '/api/forum/search?q=test' },
    { name: 'Forum Page', url: '/forum' },
    { name: 'Forum Search Page', url: '/forum/search' }
  ];

  for (const endpoint of forumEndpoints) {
    try {
      const response = await fetch(`${PRODUCTION_APP_URL}${endpoint.url}`);
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          const hasData = Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0;
          results.working.push(`${endpoint.name}: ${response.status} (${hasData ? 'Has Data' : 'Empty'})`);
          console.log(`   ✅ ${endpoint.name}: Working (${response.status}) ${hasData ? '📊 Has Data' : '📭 Empty'}`);
        } else {
          results.working.push(`${endpoint.name}: ${response.status} (Page)`);
          console.log(`   ✅ ${endpoint.name}: Page loads (${response.status})`);
        }
      } else if (response.status === 401 || response.url.includes('/auth/signin')) {
        results.authRequired.push(`${endpoint.name}: Auth required`);
        console.log(`   🔒 ${endpoint.name}: Auth required (expected)`);
      } else {
        results.missing.push(`${endpoint.name}: ${response.status}`);
        console.log(`   ❌ ${endpoint.name}: Error ${response.status}`);
      }
    } catch (error) {
      results.errors.push(`${endpoint.name}: ${(error as Error).message}`);
      console.log(`   ❌ ${endpoint.name}: Network error`);
    }
  }

  // Test 4: Organization Charts Functionality
  console.log(`\n4️⃣ TESTING ORG CHARTS FUNCTIONALITY`);
  console.log(`==================================`);
  
  const orgEndpoints = [
    { name: 'Orgs Main Page', url: '/orgs' },
    { name: 'Companies Browse', url: '/orgs/companies' },
    { name: 'Contacts Browse', url: '/orgs/contacts' },
    { name: 'Company Detail', url: '/orgs/companies/1' },
    { name: 'Contact Detail', url: '/orgs/contacts/1' }
  ];

  for (const endpoint of orgEndpoints) {
    try {
      const response = await fetch(`${PRODUCTION_APP_URL}${endpoint.url}`);
      if (response.ok) {
        results.working.push(`${endpoint.name}: ${response.status}`);
        console.log(`   ✅ ${endpoint.name}: Working (${response.status})`);
      } else if (response.status === 401 || response.url.includes('/auth/signin')) {
        results.authRequired.push(`${endpoint.name}: Auth required`);
        console.log(`   🔒 ${endpoint.name}: Auth required (expected)`);
      } else {
        results.missing.push(`${endpoint.name}: ${response.status}`);
        console.log(`   ❌ ${endpoint.name}: Error ${response.status}`);
      }
    } catch (error) {
      results.errors.push(`${endpoint.name}: ${(error as Error).message}`);
      console.log(`   ❌ ${endpoint.name}: Network error`);
    }
  }

  // Test 5: Admin Functionality
  console.log(`\n5️⃣ TESTING ADMIN FUNCTIONALITY`);
  console.log(`=============================`);
  
  const adminEndpoints = [
    { name: 'Admin Dashboard', url: '/admin' },
    { name: 'Admin Companies', url: '/admin/orgs/companies' },
    { name: 'Admin Events', url: '/admin/events' }
  ];

  for (const endpoint of adminEndpoints) {
    try {
      const response = await fetch(`${PRODUCTION_APP_URL}${endpoint.url}`);
      if (response.ok) {
        results.working.push(`${endpoint.name}: ${response.status}`);
        console.log(`   ✅ ${endpoint.name}: Working (${response.status})`);
      } else if (response.status === 401 || response.url.includes('/auth/signin')) {
        results.authRequired.push(`${endpoint.name}: Auth required`);
        console.log(`   🔒 ${endpoint.name}: Auth required (expected)`);
      } else {
        results.missing.push(`${endpoint.name}: ${response.status}`);
        console.log(`   ❌ ${endpoint.name}: Error ${response.status}`);
      }
    } catch (error) {
      results.errors.push(`${endpoint.name}: ${(error as Error).message}`);
      console.log(`   ❌ ${endpoint.name}: Network error`);
    }
  }

  // Generate Summary Report
  console.log(`\n📊 FUNCTIONALITY ANALYSIS REPORT`);
  console.log(`===============================\n`);

  console.log(`✅ WORKING FUNCTIONALITY (${results.working.length}):`);
  results.working.forEach(item => console.log(`   • ${item}`));

  console.log(`\n🔒 AUTH REQUIRED (${results.authRequired.length}) - Expected:`);
  results.authRequired.forEach(item => console.log(`   • ${item}`));

  if (results.missing.length > 0) {
    console.log(`\n❌ MISSING/BROKEN FUNCTIONALITY (${results.missing.length}):`);
    results.missing.forEach(item => console.log(`   • ${item}`));
  }

  if (results.errors.length > 0) {
    console.log(`\n🚨 NETWORK ERRORS (${results.errors.length}):`);
    results.errors.forEach(item => console.log(`   • ${item}`));
  }

  // Overall Assessment
  const totalTests = results.working.length + results.authRequired.length + results.missing.length + results.errors.length;
  const successfulTests = results.working.length + results.authRequired.length;
  const successRate = Math.round((successfulTests / totalTests) * 100);

  console.log(`\n🎯 OVERALL ASSESSMENT:`);
  console.log(`   Success Rate: ${successRate}% (${successfulTests}/${totalTests})`);
  
  if (successRate >= 90) {
    console.log(`   Status: ✅ EXCELLENT - Most functionality working`);
  } else if (successRate >= 75) {
    console.log(`   Status: ⚠️ GOOD - Minor issues to address`);
  } else if (successRate >= 50) {
    console.log(`   Status: ⚠️ NEEDS ATTENTION - Several missing features`);
  } else {
    console.log(`   Status: 🚨 CRITICAL - Major functionality missing`);
  }

  console.log(`\n🔧 RECOMMENDED NEXT STEPS:`);
  
  if (results.missing.length > 0) {
    console.log(`   1. Fix missing functionality: ${results.missing.length} items`);
    console.log(`   2. Check API route deployments in Vercel`);
    console.log(`   3. Verify environment variables`);
  }
  
  if (results.errors.length > 0) {
    console.log(`   4. Investigate network errors: ${results.errors.length} items`);
  }
  
  console.log(`   5. Test authenticated functionality by signing in`);
  console.log(`   6. Check browser console for frontend errors`);

  return {
    successRate,
    working: results.working.length,
    authRequired: results.authRequired.length,
    missing: results.missing.length,
    errors: results.errors.length
  };
}

testProductionFunctionality().catch(console.error); 