#!/usr/bin/env npx tsx

/**
 * DealMecca Production Debugging Script
 * 
 * Tests all critical endpoints and functionality
 */

const DEBUG_PROD_URL = 'https://website-incne6jv0-cws-projects-e62034bb.vercel.app';

interface TestResult {
  name: string;
  url: string;
  status: 'pass' | 'fail' | 'warning';
  response: any;
  duration: number;
  error?: string;
}

class ProductionDebugger {
  private results: TestResult[] = [];

  private async testEndpoint(name: string, path: string, expectedStatus: number = 200): Promise<TestResult> {
    const url = `${DEBUG_PROD_URL}${path}`;
    const startTime = Date.now();
    
    try {
      const response = await fetch(url);
      const duration = Date.now() - startTime;
      const data = await response.text();
      
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = data;
      }

      const result: TestResult = {
        name,
        url,
        status: response.status === expectedStatus ? 'pass' : 'fail',
        response: parsedData,
        duration,
        error: response.status !== expectedStatus ? `Expected ${expectedStatus}, got ${response.status}` : undefined
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        name,
        url,
        status: 'fail',
        response: null,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.results.push(result);
      return result;
    }
  }

  private logResult(result: TestResult) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    const duration = `${result.duration}ms`;
    
    console.log(`${icon} ${result.name.padEnd(30)} ${duration.padStart(6)} ${result.error || ''}`);
    
    if (result.status === 'fail' && result.response) {
      console.log(`   Response: ${JSON.stringify(result.response).substring(0, 100)}...`);
    }
  }

  async runDiagnostics() {
    console.log(`\n🔍 DEALMECCA PRODUCTION DIAGNOSTICS\n===================================`);
    console.log(`🌐 Testing: ${DEBUG_PROD_URL}\n📅 Date: ${new Date().toLocaleString()}\n===================================\n`);

    // Core Infrastructure Tests
    console.log('🏗️  INFRASTRUCTURE TESTS');
    await this.testEndpoint('Homepage', '/');
    await this.testEndpoint('Health Check', '/api/health');
    await this.testEndpoint('NextAuth Session', '/api/auth/session');
    
    // Authentication Tests
    console.log('\n🔐 AUTHENTICATION TESTS');
    await this.testEndpoint('Sign In Page', '/auth/signin');
    await this.testEndpoint('Sign Up Page', '/auth/signup');
    await this.testEndpoint('NextAuth CSRF', '/api/auth/csrf');

    // Protected Routes (will fail without auth, but should return proper errors)
    console.log('\n🛡️  PROTECTED ROUTE TESTS');
    await this.testEndpoint('Dashboard', '/dashboard');
    await this.testEndpoint('Organizations', '/orgs');
    await this.testEndpoint('Search', '/search');
    await this.testEndpoint('Admin Panel', '/admin');

    // API Endpoints (should return auth errors, not server errors)
    console.log('\n🔌 API ENDPOINT TESTS');
    await this.testEndpoint('Companies API', '/api/orgs/companies', 401);
    await this.testEndpoint('Search API', '/api/search/suggestions', 401);
    await this.testEndpoint('Dashboard Metrics', '/api/dashboard/metrics', 401);
    await this.testEndpoint('User Profile API', '/api/users/profile', 401);

    // Static Assets
    console.log('\n📦 STATIC ASSET TESTS');
    await this.testEndpoint('PWA Manifest', '/manifest.json');
    await this.testEndpoint('Service Worker', '/sw.js');

    this.generateReport();
  }

  private generateReport() {
    console.log('\n📊 DIAGNOSTIC SUMMARY');
    console.log('=====================');

    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`📊 Total: ${this.results.length}`);

    // Critical Issues
    const criticalIssues = this.results.filter(r => 
      r.status === 'fail' && 
      (r.name.includes('Health Check') || r.name.includes('Homepage') || r.name.includes('Session'))
    );

    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES');
      console.log('==================');
      criticalIssues.forEach(issue => {
        console.log(`❌ ${issue.name}: ${issue.error}`);
        if (issue.response && typeof issue.response === 'object') {
          console.log(`   Details: ${JSON.stringify(issue.response, null, 2)}`);
        }
      });
    }

    // Database Issues
    const healthCheck = this.results.find(r => r.name === 'Health Check');
    if (healthCheck && healthCheck.response && healthCheck.response.status === 'unhealthy') {
      console.log('\n💾 DATABASE ISSUES');
      console.log('==================');
      console.log('❌ Database connection failed');
      console.log('🔧 Action Required: Fix DATABASE_URL in Vercel environment variables');
      console.log('📝 Expected URL format: postgresql://...');
      
      if (healthCheck.response.services?.database?.error) {
        console.log(`📋 Error: ${healthCheck.response.services.database.error}`);
      }
    }

    // Recommendations
    console.log('\n💡 NEXT STEPS');
    console.log('==============');

    if (criticalIssues.length > 0) {
      console.log('1. 🔥 URGENT: Fix critical infrastructure issues');
      console.log('2. 📞 Contact: Review Vercel deployment logs');
      console.log('3. 🔄 Action: Redeploy after fixing environment variables');
    } else if (failed > passed) {
      console.log('1. 🔍 Investigate: Authentication flow issues');
      console.log('2. 🧪 Test: Manual user registration and login');
      console.log('3. 🛠️  Debug: Frontend JavaScript errors');
    } else {
      console.log('1. ✅ Infrastructure: Looks healthy');
      console.log('2. 🧪 Test: User flows manually');
      console.log('3. 📊 Monitor: Check error rates');
    }

    console.log('\n📝 For detailed debugging: See deployment/PRODUCTION_DEBUG_GUIDE.md');
  }
}

// Run diagnostics
async function main() {
  const diagnosticTool = new ProductionDebugger();
  await diagnosticTool.runDiagnostics();
}

if (require.main === module) {
  main().catch(console.error);
}

export { ProductionDebugger }; 