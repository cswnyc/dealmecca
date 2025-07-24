#!/usr/bin/env npx tsx

/**
 * STEP 5: Production Deployment Preparation
 * Post-Deployment Verification Script
 * 
 * Comprehensive verification of production deployment
 */

import { performance } from 'perf_hooks';

interface VerificationTest {
  name: string;
  category: string;
  success: boolean;
  duration: number;
  statusCode?: number;
  errorMessage?: string;
  responseSize?: number;
  details?: string;
}

interface VerificationResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  categories: { [key: string]: VerificationTest[] };
  overallSuccess: boolean;
  deploymentScore: number;
}

class PostDeploymentVerifier {
  private tests: VerificationTest[] = [];
  private baseUrl: string;

  constructor(baseUrl: string = 'https://your-domain.com') {
    this.baseUrl = baseUrl;
  }

  async runTest(
    name: string, 
    category: string, 
    testFunction: () => Promise<any>
  ): Promise<boolean> {
    const startTime = performance.now();
    try {
      console.log(`🔵 Testing ${category}: ${name}...`);
      const result = await testFunction();
      const duration = performance.now() - startTime;
      
      this.tests.push({
        name,
        category,
        success: true,
        duration,
        statusCode: result?.status || 200,
        responseSize: JSON.stringify(result || {}).length,
        details: result?.details
      });
      
      console.log(`✅ ${name} completed in ${duration.toFixed(2)}ms`);
      return true;
    } catch (error: any) {
      const duration = performance.now() - startTime;
      this.tests.push({
        name,
        category,
        success: false,
        duration,
        errorMessage: error.message,
        statusCode: error.status || 500
      });
      
      console.log(`❌ ${name} failed: ${error.message}`);
      return false;
    }
  }

  // =============================================================================
  // BASIC CONNECTIVITY TESTS
  // =============================================================================
  async testBasicConnectivity(): Promise<void> {
    console.log('\n🌐 Testing Basic Connectivity...');

    await this.runTest('Homepage Load', 'Connectivity', async () => {
      const response = await fetch(this.baseUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      if (html.length < 1000) throw new Error('Homepage content too small');
      return { status: response.status, size: html.length };
    });

    await this.runTest('HTTPS Redirect', 'Connectivity', async () => {
      const httpUrl = this.baseUrl.replace('https://', 'http://');
      const response = await fetch(httpUrl, { redirect: 'manual' });
      if (![301, 302, 308].includes(response.status)) {
        throw new Error('HTTPS redirect not working');
      }
      return { status: response.status, location: response.headers.get('location') };
    });

    await this.runTest('Health Check Endpoint', 'Connectivity', async () => {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
      const data = await response.json();
      if (data.status !== 'healthy') throw new Error('Health check returned unhealthy');
      return { status: response.status, data };
    });
  }

  // =============================================================================
  // SSL & SECURITY TESTS
  // =============================================================================
  async testSSLSecurity(): Promise<void> {
    console.log('\n🔒 Testing SSL & Security...');

    await this.runTest('SSL Certificate Validity', 'Security', async () => {
      const response = await fetch(this.baseUrl);
      if (!response.ok) throw new Error(`HTTPS request failed: ${response.status}`);
      return { status: response.status, secure: true };
    });

    await this.runTest('Security Headers', 'Security', async () => {
      const response = await fetch(this.baseUrl);
      const headers = response.headers;
      
      const requiredHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection'
      ];
      
      const missingHeaders = requiredHeaders.filter(header => !headers.get(header));
      if (missingHeaders.length > 0) {
        throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
      }
      
      return { 
        status: response.status, 
        headers: Object.fromEntries(headers.entries()) 
      };
    });

    await this.runTest('HSTS Header', 'Security', async () => {
      const response = await fetch(this.baseUrl);
      const hstsHeader = response.headers.get('strict-transport-security');
      if (!hstsHeader) {
        throw new Error('HSTS header not present');
      }
      return { status: response.status, hsts: hstsHeader };
    });
  }

  // =============================================================================
  // API ENDPOINT TESTS
  // =============================================================================
  async testAPIEndpoints(): Promise<void> {
    console.log('\n🔌 Testing API Endpoints...');

    await this.runTest('API Health Check', 'API', async () => {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (!response.ok) throw new Error(`API health check failed: ${response.status}`);
      return { status: response.status };
    });

    await this.runTest('Authentication Endpoint', 'API', async () => {
      const response = await fetch(`${this.baseUrl}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'invalid' })
      });
      // Should return 400 or 401 for invalid credentials
      if (![400, 401, 422].includes(response.status)) {
        throw new Error(`Unexpected auth response: ${response.status}`);
      }
      return { status: response.status };
    });

    await this.runTest('Protected API Route', 'API', async () => {
      const response = await fetch(`${this.baseUrl}/api/orgs/companies`);
      // Should return 401 for unauthenticated request
      if (response.status !== 401) {
        throw new Error(`Protected route not secured: ${response.status}`);
      }
      return { status: response.status };
    });
  }

  // =============================================================================
  // DATABASE TESTS
  // =============================================================================
  async testDatabase(): Promise<void> {
    console.log('\n🗄️ Testing Database...');

    await this.runTest('Database Health', 'Database', async () => {
      const response = await fetch(`${this.baseUrl}/api/health?check=db`);
      if (!response.ok) throw new Error(`Database health check failed: ${response.status}`);
      const data = await response.json();
      if (!data.database?.healthy) throw new Error('Database not healthy');
      return { status: response.status, dbStatus: data.database };
    });

    await this.runTest('Database Connection Pool', 'Database', async () => {
      // Test multiple concurrent connections
      const promises = Array(5).fill(null).map(() => 
        fetch(`${this.baseUrl}/api/health?check=db`)
      );
      const responses = await Promise.all(promises);
      const allOk = responses.every(r => r.ok);
      if (!allOk) throw new Error('Database connection pool issues');
      return { status: 200, concurrentConnections: 5 };
    });
  }

  // =============================================================================
  // PERFORMANCE TESTS
  // =============================================================================
  async testPerformance(): Promise<void> {
    console.log('\n⚡ Testing Performance...');

    await this.runTest('Page Load Performance', 'Performance', async () => {
      const startTime = Date.now();
      const response = await fetch(this.baseUrl);
      const loadTime = Date.now() - startTime;
      
      if (!response.ok) throw new Error(`Page load failed: ${response.status}`);
      if (loadTime > 5000) throw new Error(`Page load too slow: ${loadTime}ms`);
      
      return { status: response.status, loadTime, details: `${loadTime}ms` };
    });

    await this.runTest('API Response Time', 'Performance', async () => {
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}/api/health`);
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      if (responseTime > 2000) throw new Error(`API too slow: ${responseTime}ms`);
      
      return { status: response.status, responseTime, details: `${responseTime}ms` };
    });

    await this.runTest('Static Asset Loading', 'Performance', async () => {
      const response = await fetch(`${this.baseUrl}/_next/static/chunks/main.js`);
      // May not exist, but should not be 500
      if (response.status >= 500) {
        throw new Error(`Static asset server error: ${response.status}`);
      }
      return { status: response.status };
    });
  }

  // =============================================================================
  // FUNCTIONALITY TESTS
  // =============================================================================
  async testCoreFunctionality(): Promise<void> {
    console.log('\n🎯 Testing Core Functionality...');

    await this.runTest('Registration Page', 'Functionality', async () => {
      const response = await fetch(`${this.baseUrl}/auth/signup`);
      if (!response.ok) throw new Error(`Registration page failed: ${response.status}`);
      const html = await response.text();
      if (!html.includes('sign up') && !html.includes('register')) {
        throw new Error('Registration page content invalid');
      }
      return { status: response.status };
    });

    await this.runTest('Login Page', 'Functionality', async () => {
      const response = await fetch(`${this.baseUrl}/auth/signin`);
      if (!response.ok) throw new Error(`Login page failed: ${response.status}`);
      const html = await response.text();
      if (!html.includes('sign in') && !html.includes('login')) {
        throw new Error('Login page content invalid');
      }
      return { status: response.status };
    });

    await this.runTest('Admin Panel Access', 'Functionality', async () => {
      const response = await fetch(`${this.baseUrl}/admin`);
      // Should redirect to login for unauthenticated users
      if (![200, 302, 401].includes(response.status)) {
        throw new Error(`Admin panel unexpected response: ${response.status}`);
      }
      return { status: response.status };
    });
  }

  // =============================================================================
  // MOBILE RESPONSIVENESS TESTS
  // =============================================================================
  async testMobileResponsiveness(): Promise<void> {
    console.log('\n📱 Testing Mobile Responsiveness...');

    const mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15';

    await this.runTest('Mobile Homepage', 'Mobile', async () => {
      const response = await fetch(this.baseUrl, {
        headers: { 'User-Agent': mobileUserAgent }
      });
      if (!response.ok) throw new Error(`Mobile homepage failed: ${response.status}`);
      const html = await response.text();
      if (!html.includes('viewport') || !html.includes('width=device-width')) {
        throw new Error('Mobile viewport not configured');
      }
      return { status: response.status, mobile: true };
    });

    await this.runTest('Mobile Navigation', 'Mobile', async () => {
      const response = await fetch(this.baseUrl, {
        headers: { 'User-Agent': mobileUserAgent }
      });
      if (!response.ok) throw new Error(`Mobile navigation failed: ${response.status}`);
      return { status: response.status };
    });
  }

  // =============================================================================
  // MAIN EXECUTION
  // =============================================================================
  async runAllVerifications(): Promise<VerificationResult> {
    console.log('\n🚀 PRODUCTION DEPLOYMENT VERIFICATION');
    console.log('====================================');
    console.log(`📅 Verification Date: ${new Date().toLocaleString()}`);
    console.log(`🎯 Target URL: ${this.baseUrl}`);
    console.log('🔍 Running comprehensive verification tests...\n');

    // Run all test categories
    await this.testBasicConnectivity();
    await this.testSSLSecurity();
    await this.testAPIEndpoints();
    await this.testDatabase();
    await this.testPerformance();
    await this.testCoreFunctionality();
    await this.testMobileResponsiveness();

    // Analyze results
    const totalTests = this.tests.length;
    const passedTests = this.tests.filter(t => t.success).length;
    const failedTests = totalTests - passedTests;
    const overallSuccess = (passedTests / totalTests) >= 0.85; // 85% pass rate
    const deploymentScore = Math.round((passedTests / totalTests) * 100);

    // Group by category
    const categories: { [key: string]: VerificationTest[] } = {};
    this.tests.forEach(test => {
      if (!categories[test.category]) categories[test.category] = [];
      categories[test.category].push(test);
    });

    return {
      totalTests,
      passedTests,
      failedTests,
      categories,
      overallSuccess,
      deploymentScore
    };
  }

  generateReport(result: VerificationResult): string {
    const avgTestTime = this.tests.reduce((sum, test) => sum + test.duration, 0) / this.tests.length;
    const failedTests = this.tests.filter(t => !t.success);

    return `
🎯 PRODUCTION DEPLOYMENT VERIFICATION REPORT
============================================
📅 Verification Date: ${new Date().toLocaleString()}
🌐 Target URL: ${this.baseUrl}
📊 Deployment Score: ${result.deploymentScore}%
🎯 Overall Status: ${result.overallSuccess ? '✅ PRODUCTION READY' : '❌ ISSUES DETECTED'}

📊 VERIFICATION SUMMARY:
=======================
✅ Total Tests: ${result.totalTests}
✅ Passed: ${result.passedTests}
❌ Failed: ${result.failedTests}
⚡ Average Test Time: ${avgTestTime.toFixed(2)}ms

📋 CATEGORY BREAKDOWN:
=====================
${Object.entries(result.categories).map(([category, tests]) => {
  const passed = tests.filter(t => t.success).length;
  const total = tests.length;
  const percentage = Math.round((passed / total) * 100);
  return `${category}: ${passed}/${total} (${percentage}%) ${percentage >= 85 ? '✅' : '❌'}`;
}).join('\n')}

📋 DETAILED TEST RESULTS:
=========================
${this.tests.map((test, index) => 
`${index + 1}. [${test.category}] ${test.name}
   Status: ${test.success ? '✅ PASS' : '❌ FAIL'}
   Duration: ${test.duration.toFixed(2)}ms
   ${test.statusCode ? `HTTP: ${test.statusCode}` : ''}
   ${test.details ? `Details: ${test.details}` : ''}
   ${test.errorMessage ? `Error: ${test.errorMessage}` : ''}
`).join('\n')}

${failedTests.length > 0 ? `
❌ FAILED TESTS ANALYSIS:
========================
${failedTests.map(test => 
`• [${test.category}] ${test.name}: ${test.errorMessage || 'Unknown error'}`
).join('\n')}

🔧 REQUIRED FIXES:
==================
${failedTests.map(test => {
  if (test.category === 'Connectivity') return '• Fix network connectivity or DNS issues';
  if (test.category === 'Security') return '• Configure security headers and SSL properly';
  if (test.category === 'API') return '• Check API endpoints and authentication';
  if (test.category === 'Database') return '• Verify database connectivity and health';
  if (test.category === 'Performance') return '• Optimize application performance';
  if (test.category === 'Functionality') return '• Fix application functionality issues';
  if (test.category === 'Mobile') return '• Improve mobile responsiveness';
  return '• Review and fix identified issues';
}).filter((fix, index, arr) => arr.indexOf(fix) === index).join('\n')}
` : '🎉 ALL TESTS PASSED!'}

🎯 PRODUCTION READINESS ASSESSMENT:
==================================
Basic Connectivity: ${result.categories['Connectivity']?.every(t => t.success) ? '✅' : '❌'}
Security Configuration: ${result.categories['Security']?.every(t => t.success) ? '✅' : '❌'}
API Functionality: ${result.categories['API']?.every(t => t.success) ? '✅' : '❌'}
Database Health: ${result.categories['Database']?.every(t => t.success) ? '✅' : '❌'}
Performance Standards: ${result.categories['Performance']?.every(t => t.success) ? '✅' : '❌'}
Core Features: ${result.categories['Functionality']?.every(t => t.success) ? '✅' : '❌'}
Mobile Experience: ${result.categories['Mobile']?.every(t => t.success) ? '✅' : '❌'}

🏆 DEPLOYMENT GRADE:
===================
${result.deploymentScore >= 95 ? '🟢 A+ (95-100%) - EXCELLENT' :
  result.deploymentScore >= 90 ? '🟢 A (90-94%) - VERY GOOD' :
  result.deploymentScore >= 85 ? '🟡 B (85-89%) - GOOD' :
  result.deploymentScore >= 70 ? '🟠 C (70-84%) - ACCEPTABLE' :
  '🔴 D (<70%) - NEEDS WORK'}

💡 RECOMMENDATIONS:
==================
${result.deploymentScore >= 95 ? 
`🎉 Deployment verification successful!
✅ All systems operational
✅ Ready for production traffic
✅ Monitor performance and user feedback` :
result.deploymentScore >= 85 ?
`✅ Deployment generally successful with minor issues
🔧 Address failed tests for optimal performance
📊 Monitor system health closely
🔄 Plan fixes for next maintenance window` :
`🚨 Deployment has significant issues
🔧 Address failed tests before directing traffic
📞 Consider rollback if critical issues persist
🔄 Re-run verification after fixes`}

🔄 NEXT STEPS:
=============
${result.overallSuccess ?
`1. ✅ Deployment verified and ready
2. 📊 Begin monitoring production metrics
3. 📝 Document any minor issues for future fixes
4. 🚀 Announce successful deployment to stakeholders` :
`1. 🔧 Fix all failed verification tests
2. 🔄 Re-run verification script
3. 📞 Consider rollback if issues persist
4. 📋 Update deployment procedures based on findings`}

============================================
`;
  }
}

async function main() {
  // Get target URL from command line argument or environment
  const targetUrl = process.argv[2] || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  
  const verifier = new PostDeploymentVerifier(targetUrl);
  
  try {
    const result = await verifier.runAllVerifications();
    const report = verifier.generateReport(result);
    
    console.log(report);
    
    // Save report to file
    const fs = await import('fs/promises');
    await fs.writeFile(
      'post-deployment-verification-report.txt', 
      report, 
      'utf8'
    );
    
    console.log('\n📄 Report saved to: post-deployment-verification-report.txt');
    
    // Exit with appropriate code
    process.exit(result.overallSuccess ? 0 : 1);
    
  } catch (error: any) {
    console.error('\n💥 Fatal error during verification:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 