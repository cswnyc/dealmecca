#!/usr/bin/env node
/**
 * Page Load Performance Test Script
 * Tests all critical pages to ensure they load under 3 seconds
 * STEP 3: Performance & Build Optimization
 */

import { performance } from 'perf_hooks';

interface TestResult {
  route: string;
  loadTime: number;
  status: 'PASS' | 'FAIL';
  error?: string;
}

interface PerformanceReport {
  totalPages: number;
  passedPages: number;
  failedPages: number;
  averageLoadTime: number;
  results: TestResult[];
  testTimestamp: string;
}

class PageLoadTester {
  private baseUrl = 'http://localhost:3000';
  private maxLoadTime = 3000; // 3 seconds in milliseconds
  
  private criticalRoutes = [
    '/',
    '/dashboard',
    '/search',
    '/search/enhanced',
    '/orgs',
    '/events',
    '/forum',
    '/intelligence',
    '/settings',
    '/pricing',
    '/auth/signin',
    '/auth/signup',
  ];

  private dynamicRoutes = [
    '/orgs/companies/1',
    '/orgs/contacts/1',
    '/events/1',
    '/profile/1',
  ];

  async testPageLoad(route: string): Promise<TestResult> {
    console.log(`🔄 Testing: ${route}`);
    
    try {
      const startTime = performance.now();
      
      // Simulate page load with fetch to check if route responds
      const response = await fetch(`${this.baseUrl}${route}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Performance-Test-Bot/1.0'
        }
      });
      
      const endTime = performance.now();
      const loadTime = Math.round(endTime - startTime);
      
      if (!response.ok) {
        return {
          route,
          loadTime,
          status: 'FAIL',
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      const status = loadTime <= this.maxLoadTime ? 'PASS' : 'FAIL';
      const result: TestResult = { route, loadTime, status };
      
      if (status === 'FAIL') {
        result.error = `Load time ${loadTime}ms exceeds ${this.maxLoadTime}ms limit`;
      }
      
      return result;
      
    } catch (error) {
      return {
        route,
        loadTime: 0,
        status: 'FAIL',
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async runAllTests(): Promise<PerformanceReport> {
    console.log('🚀 Starting Page Load Performance Tests...\n');
    console.log(`🎯 Target: All pages must load under ${this.maxLoadTime}ms (3 seconds)\n`);

    const allRoutes = [...this.criticalRoutes, ...this.dynamicRoutes];
    const results: TestResult[] = [];

    for (const route of allRoutes) {
      const result = await this.testPageLoad(route);
      results.push(result);
      
      const statusEmoji = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${statusEmoji} ${route}: ${result.loadTime}ms ${result.error ? `(${result.error})` : ''}`);
      
      // Small delay between tests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const passedPages = results.filter(r => r.status === 'PASS').length;
    const failedPages = results.filter(r => r.status === 'FAIL').length;
    const validResults = results.filter(r => r.loadTime > 0);
    const averageLoadTime = validResults.length > 0 
      ? Math.round(validResults.reduce((sum, r) => sum + r.loadTime, 0) / validResults.length)
      : 0;

    const report: PerformanceReport = {
      totalPages: allRoutes.length,
      passedPages,
      failedPages,
      averageLoadTime,
      results,
      testTimestamp: new Date().toISOString()
    };

    this.printReport(report);
    return report;
  }

  private printReport(report: PerformanceReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PAGE LOAD PERFORMANCE TEST REPORT');
    console.log('='.repeat(60));
    console.log(`📅 Test Date: ${new Date(report.testTimestamp).toLocaleString()}`);
    console.log(`📄 Total Pages Tested: ${report.totalPages}`);
    console.log(`✅ Pages Passed: ${report.passedPages}`);
    console.log(`❌ Pages Failed: ${report.failedPages}`);
    console.log(`⚡ Average Load Time: ${report.averageLoadTime}ms`);
    console.log(`🎯 Success Rate: ${Math.round((report.passedPages / report.totalPages) * 100)}%`);
    
    if (report.failedPages > 0) {
      console.log('\n❌ FAILED PAGES:');
      console.log('================');
      report.results
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`   ${result.route}: ${result.error}`);
        });
    }

    console.log('\n📈 PERFORMANCE BREAKDOWN:');
    console.log('=========================');
    
    const fastPages = report.results.filter(r => r.loadTime > 0 && r.loadTime < 1000).length;
    const mediumPages = report.results.filter(r => r.loadTime >= 1000 && r.loadTime < 2000).length;
    const slowPages = report.results.filter(r => r.loadTime >= 2000 && r.loadTime < 3000).length;
    const verySlowPages = report.results.filter(r => r.loadTime >= 3000).length;
    
    console.log(`⚡ Fast (< 1s): ${fastPages} pages`);
    console.log(`🟡 Medium (1-2s): ${mediumPages} pages`);
    console.log(`🟠 Slow (2-3s): ${slowPages} pages`);
    console.log(`🔴 Very Slow (> 3s): ${verySlowPages} pages`);

    const overallGrade = this.calculateGrade(report);
    console.log(`\n🏆 Overall Performance Grade: ${overallGrade}`);
    
    if (report.passedPages === report.totalPages) {
      console.log('\n🎉 ALL PAGES PASSED! Platform ready for user testing.');
    } else {
      console.log('\n⚠️  Some pages need optimization before user testing.');
    }
  }

  private calculateGrade(report: PerformanceReport): string {
    const successRate = (report.passedPages / report.totalPages) * 100;
    const avgTime = report.averageLoadTime;
    
    if (successRate === 100 && avgTime < 1000) return 'A+ (Excellent)';
    if (successRate >= 95 && avgTime < 1500) return 'A (Great)';
    if (successRate >= 90 && avgTime < 2000) return 'B+ (Good)';
    if (successRate >= 80 && avgTime < 2500) return 'B (Acceptable)';
    if (successRate >= 70 && avgTime < 3000) return 'C (Needs Improvement)';
    return 'D (Poor - Requires Optimization)';
  }
}

// Run the tests if this script is executed directly
async function main() {
  const tester = new PageLoadTester();
  
  try {
    await tester.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { PageLoadTester }; 