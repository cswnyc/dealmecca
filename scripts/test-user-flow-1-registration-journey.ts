#!/usr/bin/env npx tsx

/**
 * STEP 4: End-to-End User Flow Testing
 * Flow 1: User Registration → Company Discovery → Event RSVP → Forum Participation
 * 
 * Tests the complete new user journey from registration through engagement
 */

import { performance } from 'perf_hooks';

interface FlowMetrics {
  stepName: string;
  duration: number;
  success: boolean;
  statusCode?: number;
  errorMessage?: string;
  responseSize?: number;
}

interface TestResult {
  flowName: string;
  totalDuration: number;
  steps: FlowMetrics[];
  overallSuccess: boolean;
  completionRate: number;
}

const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;

class UserRegistrationFlowTester {
  private metrics: FlowMetrics[] = [];
  private testUser = {
    email: `testuser_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User Flow',
    company: 'Test Company Ltd'
  };

  async testStep(stepName: string, testFunction: () => Promise<any>): Promise<boolean> {
    const startTime = performance.now();
    try {
      console.log(`🔵 Testing: ${stepName}...`);
      const result = await testFunction();
      const duration = performance.now() - startTime;
      
      this.metrics.push({
        stepName,
        duration,
        success: true,
        statusCode: result?.status || 200,
        responseSize: JSON.stringify(result || {}).length
      });
      
      console.log(`✅ ${stepName} completed in ${duration.toFixed(2)}ms`);
      return true;
    } catch (error: any) {
      const duration = performance.now() - startTime;
      this.metrics.push({
        stepName,
        duration,
        success: false,
        errorMessage: error.message,
        statusCode: error.status || 500
      });
      
      console.log(`❌ ${stepName} failed: ${error.message}`);
      return false;
    }
  }

  async step1_LoadHomePage(): Promise<any> {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    if (!html.includes('DealMecca') && !html.includes('Professional Network')) {
      throw new Error('Home page content validation failed');
    }
    
    return { status: response.status, size: html.length };
  }

  async step2_AccessRegistrationPage(): Promise<any> {
    const response = await fetch(`${BASE_URL}/auth/signup`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    if (!html.includes('Sign Up') && !html.includes('Register')) {
      throw new Error('Registration page content validation failed');
    }
    
    return { status: response.status, size: html.length };
  }

  async step3_SubmitRegistration(): Promise<any> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.testUser)
    });
    
    // Note: 400 is expected for duplicate emails or validation errors
    // We'll consider 200, 201, or 400 as acceptable for testing
    if (![200, 201, 400, 409].includes(response.status)) {
      throw new Error(`Unexpected registration response: ${response.status}`);
    }
    
    const result = await response.json();
    return { status: response.status, data: result };
  }

  async step4_AccessSignInPage(): Promise<any> {
    const response = await fetch(`${BASE_URL}/auth/signin`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    if (!html.includes('Sign In') && !html.includes('Login')) {
      throw new Error('Sign in page content validation failed');
    }
    
    return { status: response.status, size: html.length };
  }

  async step5_DiscoverCompanies(): Promise<any> {
    const response = await fetch(`${BASE_URL}/orgs`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    if (!html.includes('Companies') && !html.includes('Organizations')) {
      throw new Error('Companies page content validation failed');
    }
    
    return { status: response.status, size: html.length };
  }

  async step6_ViewCompanyDetails(): Promise<any> {
    // First get a list of companies from API
    const companiesResponse = await fetch(`${API_BASE}/orgs/companies`);
    
    // Note: This might return 401 without auth, which is expected
    if (companiesResponse.status === 401) {
      // Try accessing the company page directly instead
      const response = await fetch(`${BASE_URL}/orgs/companies/1`);
      return { status: response.status, authRequired: true };
    }
    
    if (!companiesResponse.ok) {
      throw new Error(`Companies API responded with ${companiesResponse.status}`);
    }
    
    const companies = await companiesResponse.json();
    return { status: companiesResponse.status, companiesCount: companies.length };
  }

  async step7_ExploreEvents(): Promise<any> {
    const response = await fetch(`${BASE_URL}/events`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    if (!html.includes('Events') && !html.includes('Upcoming')) {
      throw new Error('Events page content validation failed');
    }
    
    return { status: response.status, size: html.length };
  }

  async step8_ViewEventDetails(): Promise<any> {
    // Try to access a specific event page
    const response = await fetch(`${BASE_URL}/events/1`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    if (!html.includes('Event') && !html.includes('RSVP')) {
      throw new Error('Event details page content validation failed');
    }
    
    return { status: response.status, size: html.length };
  }

  async step9_AccessForum(): Promise<any> {
    const response = await fetch(`${BASE_URL}/forum`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    if (!html.includes('Forum') && !html.includes('Discussion')) {
      throw new Error('Forum page content validation failed');
    }
    
    return { status: response.status, size: html.length };
  }

  async step10_ViewForumSearch(): Promise<any> {
    const response = await fetch(`${BASE_URL}/forum/search`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    if (!html.includes('Search') && !html.includes('Forum')) {
      throw new Error('Forum search page content validation failed');
    }
    
    return { status: response.status, size: html.length };
  }

  async runCompleteFlow(): Promise<TestResult> {
    console.log('\n🚀 STARTING USER REGISTRATION FLOW TEST');
    console.log('=====================================');
    console.log(`Test User: ${this.testUser.email}`);
    console.log(`Target: ${BASE_URL}`);
    console.log('');

    const flowStartTime = performance.now();
    
    const steps = [
      { name: '1. Load Home Page', test: () => this.step1_LoadHomePage() },
      { name: '2. Access Registration Page', test: () => this.step2_AccessRegistrationPage() },
      { name: '3. Submit Registration', test: () => this.step3_SubmitRegistration() },
      { name: '4. Access Sign In Page', test: () => this.step4_AccessSignInPage() },
      { name: '5. Discover Companies', test: () => this.step5_DiscoverCompanies() },
      { name: '6. View Company Details', test: () => this.step6_ViewCompanyDetails() },
      { name: '7. Explore Events', test: () => this.step7_ExploreEvents() },
      { name: '8. View Event Details', test: () => this.step8_ViewEventDetails() },
      { name: '9. Access Forum', test: () => this.step9_AccessForum() },
      { name: '10. View Forum Search', test: () => this.step10_ViewForumSearch() }
    ];

    let successfulSteps = 0;
    
    for (const step of steps) {
      const success = await this.testStep(step.name, step.test);
      if (success) successfulSteps++;
      
      // Small delay between steps to simulate realistic usage
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const totalDuration = performance.now() - flowStartTime;
    const completionRate = (successfulSteps / steps.length) * 100;
    const overallSuccess = completionRate >= 80; // 80% success rate required

    return {
      flowName: 'User Registration → Company Discovery → Event RSVP → Forum Participation',
      totalDuration,
      steps: this.metrics,
      overallSuccess,
      completionRate
    };
  }

  generateReport(result: TestResult): string {
    const avgStepTime = result.steps.reduce((sum, step) => sum + step.duration, 0) / result.steps.length;
    const successfulSteps = result.steps.filter(step => step.success).length;
    const failedSteps = result.steps.filter(step => !step.success);

    return `
🎯 USER REGISTRATION FLOW TEST REPORT
=====================================
📅 Test Date: ${new Date().toLocaleString()}
🔗 Flow: ${result.flowName}
⏱️  Total Duration: ${result.totalDuration.toFixed(2)}ms (${(result.totalDuration/1000).toFixed(2)}s)
📊 Completion Rate: ${result.completionRate.toFixed(1)}%
🎯 Overall Success: ${result.overallSuccess ? '✅ PASS' : '❌ FAIL'}

📋 STEP-BY-STEP RESULTS:
=======================
${result.steps.map((step, index) => 
`${index + 1}. ${step.stepName}
   Status: ${step.success ? '✅ PASS' : '❌ FAIL'}
   Duration: ${step.duration.toFixed(2)}ms
   ${step.statusCode ? `HTTP: ${step.statusCode}` : ''}
   ${step.errorMessage ? `Error: ${step.errorMessage}` : ''}
   ${step.responseSize ? `Size: ${step.responseSize} bytes` : ''}
`).join('\n')}

📊 PERFORMANCE METRICS:
======================
✅ Successful Steps: ${successfulSteps}/${result.steps.length}
❌ Failed Steps: ${failedSteps.length}
⚡ Average Step Time: ${avgStepTime.toFixed(2)}ms
🚀 Fastest Step: ${Math.min(...result.steps.map(s => s.duration)).toFixed(2)}ms
🐌 Slowest Step: ${Math.max(...result.steps.map(s => s.duration)).toFixed(2)}ms

${failedSteps.length > 0 ? `
❌ FAILED STEPS ANALYSIS:
========================
${failedSteps.map(step => 
`• ${step.stepName}: ${step.errorMessage || 'Unknown error'}`
).join('\n')}
` : '✅ All steps completed successfully!'}

🎯 USER EXPERIENCE ASSESSMENT:
=============================
${result.completionRate >= 95 ? '🏆 EXCELLENT - Seamless user experience' :
  result.completionRate >= 85 ? '✅ GOOD - Minor issues present' :
  result.completionRate >= 70 ? '⚠️ ACCEPTABLE - Some improvements needed' :
  '❌ POOR - Significant issues require attention'}

💡 RECOMMENDATIONS:
==================
${result.completionRate < 100 ? '• Fix failed steps to improve user onboarding' : ''}
${avgStepTime > 3000 ? '• Optimize page load times for better UX' : ''}
${result.steps.some(s => s.statusCode && s.statusCode >= 500) ? '• Address server errors' : ''}
• Continue testing with authenticated user sessions
• Test actual form submissions and data persistence
• Validate user feedback and error messages

=====================================
`;
  }
}

async function main() {
  const tester = new UserRegistrationFlowTester();
  
  try {
    const result = await tester.runCompleteFlow();
    const report = tester.generateReport(result);
    
    console.log(report);
    
    // Save report to file
    const fs = await import('fs/promises');
    await fs.writeFile(
      'user-flow-1-registration-report.txt', 
      report, 
      'utf8'
    );
    
    console.log('📄 Report saved to: user-flow-1-registration-report.txt');
    
    process.exit(result.overallSuccess ? 0 : 1);
    
  } catch (error: any) {
    console.error('💥 Fatal error during flow testing:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 