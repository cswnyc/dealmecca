#!/usr/bin/env node
/**
 * Authentication Flow Test Script
 * Tests authentication flows and error handling edge cases
 * STEP 3: Performance & Build Optimization
 */

import { performance } from 'perf_hooks';

interface AuthTestResult {
  testName: string;
  success: boolean;
  responseTime: number;
  status: number;
  error?: string;
  expectedBehavior: string;
  actualBehavior: string;
}

interface AuthFlowReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageResponseTime: number;
  results: AuthTestResult[];
  testTimestamp: string;
  securityScore: number;
}

class AuthFlowTester {
  private baseUrl = 'http://localhost:3000';
  
  async testAuthEndpoint(endpoint: string, method: string, data?: any): Promise<{ response: Response; time: number }> {
    const startTime = performance.now();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Auth-Flow-Test/1.0'
      },
      body: data ? JSON.stringify(data) : undefined
    });
    
    const endTime = performance.now();
    const time = Math.round(endTime - startTime);
    
    return { response, time };
  }

  async testSignInPage(): Promise<AuthTestResult> {
    console.log('🔐 Testing Sign In Page...');
    
    try {
      const { response, time } = await this.testAuthEndpoint('/auth/signin', 'GET');
      
      return {
        testName: 'Sign In Page Load',
        success: response.ok,
        responseTime: time,
        status: response.status,
        expectedBehavior: 'Page loads successfully with sign-in form',
        actualBehavior: response.ok ? 'Page loaded successfully' : `Failed with status ${response.status}`
      };
    } catch (error) {
      return {
        testName: 'Sign In Page Load',
        success: false,
        responseTime: 0,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        expectedBehavior: 'Page loads successfully with sign-in form',
        actualBehavior: 'Network error occurred'
      };
    }
  }

  async testSignUpPage(): Promise<AuthTestResult> {
    console.log('📝 Testing Sign Up Page...');
    
    try {
      const { response, time } = await this.testAuthEndpoint('/auth/signup', 'GET');
      
      return {
        testName: 'Sign Up Page Load',
        success: response.ok,
        responseTime: time,
        status: response.status,
        expectedBehavior: 'Page loads successfully with registration form',
        actualBehavior: response.ok ? 'Page loaded successfully' : `Failed with status ${response.status}`
      };
    } catch (error) {
      return {
        testName: 'Sign Up Page Load',
        success: false,
        responseTime: 0,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        expectedBehavior: 'Page loads successfully with registration form',
        actualBehavior: 'Network error occurred'
      };
    }
  }

  async testInvalidEmailRegistration(): Promise<AuthTestResult> {
    console.log('📧 Testing Invalid Email Registration...');
    
    try {
      const { response, time } = await this.testAuthEndpoint('/api/auth/register', 'POST', {
        email: 'invalid-email',
        password: 'testpassword123',
        name: 'Test User'
      });
      
      // Should fail with 400 for invalid email
      const success = response.status === 400 || response.status === 422;
      
      return {
        testName: 'Invalid Email Registration',
        success,
        responseTime: time,
        status: response.status,
        expectedBehavior: 'Should reject invalid email format with 400/422 status',
        actualBehavior: success ? 'Correctly rejected invalid email' : `Unexpected status: ${response.status}`
      };
    } catch (error) {
      return {
        testName: 'Invalid Email Registration',
        success: false,
        responseTime: 0,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        expectedBehavior: 'Should reject invalid email format with 400/422 status',
        actualBehavior: 'Network error occurred'
      };
    }
  }

  async testWeakPasswordRegistration(): Promise<AuthTestResult> {
    console.log('🔑 Testing Weak Password Registration...');
    
    try {
      const { response, time } = await this.testAuthEndpoint('/api/auth/register', 'POST', {
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      });
      
      // Should fail with 400 for weak password
      const success = response.status === 400 || response.status === 422;
      
      return {
        testName: 'Weak Password Registration',
        success,
        responseTime: time,
        status: response.status,
        expectedBehavior: 'Should reject weak password with 400/422 status',
        actualBehavior: success ? 'Correctly rejected weak password' : `Unexpected status: ${response.status}`
      };
    } catch (error) {
      return {
        testName: 'Weak Password Registration',
        success: false,
        responseTime: 0,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        expectedBehavior: 'Should reject weak password with 400/422 status',
        actualBehavior: 'Network error occurred'
      };
    }
  }

  async testMissingFieldsRegistration(): Promise<AuthTestResult> {
    console.log('❌ Testing Missing Fields Registration...');
    
    try {
      const { response, time } = await this.testAuthEndpoint('/api/auth/register', 'POST', {
        email: 'test@example.com'
        // Missing password and name
      });
      
      // Should fail with 400 for missing fields
      const success = response.status === 400 || response.status === 422;
      
      return {
        testName: 'Missing Fields Registration',
        success,
        responseTime: time,
        status: response.status,
        expectedBehavior: 'Should reject missing required fields with 400/422 status',
        actualBehavior: success ? 'Correctly rejected missing fields' : `Unexpected status: ${response.status}`
      };
    } catch (error) {
      return {
        testName: 'Missing Fields Registration',
        success: false,
        responseTime: 0,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        expectedBehavior: 'Should reject missing required fields with 400/422 status',
        actualBehavior: 'Network error occurred'
      };
    }
  }

  async testProtectedRouteAccess(): Promise<AuthTestResult> {
    console.log('🛡️ Testing Protected Route Access...');
    
    try {
      const { response, time } = await this.testAuthEndpoint('/dashboard', 'GET');
      
      // Should redirect to sign-in or return 401/403
      const success = response.status === 302 || response.status === 401 || response.status === 403 || 
                      response.url.includes('/auth/signin');
      
      return {
        testName: 'Protected Route Access',
        success,
        responseTime: time,
        status: response.status,
        expectedBehavior: 'Should redirect unauthenticated users to sign-in',
        actualBehavior: success ? 'Correctly protected route' : `Unexpected access allowed: ${response.status}`
      };
    } catch (error) {
      return {
        testName: 'Protected Route Access',
        success: false,
        responseTime: 0,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        expectedBehavior: 'Should redirect unauthenticated users to sign-in',
        actualBehavior: 'Network error occurred'
      };
    }
  }

  async testErrorPage(): Promise<AuthTestResult> {
    console.log('⚠️ Testing Auth Error Page...');
    
    try {
      const { response, time } = await this.testAuthEndpoint('/auth/error', 'GET');
      
      return {
        testName: 'Auth Error Page',
        success: response.ok,
        responseTime: time,
        status: response.status,
        expectedBehavior: 'Error page should load and display helpful message',
        actualBehavior: response.ok ? 'Error page loaded successfully' : `Failed with status ${response.status}`
      };
    } catch (error) {
      return {
        testName: 'Auth Error Page',
        success: false,
        responseTime: 0,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        expectedBehavior: 'Error page should load and display helpful message',
        actualBehavior: 'Network error occurred'
      };
    }
  }

  async testVerifyRequestPage(): Promise<AuthTestResult> {
    console.log('✉️ Testing Verify Request Page...');
    
    try {
      const { response, time } = await this.testAuthEndpoint('/auth/verify-request', 'GET');
      
      return {
        testName: 'Verify Request Page',
        success: response.ok,
        responseTime: time,
        status: response.status,
        expectedBehavior: 'Verification page should load with instructions',
        actualBehavior: response.ok ? 'Verification page loaded successfully' : `Failed with status ${response.status}`
      };
    } catch (error) {
      return {
        testName: 'Verify Request Page',
        success: false,
        responseTime: 0,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        expectedBehavior: 'Verification page should load with instructions',
        actualBehavior: 'Network error occurred'
      };
    }
  }

  async runAllTests(): Promise<AuthFlowReport> {
    console.log('🔐 Starting Authentication Flow Tests...\n');
    console.log('🎯 Testing auth pages, security, and error handling\n');

    const results: AuthTestResult[] = [];

    // Run all authentication tests
    const tests = [
      this.testSignInPage(),
      this.testSignUpPage(),
      this.testInvalidEmailRegistration(),
      this.testWeakPasswordRegistration(),
      this.testMissingFieldsRegistration(),
      this.testProtectedRouteAccess(),
      this.testErrorPage(),
      this.testVerifyRequestPage()
    ];

    for (const testPromise of tests) {
      const result = await testPromise;
      results.push(result);
      
      const statusEmoji = result.success ? '✅' : '❌';
      console.log(`${statusEmoji} ${result.testName}: ${result.responseTime}ms ${result.error ? `(${result.error})` : ''}`);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const passedTests = results.filter(r => r.success).length;
    const failedTests = results.filter(r => !r.success).length;
    const validResults = results.filter(r => r.responseTime > 0);
    const averageResponseTime = validResults.length > 0 
      ? Math.round(validResults.reduce((sum, r) => sum + r.responseTime, 0) / validResults.length)
      : 0;

    // Calculate security score based on proper error handling
    const securityTests = results.filter(r => 
      r.testName.includes('Invalid') || 
      r.testName.includes('Weak') || 
      r.testName.includes('Missing') || 
      r.testName.includes('Protected')
    );
    const securityScore = Math.round((securityTests.filter(r => r.success).length / securityTests.length) * 100);

    const report: AuthFlowReport = {
      totalTests: results.length,
      passedTests,
      failedTests,
      averageResponseTime,
      results,
      testTimestamp: new Date().toISOString(),
      securityScore
    };

    this.printReport(report);
    return report;
  }

  private printReport(report: AuthFlowReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('🔐 AUTHENTICATION FLOW TEST REPORT');
    console.log('='.repeat(60));
    console.log(`📅 Test Date: ${new Date(report.testTimestamp).toLocaleString()}`);
    console.log(`🧪 Total Tests: ${report.totalTests}`);
    console.log(`✅ Tests Passed: ${report.passedTests}`);
    console.log(`❌ Tests Failed: ${report.failedTests}`);
    console.log(`⚡ Average Response Time: ${report.averageResponseTime}ms`);
    console.log(`🛡️ Security Score: ${report.securityScore}%`);
    console.log(`🎯 Success Rate: ${Math.round((report.passedTests / report.totalTests) * 100)}%`);

    if (report.failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      console.log('================');
      report.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`   ${result.testName}:`);
          console.log(`     Expected: ${result.expectedBehavior}`);
          console.log(`     Actual: ${result.actualBehavior}`);
          if (result.error) console.log(`     Error: ${result.error}`);
        });
    }

    console.log('\n🧪 TEST BREAKDOWN:');
    console.log('==================');
    
    const pageLoadTests = report.results.filter(r => r.testName.includes('Page')).length;
    const securityTests = report.results.filter(r => 
      r.testName.includes('Invalid') || r.testName.includes('Weak') || 
      r.testName.includes('Missing') || r.testName.includes('Protected')
    ).length;
    const errorHandlingTests = report.results.filter(r => r.testName.includes('Error')).length;
    
    console.log(`📄 Page Load Tests: ${pageLoadTests}`);
    console.log(`🛡️ Security Tests: ${securityTests}`);
    console.log(`⚠️ Error Handling Tests: ${errorHandlingTests}`);

    console.log('\n🛡️ SECURITY ANALYSIS:');
    console.log('=====================');
    
    const securityResults = report.results.filter(r => 
      r.testName.includes('Invalid') || r.testName.includes('Weak') || 
      r.testName.includes('Missing') || r.testName.includes('Protected')
    );
    
    securityResults.forEach(result => {
      const emoji = result.success ? '✅' : '❌';
      console.log(`${emoji} ${result.testName}: ${result.actualBehavior}`);
    });

    const overallGrade = this.calculateAuthGrade(report);
    console.log(`\n🏆 Overall Authentication Grade: ${overallGrade}`);
    
    if (report.passedTests === report.totalTests && report.securityScore >= 90) {
      console.log('\n🎉 EXCELLENT AUTHENTICATION SECURITY! Ready for production.');
    } else if (report.passedTests >= report.totalTests * 0.9 && report.securityScore >= 80) {
      console.log('\n✅ GOOD AUTHENTICATION FLOWS! Minor security improvements recommended.');
    } else {
      console.log('\n⚠️  Authentication flows need improvement before production deployment.');
    }

    console.log('\n📋 SECURITY RECOMMENDATIONS:');
    console.log('=============================');
    
    if (report.securityScore < 90) {
      console.log('• Strengthen input validation for all auth endpoints');
      console.log('• Implement proper error messages that don\'t leak information');
      console.log('• Add rate limiting to prevent brute force attacks');
    }
    
    if (report.averageResponseTime > 1000) {
      console.log('• Optimize authentication endpoint performance');
      console.log('• Consider caching strategies for auth data');
    }
    
    const failedSecurityTests = securityResults.filter(r => !r.success);
    if (failedSecurityTests.length > 0) {
      console.log('• Fix failed security tests before deployment');
      console.log('• Review authentication middleware configuration');
      console.log('• Ensure proper session management');
    }
  }

  private calculateAuthGrade(report: AuthFlowReport): string {
    const successRate = (report.passedTests / report.totalTests) * 100;
    const securityScore = report.securityScore;
    const avgTime = report.averageResponseTime;
    
    const combinedScore = (successRate * 0.6) + (securityScore * 0.4);
    
    if (combinedScore >= 95 && avgTime < 500) return 'A+ (Outstanding Security)';
    if (combinedScore >= 90 && avgTime < 800) return 'A (Excellent Authentication)';
    if (combinedScore >= 85 && avgTime < 1000) return 'B+ (Very Good Security)';
    if (combinedScore >= 80 && avgTime < 1200) return 'B (Good Authentication)';
    if (combinedScore >= 70) return 'C+ (Acceptable Security)';
    if (combinedScore >= 60) return 'C (Needs Security Improvement)';
    return 'D (Poor Security - Requires Immediate Attention)';
  }
}

// Run the tests if this script is executed directly
async function main() {
  const tester = new AuthFlowTester();
  
  try {
    await tester.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('❌ Auth test execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { AuthFlowTester }; 