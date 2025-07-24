import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AuthTestResult {
  endpoint: string;
  method: string;
  withAuth: boolean;
  status: number;
  responseType: 'json' | 'html' | 'other';
  authStatus: 'protected' | 'public' | 'error';
  responseTime: number;
  error?: string;
}

async function testApiAuthentication() {
  console.log('🔐 Testing API Authentication for DealMecca V1...\n')

  const results: AuthTestResult[] = [];
  const baseUrl = 'http://localhost:3000';

  // Define API endpoints to test
  const endpoints = [
    // Public endpoints (should work without auth)
    { path: '/api/health', method: 'GET', shouldBePublic: true },
    { path: '/api/auth/register', method: 'POST', shouldBePublic: true },
    
    // Protected search endpoints
    { path: '/api/orgs/companies', method: 'GET', shouldBePublic: false },
    { path: '/api/orgs/contacts', method: 'GET', shouldBePublic: false },
    { path: '/api/orgs/industries', method: 'GET', shouldBePublic: false },
    { path: '/api/orgs/analytics', method: 'GET', shouldBePublic: false },
    { path: '/api/companies', method: 'GET', shouldBePublic: false },
    { path: '/api/contacts', method: 'GET', shouldBePublic: false },
    
    // Protected dashboard endpoints
    { path: '/api/dashboard/metrics', method: 'GET', shouldBePublic: false },
    { path: '/api/dashboard/search-usage', method: 'GET', shouldBePublic: false },
    { path: '/api/dashboard/upcoming-events', method: 'GET', shouldBePublic: false },
    
    // Protected events endpoints
    { path: '/api/events', method: 'GET', shouldBePublic: false },
    { path: '/api/users/events', method: 'GET', shouldBePublic: false },
    
    // Protected forum endpoints
    { path: '/api/forum/categories', method: 'GET', shouldBePublic: false },
    { path: '/api/forum/posts', method: 'GET', shouldBePublic: false },
    { path: '/api/forum/trending', method: 'GET', shouldBePublic: false },
    { path: '/api/forum/search', method: 'GET', shouldBePublic: false },
    
    // Protected user endpoints
    { path: '/api/users/profile', method: 'GET', shouldBePublic: false },
    { path: '/api/usage', method: 'GET', shouldBePublic: false },
    { path: '/api/saved-searches', method: 'GET', shouldBePublic: false },
    
    // Admin endpoints (should be highly protected)
    { path: '/api/admin/companies', method: 'GET', shouldBePublic: false },
    { path: '/api/admin/contacts', method: 'GET', shouldBePublic: false },
    { path: '/api/admin/stats', method: 'GET', shouldBePublic: false },
    
    // Stripe endpoints (protected)
    { path: '/api/stripe/checkout', method: 'POST', shouldBePublic: false }
  ];

  console.log('📊 Testing endpoints without authentication...\n');

  // Test all endpoints without authentication
  for (const endpoint of endpoints) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let responseType: 'json' | 'html' | 'other' = 'other';
      let authStatus: 'protected' | 'public' | 'error' = 'error';
      let error: string | undefined;

      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        responseType = 'json';
        try {
          const data = await response.json();
          
          // Analyze the response to determine auth status
          if (response.status === 200) {
            authStatus = 'public';
          } else if (response.status === 401) {
            authStatus = 'protected';
            error = data.error || 'Authentication required';
          } else if (response.status === 403) {
            authStatus = 'protected';
            error = data.error || 'Access forbidden';
          } else {
            error = data.error || `HTTP ${response.status}`;
          }
        } catch {
          error = 'Invalid JSON response';
        }
      } else if (contentType.includes('text/html')) {
        responseType = 'html';
        authStatus = 'protected'; // HTML response likely means redirect to login
        error = 'Redirected to login page';
      }

      // Validate against expected behavior
      const isCorrectlyProtected = endpoint.shouldBePublic ? 
        (authStatus === 'public') : 
        (authStatus === 'protected');

      results.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        withAuth: false,
        status: response.status,
        responseType,
        authStatus,
        responseTime,
        error
      });

      const statusIcon = isCorrectlyProtected ? '✅' : '⚠️';
      const expectedText = endpoint.shouldBePublic ? '(should be public)' : '(should be protected)';
      
      console.log(`  ${statusIcon} ${endpoint.method} ${endpoint.path}: ${response.status} ${expectedText} - ${responseTime}ms`);
      if (error) {
        console.log(`     ${error}`);
      }

    } catch (fetchError: any) {
      const endTime = Date.now();
      results.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        withAuth: false,
        status: 0,
        responseType: 'other',
        authStatus: 'error',
        responseTime: endTime - startTime,
        error: fetchError.message
      });

      console.log(`  ❌ ${endpoint.method} ${endpoint.path}: Failed - ${fetchError.message}`);
    }
  }

  // Generate authentication test summary
  console.log('\n🔐 AUTHENTICATION TEST SUMMARY');
  console.log('═'.repeat(60));

  const publicEndpoints = results.filter(r => endpoints.find(e => e.path === r.endpoint && e.shouldBePublic));
  const protectedEndpoints = results.filter(r => endpoints.find(e => e.path === r.endpoint && !e.shouldBePublic));

  console.log(`\n📊 Endpoint Categories:`);
  console.log(`   Public Endpoints: ${publicEndpoints.length}`);
  console.log(`   Protected Endpoints: ${protectedEndpoints.length}`);
  console.log(`   Total Tested: ${results.length}`);

  // Check public endpoints
  const correctlyPublic = publicEndpoints.filter(r => r.authStatus === 'public');
  const incorrectlyProtected = publicEndpoints.filter(r => r.authStatus === 'protected');

  console.log(`\n✅ Public Endpoint Security:`);
  console.log(`   Correctly Public: ${correctlyPublic.length}/${publicEndpoints.length}`);
  if (incorrectlyProtected.length > 0) {
    console.log(`   ⚠️  Incorrectly Protected: ${incorrectlyProtected.length}`);
    incorrectlyProtected.forEach(r => {
      console.log(`      - ${r.method} ${r.endpoint}`);
    });
  }

  // Check protected endpoints
  const correctlyProtected = protectedEndpoints.filter(r => r.authStatus === 'protected');
  const incorrectlyPublic = protectedEndpoints.filter(r => r.authStatus === 'public');

  console.log(`\n🔒 Protected Endpoint Security:`);
  console.log(`   Correctly Protected: ${correctlyProtected.length}/${protectedEndpoints.length}`);
  if (incorrectlyPublic.length > 0) {
    console.log(`   ⚠️  Security Risk - Incorrectly Public: ${incorrectlyPublic.length}`);
    incorrectlyPublic.forEach(r => {
      console.log(`      - ${r.method} ${r.endpoint} (Status: ${r.status})`);
    });
  }

  // Performance analysis
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  const fastResponses = results.filter(r => r.responseTime < 100);
  const slowResponses = results.filter(r => r.responseTime > 500);

  console.log(`\n⏱️  Performance Metrics:`);
  console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`   Fast Responses (< 100ms): ${fastResponses.length}/${results.length}`);
  console.log(`   Slow Responses (> 500ms): ${slowResponses.length}/${results.length}`);

  if (slowResponses.length > 0) {
    console.log(`\n⚠️  Slow Authentication Responses:`);
    slowResponses.forEach(r => {
      console.log(`      - ${r.method} ${r.endpoint}: ${r.responseTime}ms`);
    });
  }

  // Error analysis
  const errorResponses = results.filter(r => r.authStatus === 'error');
  if (errorResponses.length > 0) {
    console.log(`\n❌ Endpoint Errors:`);
    errorResponses.forEach(r => {
      console.log(`      - ${r.method} ${r.endpoint}: ${r.error}`);
    });
  }

  // Test middleware protection patterns
  console.log(`\n🛡️  Security Pattern Analysis:`);
  
  const jsonProtected = protectedEndpoints.filter(r => r.responseType === 'json' && r.status === 401);
  const htmlProtected = protectedEndpoints.filter(r => r.responseType === 'html');
  
  console.log(`   JSON 401 Responses: ${jsonProtected.length} (Good for API)`);
  console.log(`   HTML Redirects: ${htmlProtected.length} (Good for web pages)`);

  // Check for consistent error messages
  const authErrors = results.filter(r => r.error?.includes('log in') || r.error?.includes('Authentication'));
  console.log(`   Consistent Auth Messages: ${authErrors.length}`);

  // Overall security assessment
  console.log('\n🎯 SECURITY ASSESSMENT');
  console.log('═'.repeat(40));

  const securityScore = (correctlyProtected.length + correctlyPublic.length) / results.length * 100;
  
  console.log(`\n📈 Security Score: ${securityScore.toFixed(1)}%`);
  
  if (securityScore >= 95) {
    console.log('✅ Excellent security implementation');
  } else if (securityScore >= 90) {
    console.log('✅ Good security implementation');
  } else if (securityScore >= 80) {
    console.log('⚠️  Acceptable security - some improvements needed');
  } else {
    console.log('❌ Security issues detected - immediate attention required');
  }

  // Recommendations
  console.log('\n💡 Security Recommendations:');
  
  if (incorrectlyPublic.length > 0) {
    console.log('   ❌ CRITICAL: Some protected endpoints are publicly accessible');
  }
  
  if (incorrectlyProtected.length > 0) {
    console.log('   ⚠️  Some public endpoints are incorrectly protected');
  }
  
  if (errorResponses.length > 0) {
    console.log('   ⚠️  Some endpoints have connection/configuration issues');
  }
  
  if (slowResponses.length > 0) {
    console.log('   ⚠️  Consider optimizing slow authentication checks');
  }
  
  if (securityScore >= 95) {
    console.log('   ✅ Authentication system is production-ready');
  }

  console.log('\n🎉 API Authentication Testing Complete!');

} 

// Execute the authentication test
testApiAuthentication()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 