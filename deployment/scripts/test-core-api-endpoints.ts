#!/usr/bin/env npx tsx

/**
 * Core API Endpoints Testing
 * 
 * Test each core API endpoint in production to verify functionality
 */

const PROD_URL = 'https://website-gjgyoiava-cws-projects-e62034bb.vercel.app';

// Test configuration for each endpoint
const CORE_ENDPOINTS = [
  {
    name: 'Organizations - Companies',
    url: '/api/orgs/companies',
    expectedData: 'companies',
    description: 'Should return list of companies with organization data',
    requiresAuth: true
  },
  {
    name: 'Search - Companies',
    url: '/api/companies?q=WPP',
    expectedData: 'companies',
    description: 'Should return search results for companies (replaces /api/search)',
    requiresAuth: true
  },
  {
    name: 'Search - Contacts', 
    url: '/api/contacts?q=CEO',
    expectedData: 'contacts',
    description: 'Should return search results for contacts',
    requiresAuth: true
  },
  {
    name: 'Search Suggestions',
    url: '/api/search/suggestions?q=WPP',
    expectedData: 'suggestions',
    description: 'Should return search suggestions',
    requiresAuth: true
  },
  {
    name: 'Events',
    url: '/api/events',
    expectedData: 'events',
    description: 'Should return list of events',
    requiresAuth: true
  },
  {
    name: 'Forum Posts',
    url: '/api/forum/posts',
    expectedData: 'posts',
    description: 'Should return forum posts (replaces /api/community or /api/posts)',
    requiresAuth: false // Based on our previous testing, this was working without auth
  },
  {
    name: 'Forum Categories',
    url: '/api/forum/categories',
    expectedData: 'categories',
    description: 'Should return forum categories',
    requiresAuth: false
  },
  {
    name: 'Health Check',
    url: '/api/health',
    expectedData: 'status',
    description: 'Should return API health status',
    requiresAuth: false
  }
];

// Missing endpoints that the user mentioned but don't exist
const MISSING_ENDPOINTS = [
  {
    name: '/api/search',
    reason: 'Does not exist',
    replacement: '/api/companies and /api/contacts with query parameters',
    note: 'Search functionality is split across specific resource endpoints'
  },
  {
    name: '/api/community',
    reason: 'Does not exist', 
    replacement: '/api/forum/posts',
    note: 'Community content is under forum endpoints'
  },
  {
    name: '/api/posts',
    reason: 'Does not exist',
    replacement: '/api/forum/posts',
    note: 'Posts are forum-specific'
  }
];

async function testCoreAPIEndpoints() {
  console.log(`🔍 CORE API ENDPOINTS TESTING`);
  console.log(`============================`);
  console.log(`🌐 Production URL: ${PROD_URL}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}`);
  console.log(`🧪 Testing ${CORE_ENDPOINTS.length} core endpoints\n`);

  const results = {
    working: [] as any[],
    authRequired: [] as any[],
    missing: [] as any[],
    errors: [] as any[]
  };

  // Test each endpoint
  for (const endpoint of CORE_ENDPOINTS) {
    console.log(`🔗 Testing: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);
    console.log(`   Expected: ${endpoint.expectedData}`);
    
    try {
      const response = await fetch(`${PROD_URL}${endpoint.url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'API-Test/1.0'
        }
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (response.ok) {
        results.working.push({
          ...endpoint,
          status: response.status,
          dataSize: responseText.length,
          hasData: !!responseData
        });
        
        console.log(`   ✅ SUCCESS (${response.status})`);
        console.log(`   📊 Response size: ${responseText.length} bytes`);
        
        // Analyze response data
        if (typeof responseData === 'object') {
          if (Array.isArray(responseData)) {
            console.log(`   📋 Array with ${responseData.length} items`);
          } else if (responseData.success !== undefined) {
            console.log(`   📋 API response format: ${responseData.success ? 'Success' : 'Error'}`);
            if (responseData.data && Array.isArray(responseData.data)) {
              console.log(`   📋 Data array with ${responseData.data.length} items`);
            }
          } else {
            console.log(`   📋 Object with keys: ${Object.keys(responseData).join(', ')}`);
          }
        }
        
      } else if (response.status === 401) {
        results.authRequired.push({
          ...endpoint,
          status: response.status,
          expectedAuth: endpoint.requiresAuth
        });
        
        if (endpoint.requiresAuth) {
          console.log(`   🔒 AUTH REQUIRED (${response.status}) - Expected`);
        } else {
          console.log(`   ⚠️  UNEXPECTED AUTH (${response.status}) - Should be public`);
        }
        
      } else if (response.status === 404) {
        results.missing.push({
          ...endpoint,
          status: response.status
        });
        console.log(`   ❌ NOT FOUND (${response.status})`);
        
      } else {
        results.errors.push({
          ...endpoint,
          status: response.status,
          error: responseText
        });
        console.log(`   ⚠️  ERROR (${response.status})`);
        console.log(`   📄 Response: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
      }
      
    } catch (error) {
      results.errors.push({
        ...endpoint,
        error: (error as Error).message
      });
      console.log(`   ❌ NETWORK ERROR: ${(error as Error).message}`);
    }
    
    console.log(); // Empty line between tests
  }

  // Report missing endpoints
  console.log(`❌ MISSING ENDPOINTS (mentioned but don't exist):`);
  console.log(`=============================================`);
  for (const missing of MISSING_ENDPOINTS) {
    console.log(`   ❌ ${missing.name}`);
    console.log(`      Reason: ${missing.reason}`);
    console.log(`      Use instead: ${missing.replacement}`);
    console.log(`      Note: ${missing.note}\n`);
  }

  // Summary Report
  console.log(`📊 API ENDPOINTS TEST SUMMARY`);
  console.log(`============================\n`);

  console.log(`✅ WORKING ENDPOINTS (${results.working.length}):`);
  results.working.forEach(endpoint => {
    console.log(`   • ${endpoint.name}: ${endpoint.status} (${endpoint.dataSize} bytes)`);
  });

  console.log(`\n🔒 AUTH-PROTECTED ENDPOINTS (${results.authRequired.length}):`);
  results.authRequired.forEach(endpoint => {
    const expectation = endpoint.expectedAuth ? 'Expected' : 'Unexpected';
    console.log(`   • ${endpoint.name}: ${endpoint.status} (${expectation})`);
  });

  console.log(`\n❌ MISSING ENDPOINTS (${results.missing.length}):`);
  results.missing.forEach(endpoint => {
    console.log(`   • ${endpoint.name}: ${endpoint.status}`);
  });

  console.log(`\n⚠️  ERROR ENDPOINTS (${results.errors.length}):`);
  results.errors.forEach(endpoint => {
    console.log(`   • ${endpoint.name}: ${endpoint.status || 'Network Error'}`);
  });

  // Test Authenticated Endpoints
  console.log(`\n🔐 TESTING WITH AUTHENTICATION`);
  console.log(`==============================`);
  console.log(`ℹ️  To test authenticated endpoints, you need to:`);
  console.log(`   1. Sign in at: ${PROD_URL}/auth/signin`);
  console.log(`   2. Use credentials: pro@dealmecca.pro / test123`);
  console.log(`   3. Check browser Network tab for authenticated API calls\n`);

  // Browser Testing Instructions
  console.log(`🌐 BROWSER NETWORK TAB TESTING`);
  console.log(`==============================`);
  console.log(`📋 Follow these steps for complete testing:`);
  console.log(`   1. Open browser DevTools (F12)`);
  console.log(`   2. Go to Network tab`);
  console.log(`   3. Sign in to ${PROD_URL}/auth/signin`);
  console.log(`   4. Navigate to different sections:`);
  console.log(`      • /orgs/companies (test organizations)`);
  console.log(`      • /search (test search functionality)`);
  console.log(`      • /events (test events)`);
  console.log(`      • /forum (test forum/community)`);
  console.log(`   5. Watch Network tab for API calls and response codes\n`);

  // Endpoint Status Analysis
  const totalEndpoints = CORE_ENDPOINTS.length;
  const workingOrProtected = results.working.length + results.authRequired.filter(e => e.expectedAuth).length;
  const successRate = Math.round((workingOrProtected / totalEndpoints) * 100);

  console.log(`🎯 API ENDPOINTS STATUS`);
  console.log(`======================`);
  console.log(`   Total Tested: ${totalEndpoints}`);
  console.log(`   Working/Protected: ${workingOrProtected}`);
  console.log(`   Success Rate: ${successRate}%`);
  console.log(`   Authentication: ${results.authRequired.length} endpoints require auth`);
  console.log(`   Public: ${results.working.length} endpoints work without auth\n`);

  if (successRate >= 90) {
    console.log(`✅ EXCELLENT: Core API endpoints are properly deployed!`);
  } else if (successRate >= 75) {
    console.log(`⚠️  GOOD: Most endpoints working, minor issues to address`);
  } else {
    console.log(`🚨 NEEDS ATTENTION: Several core endpoints not responding`);
  }

  // Next Steps
  console.log(`\n🔧 NEXT STEPS:`);
  console.log(`=============`);
  console.log(`   1. Test authenticated endpoints by signing in`);
  console.log(`   2. Check actual data returned from working endpoints`);
  console.log(`   3. Verify search functionality with real queries`);
  console.log(`   4. Test forum/community features`);
  console.log(`   5. Monitor Network tab for response details\n`);

  return {
    successRate,
    working: results.working.length,
    authRequired: results.authRequired.length,
    missing: results.missing.length,
    errors: results.errors.length
  };
}

testCoreAPIEndpoints().catch(console.error); 