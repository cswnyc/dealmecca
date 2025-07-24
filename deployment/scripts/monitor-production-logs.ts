#!/usr/bin/env npx tsx

/**
 * Production Error Monitoring & Logging
 * 
 * Monitor Vercel logs, API endpoints, and frontend errors
 */

import fetch from 'node-fetch';

const PROD_URL = 'https://website-gjgyoiava-cws-projects-e62034bb.vercel.app';

interface ErrorLog {
  timestamp: string;
  source: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  url?: string;
  statusCode?: number;
}

async function testAPIEndpointsWithLogging() {
  console.log(`🔍 TESTING API ENDPOINTS WITH ERROR LOGGING`);
  console.log(`==========================================\n`);

  const endpoints = [
    { path: '/api/health', name: 'Health Check', auth: false },
    { path: '/api/companies?q=WPP', name: 'Company Search', auth: true },
    { path: '/api/contacts?q=CEO', name: 'Contact Search', auth: true },
    { path: '/api/orgs/companies', name: 'Organizations API', auth: true },
    { path: '/api/search/suggestions?q=WPP', name: 'Search Suggestions', auth: true },
    { path: '/api/dashboard/metrics', name: 'Dashboard Metrics', auth: true },
    { path: '/api/forum/search?q=test', name: 'Forum Search', auth: true },
    { path: '/api/events', name: 'Events API', auth: true }
  ];

  const errors: ErrorLog[] = [];
  const successes: string[] = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔌 Testing: ${endpoint.name}`);
      
      const startTime = Date.now();
      const response = await fetch(`${PROD_URL}${endpoint.path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const duration = Date.now() - startTime;
      const responseText = await response.text();
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText };
      }

      if (response.ok) {
        console.log(`   ✅ Success (${response.status}) - ${duration}ms`);
        successes.push(`${endpoint.name}: ${response.status} in ${duration}ms`);
      } else {
        const errorLog: ErrorLog = {
          timestamp: new Date().toISOString(),
          source: 'api',
          level: response.status >= 500 ? 'error' : 'warn',
          message: `${endpoint.name} failed: ${response.status} ${response.statusText}`,
          url: endpoint.path,
          statusCode: response.status
        };

        if (responseData.error || responseData.message) {
          errorLog.message += ` - ${responseData.error || responseData.message}`;
        }

        errors.push(errorLog);
        
        if (endpoint.auth && response.status === 401) {
          console.log(`   🔒 Auth Required (${response.status}) - Expected for protected endpoint`);
        } else {
          console.log(`   ❌ Error (${response.status}): ${responseData.error || responseData.message || 'Unknown error'}`);
        }
      }
      
    } catch (error: any) {
      const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        source: 'network',
        level: 'error',
        message: `Network error for ${endpoint.name}: ${error.message}`,
        url: endpoint.path,
        stack: error.stack
      };
      
      errors.push(errorLog);
      console.log(`   ❌ Network Error: ${error.message}`);
    }
    
    console.log(``);
  }

  return { errors, successes };
}

async function testFrontendPages() {
  console.log(`🌐 TESTING FRONTEND PAGES FOR ERRORS`);
  console.log(`===================================\n`);

  const pages = [
    { path: '/', name: 'Home Page' },
    { path: '/auth/signin', name: 'Sign In Page' },
    { path: '/auth/signup', name: 'Sign Up Page' },
    { path: '/search', name: 'Search Page' },
    { path: '/search/enhanced', name: 'Enhanced Search' },
    { path: '/forum', name: 'Forum Page' },
    { path: '/orgs', name: 'Organizations' },
    { path: '/orgs/companies', name: 'Companies Browse' },
    { path: '/events', name: 'Events Page' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/pricing', name: 'Pricing Page' }
  ];

  const errors: ErrorLog[] = [];
  const successes: string[] = [];

  for (const page of pages) {
    try {
      console.log(`📄 Testing: ${page.name}`);
      
      const startTime = Date.now();
      const response = await fetch(`${PROD_URL}${page.path}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (production-monitor)',
        },
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`   ✅ Loaded (${response.status}) - ${duration}ms`);
        successes.push(`${page.name}: ${response.status} in ${duration}ms`);
      } else if (response.url.includes('/auth/signin')) {
        console.log(`   🔒 Redirected to signin (expected for protected pages)`);
        successes.push(`${page.name}: Redirected to auth (expected)`);
      } else {
        const errorLog: ErrorLog = {
          timestamp: new Date().toISOString(),
          source: 'frontend',
          level: 'error',
          message: `${page.name} failed to load: ${response.status} ${response.statusText}`,
          url: page.path,
          statusCode: response.status
        };
        
        errors.push(errorLog);
        console.log(`   ❌ Error (${response.status}): ${response.statusText}`);
      }
      
    } catch (error: any) {
      const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        source: 'network',
        level: 'error',
        message: `Network error for ${page.name}: ${error.message}`,
        url: page.path,
        stack: error.stack
      };
      
      errors.push(errorLog);
      console.log(`   ❌ Network Error: ${error.message}`);
    }
    
    console.log(``);
  }

  return { errors, successes };
}

async function generateErrorReport(apiErrors: ErrorLog[], frontendErrors: ErrorLog[], apiSuccesses: string[], frontendSuccesses: string[]) {
  console.log(`📊 ERROR MONITORING REPORT`);
  console.log(`=========================\n`);

  const allErrors = [...apiErrors, ...frontendErrors];
  const criticalErrors = allErrors.filter(e => e.level === 'error');
  const warnings = allErrors.filter(e => e.level === 'warn');

  console.log(`📈 Summary:`);
  console.log(`   Total API Tests: ${apiErrors.length + apiSuccesses.length}`);
  console.log(`   Total Frontend Tests: ${frontendErrors.length + frontendSuccesses.length}`);
  console.log(`   Critical Errors: ${criticalErrors.length}`);
  console.log(`   Warnings: ${warnings.length}`);
  console.log(`   Successful Tests: ${apiSuccesses.length + frontendSuccesses.length}`);

  if (criticalErrors.length > 0) {
    console.log(`\n🚨 CRITICAL ERRORS:`);
    criticalErrors.forEach((error, index) => {
      console.log(`   ${index + 1}. [${error.source.toUpperCase()}] ${error.message}`);
      if (error.url) {
        console.log(`      URL: ${error.url}`);
      }
      if (error.statusCode) {
        console.log(`      Status: ${error.statusCode}`);
      }
      console.log(`      Time: ${error.timestamp}`);
      console.log(``);
    });
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS:`);
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. [${warning.source.toUpperCase()}] ${warning.message}`);
      if (warning.url) {
        console.log(`      URL: ${warning.url}`);
      }
      console.log(``);
    });
  }

  if (apiSuccesses.length > 0) {
    console.log(`\n✅ API SUCCESSES:`);
    apiSuccesses.forEach(success => {
      console.log(`   • ${success}`);
    });
  }

  console.log(`\n🔧 DEBUGGING RECOMMENDATIONS:`);
  
  if (criticalErrors.some(e => e.source === 'network')) {
    console.log(`   🌐 Network Issues Detected:`);
    console.log(`      - Check internet connectivity`);
    console.log(`      - Verify Vercel deployment status`);
    console.log(`      - Check DNS resolution`);
  }

  if (criticalErrors.some(e => e.statusCode && e.statusCode >= 500)) {
    console.log(`   🔥 Server Errors Detected:`);
    console.log(`      - Check Vercel function logs`);
    console.log(`      - Verify database connectivity`);
    console.log(`      - Check environment variables`);
  }

  if (criticalErrors.some(e => e.statusCode === 404)) {
    console.log(`   🔍 Missing Resources:`);
    console.log(`      - Check API route definitions`);
    console.log(`      - Verify file paths and imports`);
    console.log(`      - Check deployment completeness`);
  }

  if (warnings.some(e => e.statusCode === 401)) {
    console.log(`   🔒 Authentication Issues:`);
    console.log(`      - Normal for protected endpoints`);
    console.log(`      - Test with valid authentication`);
    console.log(`      - Check session management`);
  }

  return {
    totalErrors: allErrors.length,
    criticalErrors: criticalErrors.length,
    warnings: warnings.length,
    successfulTests: apiSuccesses.length + frontendSuccesses.length,
    overallStatus: criticalErrors.length === 0 ? '✅ HEALTHY' : 
                   criticalErrors.length <= 2 ? '⚠️ MINOR ISSUES' : '🚨 CRITICAL ISSUES'
  };
}

function generateBrowserDebugScript() {
  console.log(`\n🌐 BROWSER ERROR MONITORING SCRIPT`);
  console.log(`=================================\n`);

  const script = `
// Paste this script in your browser console to monitor errors
(function() {
  console.log('🔍 DealMecca Error Monitor Started');
  
  // Track JavaScript errors
  window.addEventListener('error', function(e) {
    console.error('🚨 JavaScript Error:', {
      message: e.message,
      filename: e.filename,
      line: e.lineno,
      column: e.colno,
      stack: e.error?.stack,
      timestamp: new Date().toISOString()
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled Promise Rejection:', {
      reason: e.reason,
      timestamp: new Date().toISOString()
    });
  });

  // Monitor fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    console.log('🌐 API Request:', url);
    
    return originalFetch.apply(this, args)
      .then(response => {
        if (!response.ok) {
          console.warn('⚠️ API Error:', {
            url: url,
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString()
          });
        } else {
          console.log('✅ API Success:', url, response.status);
        }
        return response;
      })
      .catch(error => {
        console.error('🚨 Network Error:', {
          url: url,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      });
  };

  console.log('✅ Error monitoring active. Check console for errors.');
})();
`;

  console.log(`Copy and paste this script in your browser console:`);
  console.log(`\`\`\`javascript`);
  console.log(script);
  console.log(`\`\`\``);
}

function generateNetworkMonitoringGuide() {
  console.log(`\n🔧 NETWORK MONITORING GUIDE`);
  console.log(`===========================\n`);

  console.log(`📋 Steps to Monitor Network Requests:`);
  console.log(`\n1. Open Browser Developer Tools (F12)`);
  console.log(`\n2. Go to Network Tab:`);
  console.log(`   • Clear existing requests`);
  console.log(`   • Enable "Preserve log"`);
  console.log(`   • Filter by "XHR/Fetch" for API calls`);
  
  console.log(`\n3. Test Key User Flows:`);
  console.log(`   • Sign up/Sign in process`);
  console.log(`   • Search for companies: "WPP", "Omnicom"`);
  console.log(`   • Browse organizations`);
  console.log(`   • Navigate between pages`);
  
  console.log(`\n4. Monitor for Failed Requests:`);
  console.log(`   • Red entries = Failed requests`);
  console.log(`   • Check status codes (4xx, 5xx)`);
  console.log(`   • Look at response headers and body`);
  
  console.log(`\n5. Common Issues to Watch For:`);
  console.log(`   • 401 Unauthorized (auth issues)`);
  console.log(`   • 404 Not Found (missing endpoints)`);
  console.log(`   • 500 Server Error (backend issues)`);
  console.log(`   • Slow requests (>2 seconds)`);
  console.log(`   • Failed CORS requests`);

  console.log(`\n6. Key API Endpoints to Monitor:`);
  console.log(`   • /api/companies?q=searchterm`);
  console.log(`   • /api/contacts?q=searchterm`);
  console.log(`   • /api/orgs/companies`);
  console.log(`   • /api/auth/session`);
  console.log(`   • /api/dashboard/metrics`);
}

async function main() {
  console.log(`\n🔍 DEALMECCA PRODUCTION ERROR MONITORING`);
  console.log(`=======================================`);
  console.log(`🌐 Production URL: ${PROD_URL}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}\n`);

  // Test API endpoints
  const apiResults = await testAPIEndpointsWithLogging();
  
  // Test frontend pages
  const frontendResults = await testFrontendPages();
  
  // Generate comprehensive report
  const report = await generateErrorReport(
    apiResults.errors,
    frontendResults.errors, 
    apiResults.successes,
    frontendResults.successes
  );
  
  // Browser monitoring tools
  generateBrowserDebugScript();
  generateNetworkMonitoringGuide();

  console.log(`\n📊 OVERALL STATUS: ${report.overallStatus}`);
  console.log(`🎯 Monitoring Complete - Use browser tools for real-time debugging`);
}

main().catch(console.error); 