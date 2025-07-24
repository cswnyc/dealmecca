#!/usr/bin/env npx tsx

/**
 * Authenticated API Endpoints Testing
 * 
 * Test API endpoints with authentication to verify actual data responses
 */

const PROD_URL = 'https://website-gjgyoiava-cws-projects-e62034bb.vercel.app';

// Authenticated endpoints to test
const AUTH_ENDPOINTS = [
  {
    name: 'Organizations - Companies',
    url: '/api/orgs/companies',
    expectedFields: ['id', 'name', 'industry', 'employeeCount']
  },
  {
    name: 'Search - Companies',
    url: '/api/companies?q=WPP',
    expectedFields: ['id', 'name', 'industry']
  },
  {
    name: 'Search - Contacts',
    url: '/api/contacts?q=CEO',
    expectedFields: ['id', 'firstName', 'lastName', 'title']
  },
  {
    name: 'Events',
    url: '/api/events',
    expectedFields: ['id', 'title', 'startDate', 'location']
  },
  {
    name: 'Search Suggestions',
    url: '/api/search/suggestions?q=WPP',
    expectedFields: ['suggestions']
  }
];

async function authenticateUser() {
  console.log(`🔐 ATTEMPTING AUTHENTICATION`);
  console.log(`===========================`);
  
  try {
    // Get CSRF token
    const csrfResponse = await fetch(`${PROD_URL}/api/auth/csrf`);
    const csrfData = await csrfResponse.json();
    console.log(`   📋 CSRF token obtained`);
    
    // Attempt login
    const loginResponse = await fetch(`${PROD_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'pro@dealmecca.pro',
        password: 'test123',
        csrfToken: csrfData.csrfToken,
        callbackUrl: PROD_URL,
        json: 'true'
      }),
      redirect: 'manual'
    });
    
    console.log(`   📋 Login response: ${loginResponse.status}`);
    
    // Extract session cookie if available
    const cookies = loginResponse.headers.get('set-cookie');
    console.log(`   📋 Cookies: ${cookies ? 'Received' : 'None'}`);
    
    return cookies;
    
  } catch (error) {
    console.log(`   ❌ Authentication failed: ${(error as Error).message}`);
    return null;
  }
}

async function testAuthenticatedEndpoints() {
  console.log(`🔍 AUTHENTICATED API ENDPOINTS TEST`);
  console.log(`==================================`);
  console.log(`🌐 Production URL: ${PROD_URL}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}\n`);

  // Try to authenticate
  const sessionCookies = await authenticateUser();
  
  console.log(`\n🧪 TESTING AUTHENTICATED ENDPOINTS`);
  console.log(`=================================`);
  
  const results = {
    working: [] as any[],
    empty: [] as any[],
    errors: [] as any[]
  };

  for (const endpoint of AUTH_ENDPOINTS) {
    console.log(`🔗 Testing: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);
    
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test/1.0'
      };
      
      // Include session cookies if available
      if (sessionCookies) {
        headers['Cookie'] = sessionCookies;
      }
      
      const response = await fetch(`${PROD_URL}${endpoint.url}`, {
        method: 'GET',
        headers
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (response.ok) {
        // Analyze response data structure
        let dataArray = responseData;
        let dataCount = 0;
        let sampleData = null;
        
        if (responseData.success && responseData.data) {
          dataArray = responseData.data;
        }
        
        if (Array.isArray(dataArray)) {
          dataCount = dataArray.length;
          sampleData = dataArray[0];
        } else if (typeof dataArray === 'object') {
          dataCount = Object.keys(dataArray).length;
          sampleData = dataArray;
        }
        
        if (dataCount > 0) {
          results.working.push({
            ...endpoint,
            status: response.status,
            dataCount,
            sampleData,
            responseSize: responseText.length
          });
          
          console.log(`   ✅ SUCCESS (${response.status})`);
          console.log(`   📊 Data count: ${dataCount} items`);
          console.log(`   📄 Response size: ${responseText.length} bytes`);
          
          // Check for expected fields in sample data
          if (sampleData && typeof sampleData === 'object') {
            const availableFields = Object.keys(sampleData);
            const missingFields = endpoint.expectedFields.filter(field => !availableFields.includes(field));
            const extraFields = availableFields.filter(field => !endpoint.expectedFields.includes(field));
            
            console.log(`   🔍 Expected fields: ${endpoint.expectedFields.join(', ')}`);
            console.log(`   ✅ Available fields: ${availableFields.join(', ')}`);
            
            if (missingFields.length > 0) {
              console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
            }
            
            // Show sample data (truncated)
            const sampleStr = JSON.stringify(sampleData, null, 2);
            console.log(`   📋 Sample data:\n${sampleStr.substring(0, 300)}${sampleStr.length > 300 ? '...' : ''}`);
          }
          
        } else {
          results.empty.push({
            ...endpoint,
            status: response.status,
            responseSize: responseText.length
          });
          
          console.log(`   ✅ SUCCESS (${response.status}) but NO DATA`);
          console.log(`   📭 Empty response or no results found`);
          console.log(`   📄 Response: ${responseText.substring(0, 200)}`);
        }
        
      } else if (response.status === 401) {
        console.log(`   🔒 STILL REQUIRES AUTH (${response.status})`);
        console.log(`   ℹ️  Authentication may not have worked properly`);
        
      } else {
        results.errors.push({
          ...endpoint,
          status: response.status,
          error: responseText
        });
        console.log(`   ❌ ERROR (${response.status})`);
        console.log(`   📄 Response: ${responseText.substring(0, 200)}`);
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

  // Summary Report
  console.log(`📊 AUTHENTICATED API TEST SUMMARY`);
  console.log(`=================================\n`);

  console.log(`✅ WORKING WITH DATA (${results.working.length}):`);
  results.working.forEach(endpoint => {
    console.log(`   • ${endpoint.name}: ${endpoint.dataCount} items (${endpoint.responseSize} bytes)`);
  });

  console.log(`\n📭 WORKING BUT EMPTY (${results.empty.length}):`);
  results.empty.forEach(endpoint => {
    console.log(`   • ${endpoint.name}: No data returned`);
  });

  console.log(`\n❌ ERRORS (${results.errors.length}):`);
  results.errors.forEach(endpoint => {
    console.log(`   • ${endpoint.name}: ${endpoint.status || 'Network Error'}`);
  });

  // Alternative Testing Method
  console.log(`\n🌐 BROWSER-BASED TESTING RECOMMENDED`);
  console.log(`====================================`);
  console.log(`📋 For complete testing, use browser DevTools:`);
  console.log(`   1. Open ${PROD_URL}/auth/signin`);
  console.log(`   2. Open DevTools (F12) → Network tab`);
  console.log(`   3. Sign in with: pro@dealmecca.pro / test123`);
  console.log(`   4. Navigate to each section and watch API calls:`);
  console.log();
  console.log(`      🏢 Organizations: ${PROD_URL}/orgs/companies`);
  console.log(`         Should call: /api/orgs/companies`);
  console.log(`         Expected: List of 9 companies`);
  console.log();
  console.log(`      🔍 Search: ${PROD_URL}/search`);
  console.log(`         Should call: /api/companies?q=...`);
  console.log(`         Expected: Search results for companies/contacts`);
  console.log();
  console.log(`      📅 Events: ${PROD_URL}/events`);
  console.log(`         Should call: /api/events`);
  console.log(`         Expected: List of events (may be empty)`);
  console.log();
  console.log(`      💬 Forum: ${PROD_URL}/forum`);
  console.log(`         Should call: /api/forum/posts`);
  console.log(`         Expected: Forum posts and categories`);
  console.log();

  // Data Verification
  console.log(`\n📊 EXPECTED DATA IN PRODUCTION`);
  console.log(`==============================`);
  console.log(`Based on our database verification:`);
  console.log(`   • Companies: 9 (WPP Group, Omnicom Group, etc.)`);
  console.log(`   • Contacts: 8 (Various marketing professionals)`);
  console.log(`   • Events: 0 (Empty - needs sample data)`);
  console.log(`   • Forum Categories: 7 (Working)`);
  console.log(`   • Forum Posts: 0 (Empty - needs sample data)`);
  console.log();

  return {
    working: results.working.length,
    empty: results.empty.length,
    errors: results.errors.length,
    authWorked: sessionCookies !== null
  };
}

testAuthenticatedEndpoints().catch(console.error); 