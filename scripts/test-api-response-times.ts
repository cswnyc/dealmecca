#!/usr/bin/env node
/**
 * API Response Time Test Script
 * Tests all critical API endpoints to ensure acceptable response times
 * STEP 3: Performance & Build Optimization
 */

import { performance } from 'perf_hooks';

interface APITestResult {
  endpoint: string;
  method: string;
  responseTime: number;
  status: number;
  success: boolean;
  error?: string;
  grade: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'SLOW' | 'FAIL';
}

interface APIPerformanceReport {
  totalEndpoints: number;
  successfulResponses: number;
  failedResponses: number;
  averageResponseTime: number;
  results: APITestResult[];
  testTimestamp: string;
  overallGrade: string;
}

class APIResponseTester {
  private baseUrl = 'http://localhost:3000';
  
  private criticalEndpoints = [
    // Health check
    { path: '/api/health', method: 'GET', expectedTime: 100 },
    
    // Authentication & User Management
    { path: '/api/users/profile', method: 'GET', expectedTime: 300 },
    
    // Search & Core Functionality
    { path: '/api/search/suggestions?q=test', method: 'GET', expectedTime: 500 },
    { path: '/api/orgs/companies?page=1&limit=20', method: 'GET', expectedTime: 800 },
    { path: '/api/orgs/contacts?page=1&limit=20', method: 'GET', expectedTime: 800 },
    { path: '/api/orgs/industries', method: 'GET', expectedTime: 400 },
    
    // Events
    { path: '/api/events?page=1&limit=10', method: 'GET', expectedTime: 600 },
    
    // Forum
    { path: '/api/forum/categories', method: 'GET', expectedTime: 300 },
    { path: '/api/forum/posts?page=1&limit=10', method: 'GET', expectedTime: 700 },
    { path: '/api/forum/trending', method: 'GET', expectedTime: 500 },
    
    // Dashboard & Analytics
    { path: '/api/dashboard/metrics', method: 'GET', expectedTime: 400 },
    { path: '/api/dashboard/upcoming-events', method: 'GET', expectedTime: 300 },
    { path: '/api/usage', method: 'GET', expectedTime: 200 },
    
    // Admin endpoints
    { path: '/api/admin/stats', method: 'GET', expectedTime: 600 },
  ];

  async testEndpoint(endpoint: { path: string; method: string; expectedTime: number }): Promise<APITestResult> {
    console.log(`🔄 Testing: ${endpoint.method} ${endpoint.path}`);
    
    try {
      const startTime = performance.now();
      
      const response = await fetch(`${this.baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'API-Performance-Test/1.0'
        }
      });
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      const result: APITestResult = {
        endpoint: endpoint.path,
        method: endpoint.method,
        responseTime,
        status: response.status,
        success: response.ok,
        grade: this.calculateGrade(responseTime, endpoint.expectedTime)
      };
      
      if (!response.ok) {
        result.error = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      return result;
      
    } catch (error) {
      return {
        endpoint: endpoint.path,
        method: endpoint.method,
        responseTime: 0,
        status: 0,
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        grade: 'FAIL'
      };
    }
  }

  private calculateGrade(responseTime: number, expectedTime: number): 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'SLOW' | 'FAIL' {
    if (responseTime <= expectedTime * 0.5) return 'EXCELLENT';
    if (responseTime <= expectedTime) return 'GOOD';
    if (responseTime <= expectedTime * 1.5) return 'ACCEPTABLE';
    if (responseTime <= expectedTime * 3) return 'SLOW';
    return 'FAIL';
  }

  async runAllTests(): Promise<APIPerformanceReport> {
    console.log('🚀 Starting API Response Time Tests...\n');
    console.log('🎯 Testing critical API endpoints for acceptable response times\n');

    const results: APITestResult[] = [];

    for (const endpoint of this.criticalEndpoints) {
      const result = await this.testEndpoint(endpoint);
      results.push(result);
      
      const gradeEmoji = this.getGradeEmoji(result.grade);
      const statusEmoji = result.success ? '✅' : '❌';
      console.log(`${statusEmoji} ${gradeEmoji} ${result.method} ${result.endpoint}: ${result.responseTime}ms ${result.error ? `(${result.error})` : ''}`);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const successfulResponses = results.filter(r => r.success).length;
    const failedResponses = results.filter(r => !r.success).length;
    const validResults = results.filter(r => r.responseTime > 0);
    const averageResponseTime = validResults.length > 0 
      ? Math.round(validResults.reduce((sum, r) => sum + r.responseTime, 0) / validResults.length)
      : 0;

    const report: APIPerformanceReport = {
      totalEndpoints: this.criticalEndpoints.length,
      successfulResponses,
      failedResponses,
      averageResponseTime,
      results,
      testTimestamp: new Date().toISOString(),
      overallGrade: this.calculateOverallGrade(results)
    };

    this.printReport(report);
    return report;
  }

  private getGradeEmoji(grade: string): string {
    switch (grade) {
      case 'EXCELLENT': return '🟢';
      case 'GOOD': return '🟡';
      case 'ACCEPTABLE': return '🟠';
      case 'SLOW': return '🔴';
      case 'FAIL': return '💥';
      default: return '❓';
    }
  }

  private calculateOverallGrade(results: APITestResult[]): string {
    const successRate = results.filter(r => r.success).length / results.length * 100;
    const avgTime = results.filter(r => r.responseTime > 0)
      .reduce((sum, r) => sum + r.responseTime, 0) / results.filter(r => r.responseTime > 0).length;
    
    const excellentCount = results.filter(r => r.grade === 'EXCELLENT').length;
    const goodCount = results.filter(r => r.grade === 'GOOD').length;
    const acceptableCount = results.filter(r => r.grade === 'ACCEPTABLE').length;
    
    const excellentPercentage = (excellentCount / results.length) * 100;
    const goodOrBetterPercentage = ((excellentCount + goodCount) / results.length) * 100;

    if (successRate === 100 && excellentPercentage >= 80) return 'A+ (Outstanding)';
    if (successRate >= 95 && goodOrBetterPercentage >= 85) return 'A (Excellent)';
    if (successRate >= 90 && goodOrBetterPercentage >= 70) return 'B+ (Very Good)';
    if (successRate >= 85 && goodOrBetterPercentage >= 60) return 'B (Good)';
    if (successRate >= 80) return 'C+ (Acceptable)';
    if (successRate >= 70) return 'C (Needs Improvement)';
    return 'D (Poor - Requires Optimization)';
  }

  private printReport(report: APIPerformanceReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 API RESPONSE TIME TEST REPORT');
    console.log('='.repeat(60));
    console.log(`📅 Test Date: ${new Date(report.testTimestamp).toLocaleString()}`);
    console.log(`🎯 Total Endpoints Tested: ${report.totalEndpoints}`);
    console.log(`✅ Successful Responses: ${report.successfulResponses}`);
    console.log(`❌ Failed Responses: ${report.failedResponses}`);
    console.log(`⚡ Average Response Time: ${report.averageResponseTime}ms`);
    console.log(`📊 Success Rate: ${Math.round((report.successfulResponses / report.totalEndpoints) * 100)}%`);
    
    if (report.failedResponses > 0) {
      console.log('\n❌ FAILED ENDPOINTS:');
      console.log('====================');
      report.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`   ${result.method} ${result.endpoint}: ${result.error}`);
        });
    }

    console.log('\n📈 RESPONSE TIME BREAKDOWN:');
    console.log('===========================');
    
    const excellent = report.results.filter(r => r.grade === 'EXCELLENT').length;
    const good = report.results.filter(r => r.grade === 'GOOD').length;
    const acceptable = report.results.filter(r => r.grade === 'ACCEPTABLE').length;
    const slow = report.results.filter(r => r.grade === 'SLOW').length;
    const failed = report.results.filter(r => r.grade === 'FAIL').length;
    
    console.log(`🟢 Excellent: ${excellent} endpoints`);
    console.log(`🟡 Good: ${good} endpoints`);
    console.log(`🟠 Acceptable: ${acceptable} endpoints`);
    console.log(`🔴 Slow: ${slow} endpoints`);
    console.log(`💥 Failed: ${failed} endpoints`);

    console.log(`\n🏆 Overall API Grade: ${report.overallGrade}`);
    
    if (report.successfulResponses === report.totalEndpoints && excellent + good >= report.totalEndpoints * 0.8) {
      console.log('\n🎉 EXCELLENT API PERFORMANCE! Ready for production.');
    } else if (report.successfulResponses >= report.totalEndpoints * 0.9) {
      console.log('\n✅ GOOD API PERFORMANCE! Minor optimizations recommended.');
    } else {
      console.log('\n⚠️  API performance needs improvement before production deployment.');
    }

    console.log('\n📋 PERFORMANCE RECOMMENDATIONS:');
    console.log('================================');
    
    if (report.averageResponseTime > 500) {
      console.log('• Consider database query optimization');
      console.log('• Implement caching for frequently accessed data');
      console.log('• Review API endpoint efficiency');
    }
    
    if (report.failedResponses > 0) {
      console.log('• Fix failed endpoints before deployment');
      console.log('• Implement proper error handling');
    }
    
    if (slow + failed > 0) {
      console.log('• Optimize slow endpoints');
      console.log('• Consider pagination for large datasets');
      console.log('• Implement request timeout handling');
    }
  }
}

// Run the tests if this script is executed directly
async function main() {
  const tester = new APIResponseTester();
  
  try {
    await tester.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('❌ API test execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { APIResponseTester }; 