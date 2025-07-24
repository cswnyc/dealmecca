#!/usr/bin/env node
/**
 * Mobile Performance Test Script
 * Tests mobile page load performance and responsive design elements
 * STEP 3: Performance & Build Optimization
 */

import { performance } from 'perf_hooks';

interface MobileTestResult {
  route: string;
  loadTime: number;
  status: 'PASS' | 'FAIL';
  mobileOptimized: boolean;
  responsiveElements: {
    navigation: boolean;
    content: boolean;
    images: boolean;
    forms: boolean;
  };
  error?: string;
}

interface MobilePerformanceReport {
  totalPages: number;
  passedPages: number;
  failedPages: number;
  averageLoadTime: number;
  mobileOptimizationScore: number;
  results: MobileTestResult[];
  testTimestamp: string;
}

class MobilePerformanceTester {
  private baseUrl = 'http://localhost:3000';
  private maxMobileLoadTime = 3000; // 3 seconds for mobile
  
  private criticalMobileRoutes = [
    '/',
    '/dashboard',
    '/search',
    '/orgs',
    '/events',
    '/forum',
    '/auth/signin',
    '/auth/signup',
    '/settings'
  ];

  private mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1';

  async testMobilePage(route: string): Promise<MobileTestResult> {
    console.log(`📱 Testing mobile: ${route}`);
    
    try {
      const startTime = performance.now();
      
      // Simulate mobile request
      const response = await fetch(`${this.baseUrl}${route}`, {
        method: 'GET',
        headers: {
          'User-Agent': this.mobileUserAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });
      
      const endTime = performance.now();
      const loadTime = Math.round(endTime - startTime);
      
      if (!response.ok) {
        return {
          route,
          loadTime,
          status: 'FAIL',
          mobileOptimized: false,
          responsiveElements: {
            navigation: false,
            content: false,
            images: false,
            forms: false
          },
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      // Get HTML content to analyze mobile optimization
      const htmlContent = await response.text();
      const responsiveElements = this.analyzeResponsiveElements(htmlContent);
      const mobileOptimized = this.checkMobileOptimization(htmlContent);
      
      const status = loadTime <= this.maxMobileLoadTime ? 'PASS' : 'FAIL';
      const result: MobileTestResult = { 
        route, 
        loadTime, 
        status,
        mobileOptimized,
        responsiveElements
      };
      
      if (status === 'FAIL') {
        result.error = `Mobile load time ${loadTime}ms exceeds ${this.maxMobileLoadTime}ms limit`;
      }
      
      return result;
      
    } catch (error) {
      return {
        route,
        loadTime: 0,
        status: 'FAIL',
        mobileOptimized: false,
        responsiveElements: {
          navigation: false,
          content: false,
          images: false,
          forms: false
        },
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private checkMobileOptimization(html: string): boolean {
    const mobileIndicators = [
      // Viewport meta tag
      /<meta\s+name=["']viewport["'].*content=.*width=device-width/i,
      // Responsive classes (Tailwind CSS)
      /class=["'][^"']*(?:sm:|md:|lg:|xl:)/,
      // Mobile-friendly navigation patterns
      /class=["'][^"']*(?:mobile|hamburger|menu-toggle)/i,
      // Touch-friendly elements
      /class=["'][^"']*(?:touch|tap|mobile)/i
    ];

    return mobileIndicators.some(pattern => pattern.test(html));
  }

  private analyzeResponsiveElements(html: string): {
    navigation: boolean;
    content: boolean;
    images: boolean;
    forms: boolean;
  } {
    return {
      navigation: /class=["'][^"']*(?:nav|menu|mobile|hamburger)/i.test(html),
      content: /class=["'][^"']*(?:container|grid|flex|responsive)/i.test(html),
      images: /class=["'][^"']*(?:responsive|w-full|max-w)/i.test(html) && /<img/i.test(html),
      forms: /class=["'][^"']*(?:form|input|button)/i.test(html) && /<form/i.test(html)
    };
  }

  async runAllTests(): Promise<MobilePerformanceReport> {
    console.log('📱 Starting Mobile Performance Tests...\n');
    console.log(`🎯 Target: All mobile pages must load under ${this.maxMobileLoadTime}ms\n`);

    const results: MobileTestResult[] = [];

    for (const route of this.criticalMobileRoutes) {
      const result = await this.testMobilePage(route);
      results.push(result);
      
      const statusEmoji = result.status === 'PASS' ? '✅' : '❌';
      const mobileEmoji = result.mobileOptimized ? '📱' : '🚫';
      console.log(`${statusEmoji} ${mobileEmoji} ${route}: ${result.loadTime}ms ${result.error ? `(${result.error})` : ''}`);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const passedPages = results.filter(r => r.status === 'PASS').length;
    const failedPages = results.filter(r => r.status === 'FAIL').length;
    const validResults = results.filter(r => r.loadTime > 0);
    const averageLoadTime = validResults.length > 0 
      ? Math.round(validResults.reduce((sum, r) => sum + r.loadTime, 0) / validResults.length)
      : 0;

    // Calculate mobile optimization score
    const mobileOptimizedPages = results.filter(r => r.mobileOptimized).length;
    const mobileOptimizationScore = Math.round((mobileOptimizedPages / results.length) * 100);

    const report: MobilePerformanceReport = {
      totalPages: this.criticalMobileRoutes.length,
      passedPages,
      failedPages,
      averageLoadTime,
      mobileOptimizationScore,
      results,
      testTimestamp: new Date().toISOString()
    };

    this.printReport(report);
    return report;
  }

  private printReport(report: MobilePerformanceReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📱 MOBILE PERFORMANCE TEST REPORT');
    console.log('='.repeat(60));
    console.log(`📅 Test Date: ${new Date(report.testTimestamp).toLocaleString()}`);
    console.log(`📄 Total Pages Tested: ${report.totalPages}`);
    console.log(`✅ Pages Passed: ${report.passedPages}`);
    console.log(`❌ Pages Failed: ${report.failedPages}`);
    console.log(`⚡ Average Load Time: ${report.averageLoadTime}ms`);
    console.log(`📱 Mobile Optimization Score: ${report.mobileOptimizationScore}%`);
    console.log(`🎯 Performance Success Rate: ${Math.round((report.passedPages / report.totalPages) * 100)}%`);

    if (report.failedPages > 0) {
      console.log('\n❌ FAILED PAGES:');
      console.log('================');
      report.results
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`   ${result.route}: ${result.error}`);
        });
    }

    console.log('\n📱 MOBILE OPTIMIZATION ANALYSIS:');
    console.log('================================');
    
    const optimizedPages = report.results.filter(r => r.mobileOptimized).length;
    const unoptimizedPages = report.results.filter(r => !r.mobileOptimized).length;
    
    console.log(`✅ Mobile Optimized: ${optimizedPages} pages`);
    console.log(`❌ Not Optimized: ${unoptimizedPages} pages`);

    console.log('\n🧩 RESPONSIVE ELEMENTS ANALYSIS:');
    console.log('================================');
    
    const navigationResponsive = report.results.filter(r => r.responsiveElements.navigation).length;
    const contentResponsive = report.results.filter(r => r.responsiveElements.content).length;
    const imagesResponsive = report.results.filter(r => r.responsiveElements.images).length;
    const formsResponsive = report.results.filter(r => r.responsiveElements.forms).length;
    
    console.log(`🧭 Responsive Navigation: ${navigationResponsive}/${report.totalPages} pages`);
    console.log(`📄 Responsive Content: ${contentResponsive}/${report.totalPages} pages`);
    console.log(`🖼️  Responsive Images: ${imagesResponsive}/${report.totalPages} pages`);
    console.log(`📝 Responsive Forms: ${formsResponsive}/${report.totalPages} pages`);

    console.log('\n📈 MOBILE PERFORMANCE BREAKDOWN:');
    console.log('================================');
    
    const fastPages = report.results.filter(r => r.loadTime > 0 && r.loadTime < 1000).length;
    const mediumPages = report.results.filter(r => r.loadTime >= 1000 && r.loadTime < 2000).length;
    const slowPages = report.results.filter(r => r.loadTime >= 2000 && r.loadTime < 3000).length;
    const verySlowPages = report.results.filter(r => r.loadTime >= 3000).length;
    
    console.log(`⚡ Fast (< 1s): ${fastPages} pages`);
    console.log(`🟡 Medium (1-2s): ${mediumPages} pages`);
    console.log(`🟠 Slow (2-3s): ${slowPages} pages`);
    console.log(`🔴 Very Slow (> 3s): ${verySlowPages} pages`);

    const overallGrade = this.calculateMobileGrade(report);
    console.log(`\n🏆 Overall Mobile Grade: ${overallGrade}`);
    
    if (report.passedPages === report.totalPages && report.mobileOptimizationScore >= 90) {
      console.log('\n🎉 EXCELLENT MOBILE PERFORMANCE! Ready for mobile users.');
    } else if (report.passedPages >= report.totalPages * 0.9 && report.mobileOptimizationScore >= 80) {
      console.log('\n✅ GOOD MOBILE PERFORMANCE! Minor optimizations recommended.');
    } else {
      console.log('\n⚠️  Mobile performance needs improvement before user testing.');
    }

    console.log('\n📋 MOBILE OPTIMIZATION RECOMMENDATIONS:');
    console.log('=======================================');
    
    if (report.mobileOptimizationScore < 90) {
      console.log('• Ensure all pages have proper viewport meta tags');
      console.log('• Implement responsive design patterns consistently');
      console.log('• Add mobile-specific navigation components');
    }
    
    if (report.averageLoadTime > 2000) {
      console.log('• Optimize images for mobile devices');
      console.log('• Implement lazy loading for images and content');
      console.log('• Minimize JavaScript bundle size for mobile');
    }
    
    if (unoptimizedPages > 0) {
      console.log('• Review non-optimized pages for mobile usability');
      console.log('• Test touch interactions and finger-friendly sizing');
      console.log('• Ensure readable font sizes on mobile screens');
    }
  }

  private calculateMobileGrade(report: MobilePerformanceReport): string {
    const performanceScore = (report.passedPages / report.totalPages) * 100;
    const optimizationScore = report.mobileOptimizationScore;
    const avgTime = report.averageLoadTime;
    
    const combinedScore = (performanceScore * 0.4) + (optimizationScore * 0.6);
    
    if (combinedScore >= 95 && avgTime < 1500) return 'A+ (Outstanding Mobile Experience)';
    if (combinedScore >= 90 && avgTime < 2000) return 'A (Excellent Mobile Performance)';
    if (combinedScore >= 85 && avgTime < 2500) return 'B+ (Very Good Mobile UX)';
    if (combinedScore >= 80 && avgTime < 3000) return 'B (Good Mobile Performance)';
    if (combinedScore >= 70) return 'C+ (Acceptable Mobile Experience)';
    if (combinedScore >= 60) return 'C (Needs Mobile Improvement)';
    return 'D (Poor Mobile Experience - Requires Optimization)';
  }
}

// Run the tests if this script is executed directly
async function main() {
  const tester = new MobilePerformanceTester();
  
  try {
    await tester.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('❌ Mobile test execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { MobilePerformanceTester }; 