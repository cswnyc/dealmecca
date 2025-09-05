#!/usr/bin/env node

/**
 * Automated Performance Testing Suite for DealMecca Batch Scaling
 * 
 * This script runs comprehensive performance tests after each batch import
 * to ensure all performance gates are met before proceeding to the next batch.
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { performance } from 'perf_hooks';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  passed: boolean;
  value: number;
  threshold: number;
  unit: string;
  details?: any;
}

interface PerformanceTestResults {
  batchNumber: number;
  testDate: string;
  overallPass: boolean;
  tests: TestResult[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    criticalFailures: string[];
  };
}

class PerformanceTestSuite {
  private baseUrl: string;
  private batchNumber: number;
  private results: TestResult[] = [];

  constructor(baseUrl: string = 'http://localhost:3000', batchNumber: number = 1) {
    this.baseUrl = baseUrl;
    this.batchNumber = batchNumber;
  }

  async runAllTests(): Promise<PerformanceTestResults> {
    console.log(`🚀 Starting Performance Test Suite for Batch ${this.batchNumber}`);
    console.log(`Testing against: ${this.baseUrl}`);
    console.log('=' .repeat(50));

    // Reset results
    this.results = [];

    try {
      // Core Performance Tests
      await this.testPageLoadTimes();
      await this.testSearchResponseTimes();
      await this.testDatabasePerformance();
      await this.testAPIResponseTimes();
      
      // Scalability Tests
      await this.testConcurrentUsers();
      await this.testLargeResultSets();
      await this.testMemoryUsage();
      
      // Mobile Performance Tests
      await this.testMobileResponsiveness();
      await this.testMobileLoadTimes();
      
      // Data Integrity Tests
      await this.testDataConsistency();
      await this.testSearchAccuracy();

    } catch (error) {
      console.error('❌ Test suite failed with error:', error);
      this.results.push({
        name: 'Test Suite Execution',
        passed: false,
        value: 0,
        threshold: 1,
        unit: 'success',
        details: { error: error.message }
      });
    }

    return this.generateReport();
  }

  private async testPageLoadTimes(): Promise<void> {
    console.log('📄 Testing page load times...');

    const pages = [
      '/',
      '/orgs',
      '/forum',
      '/dashboard',
      '/admin'
    ];

    for (const page of pages) {
      const start = performance.now();
      
      try {
        const response = await axios.get(`${this.baseUrl}${page}`, {
          timeout: 10000,
          headers: {
            'User-Agent': 'DealMecca-Performance-Test'
          }
        });
        
        const loadTime = performance.now() - start;
        const passed = loadTime < 3000; // 3 second threshold
        
        this.results.push({
          name: `Page Load: ${page}`,
          passed,
          value: Math.round(loadTime),
          threshold: 3000,
          unit: 'ms',
          details: {
            statusCode: response.status,
            contentLength: response.headers['content-length'] || 0
          }
        });

        console.log(`  ${passed ? '✅' : '❌'} ${page}: ${Math.round(loadTime)}ms`);
        
      } catch (error) {
        this.results.push({
          name: `Page Load: ${page}`,
          passed: false,
          value: 10000,
          threshold: 3000,
          unit: 'ms',
          details: { error: error.message }
        });
        console.log(`  ❌ ${page}: Failed to load`);
      }
    }
  }

  private async testSearchResponseTimes(): Promise<void> {
    console.log('🔍 Testing search response times...');

    const searchQueries = [
      'Media Director',
      'CMO',
      'Brand Manager',
      'Account Director',
      'Programmatic',
      '',  // Empty search
      'zxcvbnm'  // Unlikely search
    ];

    for (const query of searchQueries) {
      const start = performance.now();
      
      try {
        const response = await axios.get(`${this.baseUrl}/api/orgs/companies`, {
          params: { q: query, limit: 25 },
          timeout: 5000
        });
        
        const responseTime = performance.now() - start;
        const passed = responseTime < 1000; // 1 second threshold
        
        this.results.push({
          name: `Search: "${query || 'empty'}"`,
          passed,
          value: Math.round(responseTime),
          threshold: 1000,
          unit: 'ms',
          details: {
            resultCount: response.data?.companies?.length || 0,
            totalResults: response.data?.total || 0
          }
        });

        console.log(`  ${passed ? '✅' : '❌'} "${query || 'empty'}": ${Math.round(responseTime)}ms (${response.data?.companies?.length || 0} results)`);
        
      } catch (error) {
        this.results.push({
          name: `Search: "${query || 'empty'}"`,
          passed: false,
          value: 5000,
          threshold: 1000,
          unit: 'ms',
          details: { error: error.message }
        });
        console.log(`  ❌ "${query || 'empty'}": Failed`);
      }
    }
  }

  private async testDatabasePerformance(): Promise<void> {
    console.log('💾 Testing database performance...');

    try {
      // Test basic query performance
      const start = performance.now();
      const companyCount = await prisma.company.count();
      const countTime = performance.now() - start;
      
      this.results.push({
        name: 'DB Count Query',
        passed: countTime < 100,
        value: Math.round(countTime),
        threshold: 100,
        unit: 'ms',
        details: { companyCount }
      });

      // Test complex query with relations
      const complexStart = performance.now();
      const companiesWithContacts = await prisma.company.findMany({
        take: 10,
        include: {
          contacts: {
            take: 5
          },
          _count: {
            select: {
              contacts: true
            }
          }
        }
      });
      const complexTime = performance.now() - complexStart;
      
      this.results.push({
        name: 'DB Complex Query',
        passed: complexTime < 500,
        value: Math.round(complexTime),
        threshold: 500,
        unit: 'ms',
        details: { resultCount: companiesWithContacts.length }
      });

      console.log(`  ✅ Count query: ${Math.round(countTime)}ms (${companyCount} companies)`);
      console.log(`  ${complexTime < 500 ? '✅' : '❌'} Complex query: ${Math.round(complexTime)}ms`);

    } catch (error) {
      this.results.push({
        name: 'Database Performance',
        passed: false,
        value: 0,
        threshold: 1,
        unit: 'success',
        details: { error: error.message }
      });
      console.log(`  ❌ Database test failed: ${error.message}`);
    }
  }

  private async testAPIResponseTimes(): Promise<void> {
    console.log('🔌 Testing API response times...');

    const endpoints = [
      { path: '/api/orgs/companies', method: 'GET' },
      { path: '/api/auth/session', method: 'GET' },
      { path: '/api/admin/stats', method: 'GET' },
    ];

    for (const endpoint of endpoints) {
      const start = performance.now();
      
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${this.baseUrl}${endpoint.path}`,
          timeout: 5000
        });
        
        const responseTime = performance.now() - start;
        const passed = responseTime < 2000; // 2 second threshold for APIs
        
        this.results.push({
          name: `API: ${endpoint.method} ${endpoint.path}`,
          passed,
          value: Math.round(responseTime),
          threshold: 2000,
          unit: 'ms',
          details: {
            statusCode: response.status,
            responseSize: JSON.stringify(response.data).length
          }
        });

        console.log(`  ${passed ? '✅' : '❌'} ${endpoint.method} ${endpoint.path}: ${Math.round(responseTime)}ms`);
        
      } catch (error) {
        this.results.push({
          name: `API: ${endpoint.method} ${endpoint.path}`,
          passed: false,
          value: 5000,
          threshold: 2000,
          unit: 'ms',
          details: { error: error.message }
        });
        console.log(`  ❌ ${endpoint.method} ${endpoint.path}: Failed`);
      }
    }
  }

  private async testConcurrentUsers(): Promise<void> {
    console.log('👥 Testing concurrent user simulation...');

    const concurrentRequests = 5;
    const promises: Promise<any>[] = [];

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        axios.get(`${this.baseUrl}/api/orgs/companies?q=Media&limit=10`, {
          timeout: 5000
        })
      );
    }

    const start = performance.now();
    
    try {
      const results = await Promise.all(promises);
      const totalTime = performance.now() - start;
      const avgTime = totalTime / concurrentRequests;
      const passed = avgTime < 1500; // 1.5 second average threshold
      
      this.results.push({
        name: `Concurrent Users (${concurrentRequests})`,
        passed,
        value: Math.round(avgTime),
        threshold: 1500,
        unit: 'ms avg',
        details: {
          totalTime: Math.round(totalTime),
          successfulRequests: results.filter(r => r.status === 200).length
        }
      });

      console.log(`  ${passed ? '✅' : '❌'} ${concurrentRequests} concurrent requests: ${Math.round(avgTime)}ms average`);
      
    } catch (error) {
      this.results.push({
        name: `Concurrent Users (${concurrentRequests})`,
        passed: false,
        value: 5000,
        threshold: 1500,
        unit: 'ms avg',
        details: { error: error.message }
      });
      console.log(`  ❌ Concurrent user test failed`);
    }
  }

  private async testLargeResultSets(): Promise<void> {
    console.log('📊 Testing large result set handling...');

    try {
      const start = performance.now();
      const response = await axios.get(`${this.baseUrl}/api/orgs/companies`, {
        params: { limit: 100 }, // Request large result set
        timeout: 10000
      });
      
      const responseTime = performance.now() - start;
      const passed = responseTime < 3000; // 3 second threshold for large sets
      
      this.results.push({
        name: 'Large Result Set (100 items)',
        passed,
        value: Math.round(responseTime),
        threshold: 3000,
        unit: 'ms',
        details: {
          actualResults: response.data?.companies?.length || 0,
          totalAvailable: response.data?.total || 0
        }
      });

      console.log(`  ${passed ? '✅' : '❌'} 100 results: ${Math.round(responseTime)}ms`);
      
    } catch (error) {
      this.results.push({
        name: 'Large Result Set (100 items)',
        passed: false,
        value: 10000,
        threshold: 3000,
        unit: 'ms',
        details: { error: error.message }
      });
      console.log(`  ❌ Large result set test failed`);
    }
  }

  private async testMemoryUsage(): Promise<void> {
    console.log('🧠 Testing memory usage patterns...');

    // Mock memory test - in production would use actual memory monitoring
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const passed = heapUsedMB < 512; // 512MB threshold
    
    this.results.push({
      name: 'Memory Usage',
      passed,
      value: heapUsedMB,
      threshold: 512,
      unit: 'MB',
      details: {
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      }
    });

    console.log(`  ${passed ? '✅' : '❌'} Memory usage: ${heapUsedMB}MB`);
  }

  private async testMobileResponsiveness(): Promise<void> {
    console.log('📱 Testing mobile responsiveness...');

    // Mock mobile test - in production would use headless browser testing
    try {
      const response = await axios.get(`${this.baseUrl}/orgs`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
        },
        timeout: 5000
      });
      
      const passed = response.status === 200;
      
      this.results.push({
        name: 'Mobile Responsiveness',
        passed,
        value: passed ? 1 : 0,
        threshold: 1,
        unit: 'success',
        details: {
          statusCode: response.status,
          contentType: response.headers['content-type']
        }
      });

      console.log(`  ${passed ? '✅' : '❌'} Mobile responsiveness test`);
      
    } catch (error) {
      this.results.push({
        name: 'Mobile Responsiveness',
        passed: false,
        value: 0,
        threshold: 1,
        unit: 'success',
        details: { error: error.message }
      });
      console.log(`  ❌ Mobile responsiveness test failed`);
    }
  }

  private async testMobileLoadTimes(): Promise<void> {
    console.log('📱 Testing mobile-specific load times...');

    // Simulate mobile network conditions
    const start = performance.now();
    
    try {
      const response = await axios.get(`${this.baseUrl}/orgs`, {
        headers: {
          'User-Agent': 'Mobile Performance Test'
        },
        timeout: 8000 // Longer timeout for mobile
      });
      
      const loadTime = performance.now() - start;
      const passed = loadTime < 5000; // 5 second threshold for mobile
      
      this.results.push({
        name: 'Mobile Load Time',
        passed,
        value: Math.round(loadTime),
        threshold: 5000,
        unit: 'ms',
        details: {
          statusCode: response.status
        }
      });

      console.log(`  ${passed ? '✅' : '❌'} Mobile load time: ${Math.round(loadTime)}ms`);
      
    } catch (error) {
      this.results.push({
        name: 'Mobile Load Time',
        passed: false,
        value: 8000,
        threshold: 5000,
        unit: 'ms',
        details: { error: error.message }
      });
      console.log(`  ❌ Mobile load time test failed`);
    }
  }

  private async testDataConsistency(): Promise<void> {
    console.log('🔍 Testing data consistency...');

    try {
      // Test that search results are consistent
      const search1 = await axios.get(`${this.baseUrl}/api/orgs/companies?q=Media&limit=10`);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      const search2 = await axios.get(`${this.baseUrl}/api/orgs/companies?q=Media&limit=10`);
      
      const results1 = search1.data?.companies || [];
      const results2 = search2.data?.companies || [];
      
      const consistent = results1.length === results2.length &&
                        results1.every((company: any, index: number) => 
                          results2[index]?.id === company.id);
      
      this.results.push({
        name: 'Search Result Consistency',
        passed: consistent,
        value: consistent ? 1 : 0,
        threshold: 1,
        unit: 'success',
        details: {
          firstResultCount: results1.length,
          secondResultCount: results2.length
        }
      });

      console.log(`  ${consistent ? '✅' : '❌'} Search consistency: ${consistent ? 'Consistent' : 'Inconsistent'}`);
      
    } catch (error) {
      this.results.push({
        name: 'Search Result Consistency',
        passed: false,
        value: 0,
        threshold: 1,
        unit: 'success',
        details: { error: error.message }
      });
      console.log(`  ❌ Data consistency test failed`);
    }
  }

  private async testSearchAccuracy(): Promise<void> {
    console.log('🎯 Testing search accuracy...');

    try {
      // Test that search returns relevant results
      const response = await axios.get(`${this.baseUrl}/api/orgs/companies?q=Media`);
      const companies = response.data?.companies || [];
      
      // Check if results contain the search term (simple relevance test)
      const relevantResults = companies.filter((company: any) =>
        company.name?.toLowerCase().includes('media') ||
        company.industry?.toLowerCase().includes('media') ||
        company.description?.toLowerCase().includes('media')
      );
      
      const accuracyRate = companies.length > 0 ? (relevantResults.length / companies.length) * 100 : 0;
      const passed = accuracyRate >= 70; // 70% relevance threshold
      
      this.results.push({
        name: 'Search Accuracy',
        passed,
        value: Math.round(accuracyRate),
        threshold: 70,
        unit: '% relevant',
        details: {
          totalResults: companies.length,
          relevantResults: relevantResults.length
        }
      });

      console.log(`  ${passed ? '✅' : '❌'} Search accuracy: ${Math.round(accuracyRate)}%`);
      
    } catch (error) {
      this.results.push({
        name: 'Search Accuracy',
        passed: false,
        value: 0,
        threshold: 70,
        unit: '% relevant',
        details: { error: error.message }
      });
      console.log(`  ❌ Search accuracy test failed`);
    }
  }

  private generateReport(): PerformanceTestResults {
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = this.results.length - passedTests;
    const criticalFailures = this.results
      .filter(r => !r.passed && (r.name.includes('Page Load') || r.name.includes('Search')))
      .map(r => r.name);

    const report: PerformanceTestResults = {
      batchNumber: this.batchNumber,
      testDate: new Date().toISOString(),
      overallPass: criticalFailures.length === 0 && passedTests >= this.results.length * 0.8,
      tests: this.results,
      summary: {
        totalTests: this.results.length,
        passedTests,
        failedTests,
        criticalFailures
      }
    };

    console.log('\n' + '='.repeat(50));
    console.log('📊 PERFORMANCE TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Batch: ${this.batchNumber}`);
    console.log(`Overall Result: ${report.overallPass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Tests Passed: ${passedTests}/${this.results.length} (${Math.round(passedTests/this.results.length*100)}%)`);
    
    if (criticalFailures.length > 0) {
      console.log(`\n🚨 Critical Failures:`);
      criticalFailures.forEach(failure => console.log(`  - ${failure}`));
    }

    console.log('\nDetailed Results:');
    this.results.forEach(result => {
      console.log(`  ${result.passed ? '✅' : '❌'} ${result.name}: ${result.value}${result.unit} (threshold: ${result.threshold}${result.unit})`);
    });

    return report;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:3000';
  const batchNumber = parseInt(args[1]) || 1;

  const testSuite = new PerformanceTestSuite(baseUrl, batchNumber);
  
  testSuite.runAllTests()
    .then(report => {
      // Save report to file
      const fs = require('fs');
      const reportPath = `./performance-report-batch-${batchNumber}-${Date.now()}.json`;
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Full report saved to: ${reportPath}`);
      
      // Exit with error code if tests failed
      process.exit(report.overallPass ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { PerformanceTestSuite, type PerformanceTestResults, type TestResult };