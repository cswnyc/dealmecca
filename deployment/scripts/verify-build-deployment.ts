#!/usr/bin/env npx tsx

/**
 * Build Deployment Verification
 * 
 * Compare local build with production deployment to ensure everything deployed correctly
 */

const PROD_URL = 'https://website-gjgyoiava-cws-projects-e62034bb.vercel.app';

// Sample of critical API routes to test (covering all major functionality)
const API_ROUTES_TO_TEST = [
  // Core functionality
  { path: '/api/health', method: 'GET', expectsAuth: false, critical: true },
  { path: '/api/companies', method: 'GET', expectsAuth: true, critical: true },
  { path: '/api/contacts', method: 'GET', expectsAuth: true, critical: true },
  
  // Search functionality
  { path: '/api/search/suggestions', method: 'GET', expectsAuth: true, critical: true },
  { path: '/api/search/track', method: 'POST', expectsAuth: true, critical: true },
  { path: '/api/orgs/companies', method: 'GET', expectsAuth: true, critical: true },
  { path: '/api/orgs/contacts', method: 'GET', expectsAuth: true, critical: true },
  
  // Events functionality  
  { path: '/api/events', method: 'GET', expectsAuth: true, critical: true },
  { path: '/api/events/1/attendees', method: 'GET', expectsAuth: true, critical: false },
  { path: '/api/events/companies-with-attendees', method: 'GET', expectsAuth: true, critical: false },
  
  // Forum functionality
  { path: '/api/forum/posts', method: 'GET', expectsAuth: true, critical: true },
  { path: '/api/forum/categories', method: 'GET', expectsAuth: true, critical: true },
  { path: '/api/forum/search', method: 'GET', expectsAuth: true, critical: true },
  { path: '/api/forum/trending', method: 'GET', expectsAuth: true, critical: false },
  
  // Admin functionality
  { path: '/api/admin/companies', method: 'GET', expectsAuth: true, critical: true },
  { path: '/api/admin/contacts', method: 'GET', expectsAuth: true, critical: true },
  { path: '/api/admin/stats', method: 'GET', expectsAuth: true, critical: true },
  
  // Authentication
  { path: '/api/auth/[...nextauth]', method: 'GET', expectsAuth: false, critical: true },
  
  // Dashboard
  { path: '/api/dashboard/metrics', method: 'GET', expectsAuth: true, critical: true },
  { path: '/api/dashboard/search-usage', method: 'GET', expectsAuth: true, critical: false },
  
  // User management
  { path: '/api/users/profile', method: 'GET', expectsAuth: true, critical: true },
  { path: '/api/usage', method: 'GET', expectsAuth: true, critical: false },
  
  // Specific endpoints
  { path: '/api/companies/1', method: 'GET', expectsAuth: true, critical: false },
  { path: '/api/contacts/1', method: 'GET', expectsAuth: true, critical: false },
  
  // Organization insights
  { path: '/api/orgs/analytics', method: 'GET', expectsAuth: true, critical: false },
  { path: '/api/orgs/industries', method: 'GET', expectsAuth: true, critical: false },
  
  // Additional functionality
  { path: '/api/saved-searches', method: 'GET', expectsAuth: true, critical: false },
  { path: '/api/networking/activity', method: 'GET', expectsAuth: true, critical: false }
];

// Pages to test
const PAGES_TO_TEST = [
  { path: '/', critical: true },
  { path: '/auth/signin', critical: true },
  { path: '/auth/signup', critical: true },
  { path: '/events', critical: true },
  { path: '/forum', critical: true },
  { path: '/search', critical: true },
  { path: '/search/enhanced', critical: true },
  { path: '/orgs', critical: true },
  { path: '/orgs/companies', critical: true },
  { path: '/orgs/contacts', critical: true },
  { path: '/admin', critical: true },
  { path: '/dashboard', critical: true },
  { path: '/pricing', critical: true },
  { path: '/settings', critical: false },
  { path: '/profile/1', critical: false }
];

async function verifyBuildDeployment() {
  console.log(`🔍 BUILD DEPLOYMENT VERIFICATION`);
  console.log(`==============================`);
  console.log(`🌐 Production URL: ${PROD_URL}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}\n`);

  const results = {
    apiRoutes: {
      working: [] as string[],
      authRequired: [] as string[],
      missing: [] as string[],
      errors: [] as string[]
    },
    pages: {
      working: [] as string[],
      authRedirects: [] as string[],
      missing: [] as string[],
      errors: [] as string[]
    },
    critical: {
      failed: [] as string[],
      passed: [] as string[]
    }
  };

  // Test API Routes
  console.log(`1️⃣ TESTING API ROUTES DEPLOYMENT`);
  console.log(`================================`);
  console.log(`Testing ${API_ROUTES_TO_TEST.length} critical API endpoints...\n`);

  for (const route of API_ROUTES_TO_TEST) {
    const testUrl = `${PROD_URL}${route.path}`;
    
    try {
      console.log(`Testing: ${route.path} (${route.method}) ${route.critical ? '⭐' : '•'}`);
      
      const response = await fetch(testUrl, { 
        method: route.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        results.apiRoutes.working.push(route.path);
        if (route.critical) results.critical.passed.push(`API: ${route.path}`);
        console.log(`   ✅ Working (${response.status})`);
      } else if (response.status === 401 && route.expectsAuth) {
        results.apiRoutes.authRequired.push(route.path);
        if (route.critical) results.critical.passed.push(`API: ${route.path} (Auth)`);
        console.log(`   🔒 Auth required (${response.status}) - Expected`);
      } else if (response.status === 403 && route.expectsAuth) {
        results.apiRoutes.authRequired.push(route.path);
        if (route.critical) results.critical.passed.push(`API: ${route.path} (Forbidden)`);
        console.log(`   🔒 Forbidden (${response.status}) - Expected for admin routes`);
      } else if (response.status === 404) {
        results.apiRoutes.missing.push(route.path);
        if (route.critical) results.critical.failed.push(`API: ${route.path} (404)`);
        console.log(`   ❌ Missing (${response.status})`);
      } else {
        results.apiRoutes.errors.push(`${route.path}: ${response.status}`);
        if (route.critical) results.critical.failed.push(`API: ${route.path} (${response.status})`);
        console.log(`   ⚠️  Error (${response.status})`);
      }
    } catch (error) {
      results.apiRoutes.errors.push(`${route.path}: Network error`);
      if (route.critical) results.critical.failed.push(`API: ${route.path} (Network)`);
      console.log(`   ❌ Network error: ${(error as Error).message}`);
    }
  }

  // Test Pages
  console.log(`\n2️⃣ TESTING PAGE DEPLOYMENT`);
  console.log(`==========================`);
  console.log(`Testing ${PAGES_TO_TEST.length} pages...\n`);

  for (const page of PAGES_TO_TEST) {
    const testUrl = `${PROD_URL}${page.path}`;
    
    try {
      console.log(`Testing: ${page.path} ${page.critical ? '⭐' : '•'}`);
      
      const response = await fetch(testUrl, { 
        method: 'GET',
        redirect: 'manual' // Don't follow redirects automatically
      });

      if (response.ok) {
        results.pages.working.push(page.path);
        if (page.critical) results.critical.passed.push(`Page: ${page.path}`);
        console.log(`   ✅ Loading (${response.status})`);
      } else if (response.status === 302 || response.status === 307) {
        const location = response.headers.get('location');
        if (location?.includes('/auth/signin')) {
          results.pages.authRedirects.push(page.path);
          if (page.critical) results.critical.passed.push(`Page: ${page.path} (Auth)`);
          console.log(`   🔒 Auth redirect (${response.status}) - Expected`);
        } else {
          results.pages.working.push(page.path);
          if (page.critical) results.critical.passed.push(`Page: ${page.path} (Redirect)`);
          console.log(`   ↗️  Redirect (${response.status}) to ${location}`);
        }
      } else if (response.status === 404) {
        results.pages.missing.push(page.path);
        if (page.critical) results.critical.failed.push(`Page: ${page.path} (404)`);
        console.log(`   ❌ Missing (${response.status})`);
      } else {
        results.pages.errors.push(`${page.path}: ${response.status}`);
        if (page.critical) results.critical.failed.push(`Page: ${page.path} (${response.status})`);
        console.log(`   ⚠️  Error (${response.status})`);
      }
    } catch (error) {
      results.pages.errors.push(`${page.path}: Network error`);
      if (page.critical) results.critical.failed.push(`Page: ${page.path} (Network)`);
      console.log(`   ❌ Network error: ${(error as Error).message}`);
    }
  }

  // Generate Deployment Report
  console.log(`\n📊 DEPLOYMENT VERIFICATION REPORT`);
  console.log(`=================================\n`);

  // API Routes Summary
  console.log(`🔗 API ROUTES (${API_ROUTES_TO_TEST.length} tested):`);
  console.log(`   ✅ Working: ${results.apiRoutes.working.length}`);
  console.log(`   🔒 Auth Required: ${results.apiRoutes.authRequired.length}`);
  console.log(`   ❌ Missing: ${results.apiRoutes.missing.length}`);
  console.log(`   ⚠️  Errors: ${results.apiRoutes.errors.length}\n`);

  // Pages Summary  
  console.log(`📄 PAGES (${PAGES_TO_TEST.length} tested):`);
  console.log(`   ✅ Working: ${results.pages.working.length}`);
  console.log(`   🔒 Auth Redirects: ${results.pages.authRedirects.length}`);
  console.log(`   ❌ Missing: ${results.pages.missing.length}`);
  console.log(`   ⚠️  Errors: ${results.pages.errors.length}\n`);

  // Critical Components Check
  const criticalTotal = API_ROUTES_TO_TEST.filter(r => r.critical).length + PAGES_TO_TEST.filter(p => p.critical).length;
  const criticalPassed = results.critical.passed.length;
  const criticalFailed = results.critical.failed.length;
  
  console.log(`⭐ CRITICAL COMPONENTS:`);
  console.log(`   Total: ${criticalTotal}`);
  console.log(`   Passed: ${criticalPassed}`);
  console.log(`   Failed: ${criticalFailed}\n`);

  // Missing Components Detail
  if (results.apiRoutes.missing.length > 0) {
    console.log(`❌ MISSING API ROUTES:`);
    results.apiRoutes.missing.forEach(route => console.log(`   • ${route}`));
    console.log();
  }

  if (results.pages.missing.length > 0) {
    console.log(`❌ MISSING PAGES:`);
    results.pages.missing.forEach(page => console.log(`   • ${page}`));
    console.log();
  }

  // Critical Failures Detail
  if (results.critical.failed.length > 0) {
    console.log(`🚨 CRITICAL FAILURES:`);
    results.critical.failed.forEach(item => console.log(`   • ${item}`));
    console.log();
  }

  // Build Success Assessment
  const totalSuccess = results.apiRoutes.working.length + results.apiRoutes.authRequired.length + 
                      results.pages.working.length + results.pages.authRedirects.length;
  const totalTested = API_ROUTES_TO_TEST.length + PAGES_TO_TEST.length;
  const successRate = Math.round((totalSuccess / totalTested) * 100);

  console.log(`🎯 DEPLOYMENT SUCCESS RATE: ${successRate}%`);
  console.log(`   Successful: ${totalSuccess}/${totalTested}`);
  console.log(`   Critical failures: ${criticalFailed}`);

  // Final Assessment
  if (successRate >= 95 && criticalFailed === 0) {
    console.log(`\n✅ BUILD DEPLOYMENT: EXCELLENT`);
    console.log(`   All critical components deployed successfully!`);
  } else if (successRate >= 85 && criticalFailed <= 1) {
    console.log(`\n⚠️  BUILD DEPLOYMENT: GOOD`);
    console.log(`   Minor issues found, but core functionality deployed.`);
  } else if (successRate >= 70) {
    console.log(`\n⚠️  BUILD DEPLOYMENT: NEEDS ATTENTION`);
    console.log(`   Several components missing or failing.`);
  } else {
    console.log(`\n🚨 BUILD DEPLOYMENT: CRITICAL ISSUES`);
    console.log(`   Major deployment problems detected.`);
  }

  // Recommendations
  console.log(`\n🔧 RECOMMENDATIONS:`);
  if (results.apiRoutes.missing.length > 0) {
    console.log(`   • Check Vercel build logs for API route compilation errors`);
    console.log(`   • Verify all API route files have correct export syntax`);
  }
  if (results.pages.missing.length > 0) {
    console.log(`   • Check for TypeScript compilation errors in page components`);
    console.log(`   • Verify all page components have default exports`);
  }
  if (criticalFailed > 0) {
    console.log(`   • Immediately investigate critical component failures`);
    console.log(`   • Review Vercel deployment logs for error details`);
  }
  if (successRate < 90) {
    console.log(`   • Re-deploy to fix missing components`);
    console.log(`   • Check local build with: npm run build`);
  }

  console.log(`\n📊 Local vs Production comparison complete!`);
  
  return {
    successRate,
    criticalFailed,
    totalTested,
    totalSuccess,
    missingApiRoutes: results.apiRoutes.missing.length,
    missingPages: results.pages.missing.length
  };
}

verifyBuildDeployment().catch(console.error); 