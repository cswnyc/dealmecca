#!/usr/bin/env npx tsx

/**
 * Debug Organizations Functionality
 * 
 * Tests database seeding, API endpoints, and authentication flow
 */

import { prisma } from '../../lib/prisma';

const PRODUCTION_URL = 'https://website-gjgyoiava-cws-projects-e62034bb.vercel.app';

async function checkDatabaseCompanies() {
  console.log(`🔍 CHECKING PRODUCTION DATABASE FOR COMPANY DATA`);
  console.log(`=============================================\n`);

  try {
    // Check if companies exist
    const companyCount = await prisma.company.count();
    console.log(`📊 Total Companies in Database: ${companyCount}`);

    if (companyCount === 0) {
      console.log(`❌ NO COMPANIES FOUND - Database needs seeding!`);
      return false;
    } else {
      console.log(`✅ Companies exist in database`);
      
      // Show sample companies
      const sampleCompanies = await prisma.company.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          industry: true,
          employeeCount: true,
          verified: true
        }
      });
      
      console.log(`\n📋 Sample Companies:`);
      sampleCompanies.forEach((company, index) => {
        console.log(`   ${index + 1}. ${company.name} (${company.industry}) - ${company.employeeCount}`);
      });
      
      return true;
    }
  } catch (error: any) {
    console.log(`❌ Database Error: ${error.message}`);
    return false;
  }
}

async function testOrganizationRoutes() {
  console.log(`\n🌐 TESTING ORGANIZATION ROUTES`);
  console.log(`=============================\n`);

  const routes = [
    { path: '/orgs', name: 'Organizations Main Page' },
    { path: '/orgs/companies', name: 'Companies Browse Page' }, 
    { path: '/api/orgs/companies', name: 'Companies API Endpoint' },
    { path: '/api/orgs/companies?limit=5', name: 'Companies API with Pagination' },
    { path: '/api/orgs/industries', name: 'Industries API Endpoint' }
  ];

  for (const route of routes) {
    try {
      const response = await fetch(`${PRODUCTION_URL}${route.path}`);
      
      if (route.path.startsWith('/api/')) {
        // API route - check for auth error vs server error
        const data = await response.text();
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.code === 'UNAUTHORIZED') {
            console.log(`🔒 ${route.name}: Properly secured (requires auth)`);
          } else if (response.ok) {
            console.log(`✅ ${route.name}: Working`);
          } else {
            console.log(`❌ ${route.name}: Error - ${jsonData.error || 'Unknown'}`);
          }
        } catch {
          console.log(`❌ ${route.name}: Invalid JSON response`);
        }
      } else {
        // Frontend route - check if accessible
        if (response.ok || response.url.includes('/auth/signin')) {
          console.log(`✅ ${route.name}: Working (${response.status})`);
        } else {
          console.log(`❌ ${route.name}: Error (${response.status})`);
        }
      }
    } catch (error: any) {
      console.log(`❌ ${route.name}: Network error - ${error.message}`);
    }
  }
}

async function checkAuthenticationFlow() {
  console.log(`\n🔐 CHECKING AUTHENTICATION FLOW`);
  console.log(`===============================\n`);

  try {
    // Test sign in page
    const signInResponse = await fetch(`${PRODUCTION_URL}/auth/signin`);
    if (signInResponse.ok) {
      console.log(`✅ Sign In Page: Accessible`);
    } else {
      console.log(`❌ Sign In Page: Error (${signInResponse.status})`);
    }

    // Test auth session endpoint
    const sessionResponse = await fetch(`${PRODUCTION_URL}/api/auth/session`);
    if (sessionResponse.ok) {
      console.log(`✅ Auth Session Endpoint: Working`);
    } else {
      console.log(`❌ Auth Session Endpoint: Error (${sessionResponse.status})`);
    }

  } catch (error: any) {
    console.log(`❌ Authentication Flow Error: ${error.message}`);
  }
}

async function generateSeedScript() {
  console.log(`\n🌱 SEED PRODUCTION DATABASE SCRIPT`);
  console.log(`=================================\n`);
  
  console.log(`If database is empty, run this command to seed it:\n`);
  console.log(`DATABASE_URL="postgresql://neondb_owner:npg_B3Sdq4aviYgN@ep-wild-lake-afcy495t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma db seed\n`);
}

async function showDiagnosisAndFixes() {
  console.log(`\n🎯 DIAGNOSIS & FIXES`);
  console.log(`===================\n`);

  const hasCompanies = await checkDatabaseCompanies();
  
  if (!hasCompanies) {
    console.log(`🚨 ISSUE 1: NO COMPANY DATA IN PRODUCTION DATABASE`);
    console.log(`   Fix: Seed the production database with companies`);
    console.log(`   Command: DATABASE_URL="postgresql://..." npx prisma db seed\n`);
  }

  console.log(`🔍 ISSUE 2: API REQUIRES AUTHENTICATION (This is correct!)`);
  console.log(`   Status: ✅ Working as designed`);
  console.log(`   Fix: Frontend needs to handle authentication state\n`);

  console.log(`🌐 ISSUE 3: Check Frontend Organization Pages`);
  console.log(`   Test: Visit ${PRODUCTION_URL}/orgs after signing in`);
  console.log(`   Expected: Should show company listings after authentication\n`);

  console.log(`📝 NEXT STEPS:`);
  console.log(`   1. 🌱 Seed production database (if needed)`);
  console.log(`   2. 🔐 Test sign up/sign in flow`);
  console.log(`   3. 🏢 Browse organizations while logged in`);
  console.log(`   4. 🔍 Test search and filtering`);
}

async function main() {
  console.log(`\n🚀 ORGANIZATIONS DEBUG REPORT`);
  console.log(`=============================`);
  console.log(`🌐 Production URL: ${PRODUCTION_URL}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}\n`);

  await testOrganizationRoutes();
  await checkAuthenticationFlow();
  await showDiagnosisAndFixes();
  
  // Only check database if we have access
  try {
    await checkDatabaseCompanies();
  } catch {
    console.log(`\n⚠️  Note: Using production DATABASE_URL for local database check`);
    generateSeedScript();
  }
}

main().catch(console.error); 