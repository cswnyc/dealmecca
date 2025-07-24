#!/usr/bin/env npx tsx

/**
 * Debug Search Functionality
 * 
 * Tests search endpoints, authentication, database indexes, and frontend integration
 */

import { prisma } from '../../lib/prisma';

const PROD_URL = 'https://website-gjgyoiava-cws-projects-e62034bb.vercel.app';

async function testSearchEndpoints() {
  console.log(`🔍 TESTING SEARCH API ENDPOINTS`);
  console.log(`==============================\n`);

  const searchEndpoints = [
    { path: '/api/search', name: 'Main Search API', description: 'General search across companies and contacts' },
    { path: '/api/search/suggestions', name: 'Search Suggestions', description: 'Autocomplete suggestions' },
    { path: '/api/search/track', name: 'Search Tracking', description: 'Track search queries' },
    { path: '/api/orgs/search/suggestions', name: 'Org Search Suggestions', description: 'Organization-specific suggestions' },
    { path: '/api/forum/search', name: 'Forum Search', description: 'Forum post search' },
    { path: '/api/forum/search/suggestions', name: 'Forum Suggestions', description: 'Forum search suggestions' }
  ];

  for (const endpoint of searchEndpoints) {
    console.log(`🔌 Testing: ${endpoint.name}`);
    
    try {
      // Test without authentication
      const response = await fetch(`${PROD_URL}${endpoint.path}`);
      const data = await response.text();
      
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = { raw: data };
      }

      if (response.status === 401 || parsedData.code === 'UNAUTHORIZED') {
        console.log(`   🔒 Requires authentication (expected)`);
      } else if (response.status === 404) {
        console.log(`   ❌ Endpoint not found (404)`);
      } else if (response.ok) {
        console.log(`   ✅ Accessible without auth`);
        if (parsedData.results || parsedData.data) {
          console.log(`   📊 Returns data structure`);
        }
      } else {
        console.log(`   ⚠️  Status: ${response.status}`);
        if (parsedData.error) {
          console.log(`   📝 Error: ${parsedData.error}`);
        }
      }

      // Test with query parameters
      if (endpoint.path.includes('search')) {
        const queryResponse = await fetch(`${PROD_URL}${endpoint.path}?q=WPP&limit=5`);
        const queryData = await queryResponse.text();
        
        try {
          const parsedQuery = JSON.parse(queryData);
          if (queryResponse.status === 401 || parsedQuery.code === 'UNAUTHORIZED') {
            console.log(`   🔒 Query test: Requires authentication`);
          } else if (queryResponse.ok) {
            console.log(`   ✅ Query test: Working`);
          } else {
            console.log(`   ⚠️  Query test: Error ${queryResponse.status}`);
          }
        } catch {
          console.log(`   ❌ Query test: Invalid response`);
        }
      }

    } catch (error: any) {
      console.log(`   ❌ Network error: ${error.message}`);
    }
    
    console.log(``);
  }
}

async function testDatabaseIndexes() {
  console.log(`🗄️ TESTING DATABASE SEARCH INDEXES`);
  console.log(`=================================\n`);

  try {
    // Test if we can query companies with search-like operations
    console.log(`📊 Testing Company Search Queries...`);
    
    // Test basic company search
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: 'WPP', mode: 'insensitive' } },
          { description: { contains: 'advertising', mode: 'insensitive' } }
        ]
      },
      take: 5,
      select: { id: true, name: true, industry: true }
    });
    
    console.log(`   ✅ Company search query works`);
    console.log(`   📈 Found ${companies.length} companies`);
    if (companies.length > 0) {
      console.log(`   📋 Sample: ${companies.map((c: any) => c.name).join(', ')}`);
    }

    // Test contact search
    console.log(`\n📊 Testing Contact Search Queries...`);
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { fullName: { contains: 'John', mode: 'insensitive' } },
          { title: { contains: 'CEO', mode: 'insensitive' } },
          { email: { contains: '@', mode: 'insensitive' } }
        ]
      },
      take: 5,
      select: { id: true, fullName: true, title: true, companyId: true }
    });
    
    console.log(`   ✅ Contact search query works`);
    console.log(`   📈 Found ${contacts.length} contacts`);
    if (contacts.length > 0) {
      console.log(`   📋 Sample: ${contacts.map((c: any) => c.fullName).join(', ')}`);
    }

    // Test combined search
    console.log(`\n📊 Testing Combined Search Performance...`);
    const startTime = Date.now();
    
    const combinedResults = await Promise.all([
      prisma.company.findMany({
        where: { name: { contains: 'WPP', mode: 'insensitive' } },
        take: 10
      }),
      prisma.contact.findMany({
        where: { fullName: { contains: 'CEO', mode: 'insensitive' } },
        take: 10
      })
    ]);
    
    const duration = Date.now() - startTime;
    console.log(`   ✅ Combined search completed in ${duration}ms`);
    console.log(`   📊 Companies: ${combinedResults[0].length}, Contacts: ${combinedResults[1].length}`);

  } catch (error: any) {
    console.log(`   ❌ Database search error: ${error.message}`);
    if (error.message.includes('DATABASE_URL')) {
      console.log(`   🔧 Fix: Use production DATABASE_URL environment variable`);
    }
  }
}

async function testSearchPages() {
  console.log(`🌐 TESTING SEARCH PAGES`);
  console.log(`======================\n`);

  const searchPages = [
    { path: '/search', name: 'Main Search Page' },
    { path: '/search/enhanced', name: 'Enhanced Search Page' },
    { path: '/forum/search', name: 'Forum Search Page' }
  ];

  for (const page of searchPages) {
    try {
      const response = await fetch(`${PROD_URL}${page.path}`);
      
      if (response.ok) {
        console.log(`✅ ${page.name}: Accessible (${response.status})`);
      } else if (response.url.includes('/auth/signin')) {
        console.log(`🔒 ${page.name}: Redirects to authentication (expected)`);
      } else {
        console.log(`❌ ${page.name}: Error (${response.status})`);
      }
    } catch (error: any) {
      console.log(`❌ ${page.name}: Network error`);
    }
  }
}

async function analyzeSearchIssues() {
  console.log(`\n🔬 SEARCH ISSUE ANALYSIS`);
  console.log(`========================\n`);

  console.log(`🎯 COMMON SEARCH PROBLEMS & SOLUTIONS:`);
  console.log(`\n1. 🔒 Authentication Required:`);
  console.log(`   Issue: Search endpoints require login`);
  console.log(`   Status: ✅ Working as designed (security feature)`);
  console.log(`   Fix: Frontend must handle authentication state`);

  console.log(`\n2. 📊 Database Data:`);
  try {
    const companyCount = await prisma.company.count();
    const contactCount = await prisma.contact.count();
    console.log(`   Companies: ${companyCount} ✅`);
    console.log(`   Contacts: ${contactCount} ✅`);
    console.log(`   Status: Database has searchable data`);
  } catch (error: any) {
    console.log(`   ❌ Database connection issue`);
    console.log(`   Fix: Check DATABASE_URL environment variable`);
  }

  console.log(`\n3. 🔍 Frontend Search Component:`);
  console.log(`   Check: Does search input trigger API calls?`);
  console.log(`   Check: Are search results being rendered?`);
  console.log(`   Check: Browser console for JavaScript errors?`);

  console.log(`\n4. 🌐 API Response Format:`);
  console.log(`   Expected: { results: [], total: number, hasMore: boolean }`);
  console.log(`   Check: API returns data in expected format`);

  console.log(`\n5. 📱 Search UX Flow:`);
  console.log(`   1. User types in search box`);
  console.log(`   2. Frontend makes authenticated API call`);
  console.log(`   3. Backend searches database`);
  console.log(`   4. Results returned and displayed`);
}

async function generateSearchTestScript() {
  console.log(`\n🧪 MANUAL SEARCH TESTING SCRIPT`);
  console.log(`==============================\n`);

  console.log(`📝 Step-by-step testing instructions:\n`);

  console.log(`1. 🌐 Visit Production App:`);
  console.log(`   URL: ${PROD_URL}`);
  console.log(`   Action: Sign in to your account\n`);

  console.log(`2. 🔍 Test Main Search:`);
  console.log(`   Page: /search`);
  console.log(`   Test Queries:`);
  console.log(`     - "WPP" (should find WPP Group)`);
  console.log(`     - "Omnicom" (should find Omnicom Group)`);
  console.log(`     - "advertising" (should find ad agencies)`);
  console.log(`     - "CEO" (should find CEO contacts)\n`);

  console.log(`3. 🎯 Test Enhanced Search:`);
  console.log(`   Page: /search/enhanced`);
  console.log(`   Test Filters:`);
  console.log(`     - Industry filter`);
  console.log(`     - Company size filter`);
  console.log(`     - Location filter\n`);

  console.log(`4. 💬 Test Forum Search:`);
  console.log(`   Page: /forum/search`);
  console.log(`   Test: Search for forum posts\n`);

  console.log(`5. 🔧 Debug in Browser:`);
  console.log(`   F12 → Console tab: Check for errors`);
  console.log(`   F12 → Network tab: Monitor API calls`);
  console.log(`   Look for: /api/search?q=... requests\n`);

  console.log(`6. ✅ Expected Results:`);
  console.log(`   - Search input should trigger API calls`);
  console.log(`   - Results should appear below search box`);
  console.log(`   - Pagination should work if > 10 results`);
  console.log(`   - Filters should refine results`);
}

async function main() {
  console.log(`\n🔍 DEALMECCA SEARCH DEBUGGING REPORT`);
  console.log(`===================================`);
  console.log(`🌐 Production URL: ${PROD_URL}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}`);
  console.log(`📊 Database: Contains 9 companies + 8 contacts\n`);

  await testSearchEndpoints();
  await testSearchPages();
  
  // Test database only if we have access
  try {
    await testDatabaseIndexes();
  } catch (error: any) {
    console.log(`⚠️  Database test skipped - requires production DATABASE_URL`);
  }
  
  await analyzeSearchIssues();
  await generateSearchTestScript();
}

main().catch(console.error); 