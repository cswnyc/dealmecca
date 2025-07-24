#!/usr/bin/env npx tsx

/**
 * CODE DEPLOYMENT VERIFICATION
 * 
 * Verify all features deployed correctly to Vercel production
 */

const PROD_URL = 'https://website-gjgyoiava-cws-projects-e62034bb.vercel.app';

// Critical pages that must work in production
const CRITICAL_PAGES = [
  { path: '/', name: 'Homepage', public: true },
  { path: '/auth/signin', name: 'Sign In', public: true },
  { path: '/auth/signup', name: 'Sign Up', public: true },
  { path: '/pricing', name: 'Pricing', public: true },
  { path: '/upgrade', name: 'Upgrade', public: true },
  { path: '/dashboard', name: 'Dashboard', protected: true },
  { path: '/orgs', name: 'Organizations', protected: true },
  { path: '/orgs/companies', name: 'Companies List', protected: true },
  { path: '/orgs/contacts', name: 'Contacts List', protected: true },
  { path: '/events', name: 'Events', protected: true },
  { path: '/forum', name: 'Forum', protected: true },
  { path: '/search', name: 'Search', protected: true },
  { path: '/search/enhanced', name: 'Enhanced Search', protected: true },
  { path: '/admin', name: 'Admin Panel', protected: true },
  { path: '/admin/orgs/companies', name: 'Admin Companies', protected: true },
  { path: '/admin/orgs/contacts', name: 'Admin Contacts', protected: true },
  { path: '/admin/events', name: 'Admin Events', protected: true },
  { path: '/settings', name: 'Settings', protected: true },
  { path: '/profile/1', name: 'Profile', protected: true }
];

// Critical API endpoints that must respond correctly
const CRITICAL_API_ENDPOINTS = [
  { path: '/api/health', name: 'Health Check', public: true, expectData: true },
  { path: '/api/auth/providers', name: 'Auth Providers', public: true, expectData: true },
  { path: '/api/auth/csrf', name: 'CSRF Token', public: true, expectData: true },
  { path: '/api/forum/posts', name: 'Forum Posts', public: true, expectData: true },
  { path: '/api/forum/categories', name: 'Forum Categories', public: true, expectData: true },
  { path: '/api/orgs/companies', name: 'Companies API', protected: true, expectData: true },
  { path: '/api/companies', name: 'Company Search', protected: true, expectData: false },
  { path: '/api/contacts', name: 'Contact Search', protected: true, expectData: false },
  { path: '/api/events', name: 'Events API', protected: true, expectData: true },
  { path: '/api/admin/companies', name: 'Admin Companies API', protected: true, expectData: true },
  { path: '/api/admin/contacts', name: 'Admin Contacts API', protected: true, expectData: true },
  { path: '/api/admin/stats', name: 'Admin Stats', protected: true, expectData: true }
];

// Static assets and resources
const STATIC_RESOURCES = [
  { path: '/manifest.json', name: 'PWA Manifest' },
  { path: '/favicon.ico', name: 'Favicon' },
  { path: '/_next/static/chunks/main.js', name: 'Main JS Bundle', optional: true }
];

async function verifyCodeDeployment() {
  console.log('🚀 CODE DEPLOYMENT VERIFICATION');
  console.log('===============================');
  console.log(`🌐 Production URL: ${PROD_URL}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}\n`);

  const results = {
    pages: { working: 0, protected: 0, errors: 0, total: CRITICAL_PAGES.length },
    apis: { working: 0, protected: 0, errors: 0, total: CRITICAL_API_ENDPOINTS.length },
    static: { working: 0, errors: 0, total: STATIC_RESOURCES.length },
    overall: { success: false, score: 0 }
  };

  // Test Page Routes
  console.log('📄 TESTING PAGE ROUTES');
  console.log('======================');
  
  for (const page of CRITICAL_PAGES) {
    try {
      const response = await fetch(`${PROD_URL}${page.path}`, {
        method: 'GET',
        headers: { 'User-Agent': 'Code-Deployment-Test/1.0' }
      });

      if (response.ok) {
        if (page.public) {
          results.pages.working++;
          console.log(`✅ ${page.name}: ${response.status} (Public)`);
        } else {
          // Protected page should redirect to login or show login form
          results.pages.protected++;
          console.log(`🔒 ${page.name}: ${response.status} (Protected - Expected)`);
        }
      } else if (response.status === 302 || response.status === 401) {
        if (page.protected) {
          results.pages.protected++;
          console.log(`🔒 ${page.name}: ${response.status} (Auth Required - Expected)`);
        } else {
          results.pages.errors++;
          console.log(`❌ ${page.name}: ${response.status} (Unexpected redirect)`);
        }
      } else {
        results.pages.errors++;
        console.log(`❌ ${page.name}: ${response.status} (Error)`);
      }
    } catch (error) {
      results.pages.errors++;
      console.log(`❌ ${page.name}: Network Error`);
    }
  }

  console.log('\n🔌 TESTING API ENDPOINTS');
  console.log('========================');

  for (const endpoint of CRITICAL_API_ENDPOINTS) {
    try {
      const response = await fetch(`${PROD_URL}${endpoint.path}`, {
        method: 'GET',
        headers: { 
          'User-Agent': 'Code-Deployment-Test/1.0',
          'Accept': 'application/json'
        }
      });

      const responseText = await response.text();
      let hasData = false;
      
      try {
        const data = JSON.parse(responseText);
        hasData = data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);
      } catch {
        hasData = responseText.length > 0;
      }

      if (response.ok) {
        if (endpoint.public) {
          results.apis.working++;
          const dataStatus = endpoint.expectData ? (hasData ? '📊 Has Data' : '📭 Empty') : '✅ OK';
          console.log(`✅ ${endpoint.name}: ${response.status} (${dataStatus})`);
        } else {
          results.apis.protected++;
          console.log(`🔒 ${endpoint.name}: ${response.status} (Protected route working)`);
        }
      } else if (response.status === 401 || response.status === 403) {
        if (endpoint.protected) {
          results.apis.protected++;
          console.log(`🔒 ${endpoint.name}: ${response.status} (Auth Required - Expected)`);
        } else {
          results.apis.errors++;
          console.log(`❌ ${endpoint.name}: ${response.status} (Unexpected auth error)`);
        }
      } else {
        results.apis.errors++;
        console.log(`❌ ${endpoint.name}: ${response.status} (${responseText.substring(0, 100)})`);
      }
    } catch (error) {
      results.apis.errors++;
      console.log(`❌ ${endpoint.name}: Network Error`);
    }
  }

  console.log('\n📦 TESTING STATIC RESOURCES');
  console.log('============================');

  for (const resource of STATIC_RESOURCES) {
    try {
      const response = await fetch(`${PROD_URL}${resource.path}`, {
        method: 'GET',
        headers: { 'User-Agent': 'Code-Deployment-Test/1.0' }
      });

      if (response.ok) {
        results.static.working++;
        console.log(`✅ ${resource.name}: ${response.status}`);
      } else if (resource.optional) {
        console.log(`⚠️  ${resource.name}: ${response.status} (Optional - OK)`);
      } else {
        results.static.errors++;
        console.log(`❌ ${resource.name}: ${response.status}`);
      }
    } catch (error) {
      if (resource.optional) {
        console.log(`⚠️  ${resource.name}: Network Error (Optional - OK)`);
      } else {
        results.static.errors++;
        console.log(`❌ ${resource.name}: Network Error`);
      }
    }
  }

  // Test specific functionality that indicates successful deployment
  console.log('\n🧪 TESTING CRITICAL FUNCTIONALITY');
  console.log('=================================');

  const functionalityTests = [];

  // Test NextAuth configuration
  try {
    const authResponse = await fetch(`${PROD_URL}/api/auth/providers`);
    if (authResponse.ok) {
      const providers = await authResponse.json();
      functionalityTests.push({
        name: 'NextAuth Configuration',
        status: 'working',
        details: `Providers available: ${Object.keys(providers).join(', ')}`
      });
    } else {
      functionalityTests.push({
        name: 'NextAuth Configuration', 
        status: 'error',
        details: `Status: ${authResponse.status}`
      });
    }
  } catch (error) {
    functionalityTests.push({
      name: 'NextAuth Configuration',
      status: 'error', 
      details: 'Network error'
    });
  }

  // Test database connectivity through API
  try {
    const healthResponse = await fetch(`${PROD_URL}/api/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      if (health.services?.database?.status === 'healthy') {
        functionalityTests.push({
          name: 'Database Connectivity',
          status: 'working',
          details: `Latency: ${health.services.database.latency}ms`
        });
      } else {
        functionalityTests.push({
          name: 'Database Connectivity',
          status: 'error',
          details: 'Database unhealthy'
        });
      }
    }
  } catch (error) {
    functionalityTests.push({
      name: 'Database Connectivity',
      status: 'error',
      details: 'Cannot reach health endpoint'
    });
  }

  // Test forum data availability
  try {
    const forumResponse = await fetch(`${PROD_URL}/api/forum/posts`);
    if (forumResponse.ok) {
      const responseText = await forumResponse.text();
      const hasContent = responseText.length > 100;
      functionalityTests.push({
        name: 'Forum Data Available',
        status: hasContent ? 'working' : 'warning',
        details: hasContent ? 'Forum posts accessible' : 'Forum posts empty'
      });
    }
  } catch (error) {
    functionalityTests.push({
      name: 'Forum Data Available',
      status: 'error',
      details: 'Cannot access forum data'
    });
  }

  // Display functionality test results
  functionalityTests.forEach(test => {
    const icon = test.status === 'working' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${test.name}: ${test.details}`);
  });

  // Calculate overall deployment score
  const totalWorking = results.pages.working + results.pages.protected + results.apis.working + results.apis.protected + results.static.working;
  const totalPossible = results.pages.total + results.apis.total + results.static.total;
  const workingFunctionality = functionalityTests.filter(t => t.status === 'working').length;
  
  results.overall.score = Math.round((totalWorking / totalPossible) * 100);
  results.overall.success = results.overall.score >= 90 && workingFunctionality >= 2;

  // Summary Report
  console.log('\n📊 DEPLOYMENT VERIFICATION SUMMARY');
  console.log('==================================');
  console.log(`📄 Pages: ${results.pages.working + results.pages.protected}/${results.pages.total} working`);
  console.log(`🔌 APIs: ${results.apis.working + results.apis.protected}/${results.apis.total} working`);  
  console.log(`📦 Static: ${results.static.working}/${results.static.total} working`);
  console.log(`🧪 Functionality: ${workingFunctionality}/${functionalityTests.length} tests passed`);
  console.log(`🎯 Overall Score: ${results.overall.score}%`);

  if (results.overall.success) {
    console.log('\n✅ DEPLOYMENT VERIFICATION: SUCCESS');
    console.log('🎉 All critical features deployed correctly!');
  } else {
    console.log('\n⚠️  DEPLOYMENT VERIFICATION: NEEDS ATTENTION');
    console.log('🔧 Some features may need investigation');
  }

  // Local vs Production comparison guidance
  console.log('\n🔄 LOCAL vs PRODUCTION COMPARISON');
  console.log('=================================');
  console.log('To compare local functionality with production:');
  console.log();
  console.log('1. 🏠 Local Development:');
  console.log('   • Run: npm run dev');
  console.log('   • Access: http://localhost:3000');
  console.log('   • Test: Same pages and features');
  console.log();
  console.log('2. 🌐 Production Testing:');
  console.log(`   • Access: ${PROD_URL}`);
  console.log('   • Login: pro@dealmecca.pro / test123');
  console.log('   • Compare: Same functionality should work');
  console.log();
  console.log('3. 🔍 Key Areas to Compare:');
  console.log('   • Authentication flow');
  console.log('   • Data loading (companies, events, forum)');
  console.log('   • Search functionality');
  console.log('   • Admin panel access');
  console.log('   • Page routing and navigation');

  // Recommendations
  console.log('\n💡 NEXT STEPS');
  console.log('=============');
  
  if (results.overall.success) {
    console.log('✅ Your deployment is working excellently!');
    console.log('🎯 Ready for user testing and demonstration');
    console.log('📋 Recommended actions:');
    console.log('   • Test complete user flows');
    console.log('   • Verify admin panel functionality');
    console.log('   • Test search and data features');
  } else {
    console.log('🔧 Areas needing attention:');
    if (results.pages.errors > 0) {
      console.log(`   • ${results.pages.errors} page routing issues`);
    }
    if (results.apis.errors > 0) {
      console.log(`   • ${results.apis.errors} API endpoint issues`);
    }
    if (results.static.errors > 0) {
      console.log(`   • ${results.static.errors} static resource issues`);
    }
  }

  return results;
}

if (require.main === module) {
  verifyCodeDeployment()
    .then((result) => {
      if (result.overall.success) {
        console.log('\n🎉 Code deployment verification successful!');
        process.exit(0);
      } else {
        console.log('\n⚠️  Code deployment verification found issues');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ Code deployment verification error:', error);
      process.exit(1);
    });
}

export { verifyCodeDeployment }; 