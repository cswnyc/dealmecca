#!/usr/bin/env npx tsx

/**
 * Vercel Debug Helper Script
 * 
 * Helps diagnose and fix Vercel deployment issues
 */

const VERCEL_DEBUG_URL = 'https://website-incne6jv0-cws-projects-e62034bb.vercel.app';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

class VercelDebugger {
  private results: DiagnosticResult[] = [];

  private log(result: DiagnosticResult) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.test}: ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }
    this.results.push(result);
  }

  async testHealthEndpoint(): Promise<void> {
    try {
      const response = await fetch(`${VERCEL_DEBUG_URL}/api/health`);
      const data = await response.json();
      
      if (data.status === 'healthy') {
        this.log({
          test: 'Health Check',
          status: 'pass',
          message: 'Database connection is working!'
        });
      } else {
        this.log({
          test: 'Health Check',
          status: 'fail',
          message: 'Database connection failed',
          details: data.services?.database?.error || data
        });
      }
    } catch (error: any) {
      this.log({
        test: 'Health Check',
        status: 'fail',
        message: `Health endpoint unreachable: ${error.message}`
      });
    }
  }

  async testBasicRoutes(): Promise<void> {
    const routes = [
      { path: '/', name: 'Homepage' },
      { path: '/auth/signin', name: 'Sign In Page' },
      { path: '/auth/signup', name: 'Sign Up Page' },
      { path: '/api/health', name: 'Health API' }
    ];

    for (const route of routes) {
      try {
        const response = await fetch(`${VERCEL_DEBUG_URL}${route.path}`);
        
        if (response.ok) {
          this.log({
            test: route.name,
            status: 'pass',
            message: `Loading correctly (${response.status})`
          });
        } else {
          this.log({
            test: route.name,
            status: 'fail',
            message: `Failed to load (${response.status})`
          });
        }
      } catch (error) {
        this.log({
          test: route.name,
          status: 'fail',
          message: `Request failed: ${error.message}`
        });
      }
    }
  }

  async testAuthenticatedRoutes(): Promise<void> {
    const protectedRoutes = [
      '/dashboard',
      '/orgs',
      '/search',
      '/admin'
    ];

    for (const route of protectedRoutes) {
      try {
        const response = await fetch(`${VERCEL_DEBUG_URL}${route}`);
        
        if (response.status === 401 || response.url.includes('/auth/signin')) {
          this.log({
            test: `Protected Route: ${route}`,
            status: 'pass',
            message: 'Correctly redirecting to auth'
          });
        } else if (response.ok) {
          this.log({
            test: `Protected Route: ${route}`,
            status: 'warning',
            message: 'Loading without auth (might be cached)'
          });
        } else {
          this.log({
            test: `Protected Route: ${route}`,
            status: 'fail',
            message: `Unexpected response: ${response.status}`
          });
        }
      } catch (error) {
        this.log({
          test: `Protected Route: ${route}`,
          status: 'fail',
          message: `Request failed: ${error.message}`
        });
      }
    }
  }

  printSummary(): void {
    console.log(`\n📊 SUMMARY`);
    console.log('==========');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`📊 Total: ${this.results.length}`);

    if (failed > 0) {
      console.log(`\n🚨 CRITICAL ISSUES FOUND:`);
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => console.log(`   - ${r.test}: ${r.message}`));
    }

    console.log(`\n🎯 NEXT STEPS:`);
    if (this.results.some(r => r.test === 'Health Check' && r.status === 'fail')) {
      console.log(`   1. 🔧 Fix DATABASE_URL in Vercel environment variables`);
      console.log(`   2. 🚀 Redeploy the application`);
      console.log(`   3. 🧪 Run this script again to verify`);
    } else if (passed === this.results.length) {
      console.log(`   🎉 All systems operational!`);
      console.log(`   🔍 If you're still experiencing issues, they might be:`);
      console.log(`      - Browser caching (try incognito mode)`);
      console.log(`      - Specific user authentication flows`);
      console.log(`      - Client-side JavaScript errors`);
    } else {
      console.log(`   🔍 Some tests passed, investigate warnings`);
      console.log(`   🔧 Check Vercel deployment logs`);
      console.log(`   🔄 Try redeploying if issues persist`);
    }
  }

  async runDiagnostics(): Promise<void> {
    console.log(`\n🔍 VERCEL PRODUCTION DIAGNOSTICS`);
    console.log(`================================`);
    console.log(`🌐 Testing: ${VERCEL_DEBUG_URL}`);
    console.log(`📅 Time: ${new Date().toLocaleString()}\n`);

    await this.testHealthEndpoint();
    await this.testBasicRoutes();
    await this.testAuthenticatedRoutes();
    
    this.printSummary();
  }
}

// Generate environment variable check
function generateEnvCheck(): void {
  console.log(`\n📋 ENVIRONMENT VARIABLES TO CHECK IN VERCEL:`);
  console.log(`===========================================`);
  console.log(`\n1. DATABASE_URL:`);
  console.log(`   Value: postgresql://neondb_owner:npg_B3Sdq4aviYgN@ep-wild-lake-afcy495t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`);
  console.log(`   Environment: Production ✓`);
  
  console.log(`\n2. DIRECT_URL:`);
  console.log(`   Value: postgresql://neondb_owner:npg_B3Sdq4aviYgN@ep-wild-lake-afcy495t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`);
  console.log(`   Environment: Production ✓`);
  
  console.log(`\n3. NEXTAUTH_SECRET:`);
  console.log(`   Value: +bNfyxbjk+rMoly9VelAtuXLlczjsfIEa2X9RI1mVks=`);
  console.log(`   Environment: Production ✓`);
  
  console.log(`\n4. NEXTAUTH_URL:`);
  console.log(`   Value: https://website-incne6jv0-cws-projects-e62034bb.vercel.app`);
  console.log(`   Environment: Production ✓`);
}

// Main execution
async function main() {
  const arg = process.argv[2];
  
  if (arg === 'env') {
    generateEnvCheck();
  } else {
    const diagnostic = new VercelDebugger();
    await diagnostic.runDiagnostics();
  }
}

main().catch(console.error); 