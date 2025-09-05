#!/usr/bin/env node

/**
 * Batch Import Orchestrator for DealMecca Gradual Scaling
 * 
 * Complete orchestration system that manages the entire batch import lifecycle:
 * - Pre-batch validation and setup
 * - Import execution with real-time monitoring  
 * - Post-batch validation and analysis
 * - Learning extraction and optimization recommendations
 * 
 * Usage:
 *   npm run batch-orchestrator -- init 2 150 200
 *   npm run batch-orchestrator -- start 2
 *   npm run batch-orchestrator -- monitor 2
 *   npm run batch-orchestrator -- complete 2
 */

import { PerformanceTestSuite } from './automated-performance-tests';
import { MobileValidationSuite } from './mobile-validation-suite';
import { runPreBatchGateCheck, runPostBatchGateCheck } from '../lib/performance-gates';
import { batchProgressTracker, type BatchConfig } from '../lib/batch-progress-tracker';
import { logger } from '../lib/logger';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface BatchOrchestrationResult {
  success: boolean;
  batchNumber: number;
  action: string;
  summary: any;
  reportPath?: string;
  recommendations: string[];
  nextSteps: string[];
}

class BatchOrchestrator {
  private baseUrl: string;
  private reportsDir: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.reportsDir = './batch-reports';
    
    // Ensure reports directory exists
    if (!existsSync(this.reportsDir)) {
      mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async initializeBatch(batchNumber: number, targetCompanies: number, targetContacts: number): Promise<BatchOrchestrationResult> {
    console.log(`🚀 Initializing Batch ${batchNumber}`);
    console.log(`Target: ${targetCompanies} companies, ${targetContacts} contacts`);
    console.log('=' .repeat(60));

    try {
      // Create batch configuration
      const config: BatchConfig = {
        batchNumber,
        targetCompanies,
        targetContacts,
        importSource: 'CSV Import',
        scheduledDate: new Date(),
        estimatedDuration: Math.ceil((targetCompanies + targetContacts) / 100) * 10, // 10 min per 100 records
        learningGoals: [
          'Monitor system performance with increased data volume',
          'Analyze user search patterns with more diverse data',
          'Validate mobile experience remains optimal',
          'Identify optimization opportunities'
        ],
        performanceTargets: {
          maxLoadTime: 3000,
          maxSearchTime: 1000,
          minSuccessRate: 95,
          minMobileScore: 85
        }
      };

      // Initialize progress tracking
      const progressId = await batchProgressTracker.initializeBatch(config);
      
      // Run pre-batch validation
      console.log('\n📋 Running pre-batch validation...');
      const preGateResults = await runPreBatchGateCheck(batchNumber);
      
      const recommendations: string[] = [];
      const nextSteps: string[] = [];

      if (preGateResults.readyForNextBatch) {
        console.log('✅ Pre-batch validation passed - Ready to proceed');
        nextSteps.push(`Run: npm run batch-orchestrator -- start ${batchNumber}`);
        nextSteps.push('Ensure CSV file is prepared and validated');
        nextSteps.push('Schedule import during low-traffic hours');
      } else {
        console.log('❌ Pre-batch validation failed');
        preGateResults.criticalFailures.forEach(failure => {
          console.log(`  • ${failure.name}: ${failure.currentValue}${failure.unit} (threshold: ${failure.threshold}${failure.unit})`);
          if (failure.suggestions && failure.suggestions.length > 0) {
            recommendations.push(`${failure.name}: ${failure.suggestions[0]}`);
          }
        });
        nextSteps.push('Address critical performance issues before proceeding');
        nextSteps.push('Re-run initialization after fixes are applied');
      }

      // Save initialization report
      const reportPath = this.saveReport(`batch-${batchNumber}-init`, {
        batchNumber,
        config,
        progressId,
        preGateResults,
        initializationTime: new Date().toISOString()
      });

      return {
        success: preGateResults.readyForNextBatch,
        batchNumber,
        action: 'initialize',
        summary: {
          progressId,
          targetRecords: targetCompanies + targetContacts,
          estimatedDuration: config.estimatedDuration,
          readyToStart: preGateResults.readyForNextBatch
        },
        reportPath,
        recommendations,
        nextSteps
      };

    } catch (error) {
      logger.error(`Batch ${batchNumber} initialization failed:`, error);
      
      return {
        success: false,
        batchNumber,
        action: 'initialize',
        summary: { error: error.message },
        recommendations: ['Fix initialization errors before proceeding'],
        nextSteps: ['Check system status and retry initialization']
      };
    }
  }

  async startBatch(batchNumber: number): Promise<BatchOrchestrationResult> {
    console.log(`▶️  Starting Batch ${batchNumber}`);
    console.log('=' .repeat(60));

    try {
      // Start batch progress tracking
      await batchProgressTracker.startBatch(batchNumber);
      
      console.log('✅ Batch started successfully');
      console.log('\n📊 Real-time monitoring available at:');
      console.log(`   Admin Dashboard: ${this.baseUrl}/admin/scaling-monitor`);
      console.log(`   CLI Monitoring: npm run batch-orchestrator -- monitor ${batchNumber}`);
      
      const recommendations = [
        'Monitor import progress regularly',
        'Watch for performance alerts',
        'Validate data quality during import',
        'Be ready to pause import if critical issues arise'
      ];

      const nextSteps = [
        `Monitor: npm run batch-orchestrator -- monitor ${batchNumber}`,
        'Begin actual CSV import process',
        'Watch admin dashboard for real-time updates',
        `Complete: npm run batch-orchestrator -- complete ${batchNumber}`
      ];

      return {
        success: true,
        batchNumber,
        action: 'start',
        summary: {
          startedAt: new Date(),
          monitoringEnabled: true,
          dashboardUrl: `${this.baseUrl}/admin/scaling-monitor`
        },
        recommendations,
        nextSteps
      };

    } catch (error) {
      logger.error(`Failed to start batch ${batchNumber}:`, error);
      
      return {
        success: false,
        batchNumber,
        action: 'start',
        summary: { error: error.message },
        recommendations: ['Resolve startup issues', 'Check system health'],
        nextSteps: ['Fix errors and retry batch start']
      };
    }
  }

  async monitorBatch(batchNumber: number): Promise<BatchOrchestrationResult> {
    console.log(`📊 Monitoring Batch ${batchNumber}`);
    console.log('=' .repeat(60));

    try {
      const progress = batchProgressTracker.getBatchProgress(batchNumber);
      const config = batchProgressTracker.getBatchConfig(batchNumber);

      if (!progress || !config) {
        throw new Error(`Batch ${batchNumber} not found or not started`);
      }

      // Display current status
      console.log(`Status: ${progress.status.toUpperCase()}`);
      console.log(`Current Step: ${progress.currentStep}`);
      console.log(`Progress: ${progress.progress.percentComplete.toFixed(1)}%`);
      console.log(`Companies: ${progress.progress.companiesProcessed}/${config.targetCompanies}`);
      console.log(`Contacts: ${progress.progress.contactsProcessed}/${config.targetContacts}`);
      
      console.log('\n⚡ Performance Metrics:');
      console.log(`  Import Speed: ${progress.performance.importSpeed} records/min`);
      console.log(`  Memory Usage: ${progress.performance.memoryUsage} MB`);
      console.log(`  Error Rate: ${progress.performance.errorRate.toFixed(2)}%`);
      console.log(`  ETA: ${progress.performance.estimatedTimeRemaining} minutes`);

      if (progress.issues.length > 0) {
        console.log('\n⚠️  Issues:');
        progress.issues.filter(i => !i.resolved).forEach(issue => {
          console.log(`  ${issue.type.toUpperCase()}: ${issue.message} (${issue.count})`);
        });
      }

      if (progress.insights.performanceChanges.length > 0) {
        console.log('\n💡 Insights:');
        progress.insights.performanceChanges.slice(-3).forEach(insight => {
          console.log(`  • ${insight}`);
        });
      }

      const recommendations: string[] = [];
      const nextSteps: string[] = [];

      // Generate monitoring recommendations based on current state
      if (progress.performance.errorRate > 5) {
        recommendations.push('High error rate detected - investigate data quality issues');
      }

      if (progress.performance.memoryUsage > 500) {
        recommendations.push('High memory usage - monitor for potential issues');
      }

      if (progress.progress.percentComplete > 90) {
        recommendations.push('Batch nearing completion - prepare for post-batch validation');
        nextSteps.push(`Complete: npm run batch-orchestrator -- complete ${batchNumber}`);
      } else {
        nextSteps.push('Continue monitoring batch progress');
        nextSteps.push(`Re-check: npm run batch-orchestrator -- monitor ${batchNumber}`);
      }

      return {
        success: true,
        batchNumber,
        action: 'monitor',
        summary: {
          status: progress.status,
          percentComplete: progress.progress.percentComplete,
          performanceHealth: progress.performance.errorRate < 2 ? 'Good' : 'Needs Attention',
          estimatedCompletion: new Date(Date.now() + progress.performance.estimatedTimeRemaining * 60000)
        },
        recommendations,
        nextSteps
      };

    } catch (error) {
      logger.error(`Failed to monitor batch ${batchNumber}:`, error);
      
      return {
        success: false,
        batchNumber,
        action: 'monitor',
        summary: { error: error.message },
        recommendations: ['Check if batch is properly initialized and started'],
        nextSteps: ['Investigate monitoring system issues']
      };
    }
  }

  async completeBatch(batchNumber: number): Promise<BatchOrchestrationResult> {
    console.log(`🏁 Completing Batch ${batchNumber}`);
    console.log('=' .repeat(60));

    try {
      // Complete batch progress tracking
      console.log('\n1️⃣  Finalizing batch import...');
      const batchSummary = await batchProgressTracker.completeBatch(batchNumber);
      
      console.log('\n2️⃣  Running comprehensive performance tests...');
      const perfTestSuite = new PerformanceTestSuite(this.baseUrl, batchNumber);
      const perfResults = await perfTestSuite.runAllTests();
      
      console.log('\n3️⃣  Running mobile validation tests...');
      const mobileTestSuite = new MobileValidationSuite(this.baseUrl, batchNumber);
      const mobileResults = await mobileTestSuite.runMobileTests();
      
      console.log('\n4️⃣  Running post-batch gate checks...');
      const postGateResults = await runPostBatchGateCheck(batchNumber);

      // Compile comprehensive report
      const completionReport = {
        batchNumber,
        completedAt: new Date(),
        batchSummary,
        performanceTestResults: perfResults,
        mobileValidationResults: mobileResults,
        postBatchGateResults: postGateResults,
        overallSuccess: batchSummary.progress.status === 'completed' && 
                       perfResults.overallPass && 
                       mobileResults.overallPass && 
                       postGateResults.readyForNextBatch
      };

      // Save comprehensive report
      const reportPath = this.saveReport(`batch-${batchNumber}-completion`, completionReport);

      // Generate recommendations and next steps
      const recommendations = this.generateCompletionRecommendations(completionReport);
      const nextSteps = this.generateNextSteps(completionReport);

      // Display results summary
      console.log('\n📊 BATCH COMPLETION SUMMARY');
      console.log('=' .repeat(50));
      console.log(`Overall Success: ${completionReport.overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Companies Processed: ${batchSummary.progress.progress.companiesProcessed}`);
      console.log(`Contacts Processed: ${batchSummary.progress.progress.contactsProcessed}`);
      console.log(`Performance Tests: ${perfResults.overallPass ? '✅ PASS' : '❌ FAIL'} (${perfResults.summary.passedTests}/${perfResults.summary.totalTests})`);
      console.log(`Mobile Validation: ${mobileResults.overallPass ? '✅ PASS' : '❌ FAIL'} (Score: ${mobileResults.mobileScore}/100)`);
      console.log(`Ready for Next Batch: ${postGateResults.readyForNextBatch ? '✅ YES' : '❌ NO'}`);
      
      if (recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        recommendations.forEach(rec => console.log(`  • ${rec}`));
      }

      if (nextSteps.length > 0) {
        console.log('\n🎯 Next Steps:');
        nextSteps.forEach(step => console.log(`  • ${step}`));
      }

      console.log(`\n📄 Full report saved: ${reportPath}`);

      return {
        success: completionReport.overallSuccess,
        batchNumber,
        action: 'complete',
        summary: {
          companiesProcessed: batchSummary.progress.progress.companiesProcessed,
          contactsProcessed: batchSummary.progress.progress.contactsProcessed,
          performanceScore: (perfResults.summary.passedTests / perfResults.summary.totalTests) * 100,
          mobileScore: mobileResults.mobileScore,
          readyForNextBatch: postGateResults.readyForNextBatch
        },
        reportPath,
        recommendations,
        nextSteps
      };

    } catch (error) {
      logger.error(`Failed to complete batch ${batchNumber}:`, error);
      
      return {
        success: false,
        batchNumber,
        action: 'complete',
        summary: { error: error.message },
        recommendations: ['Investigate completion errors', 'Check system integrity'],
        nextSteps: ['Fix errors and retry batch completion']
      };
    }
  }

  private generateCompletionRecommendations(report: any): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (!report.performanceTestResults.overallPass) {
      recommendations.push('Address performance test failures before next batch');
      report.performanceTestResults.tests
        .filter((t: any) => !t.passed)
        .slice(0, 3)
        .forEach((test: any) => {
          recommendations.push(`Fix: ${test.name} (${test.value}${test.unit} > ${test.threshold}${test.unit})`);
        });
    }

    // Mobile recommendations
    if (report.mobileValidationResults.mobileScore < 85) {
      recommendations.push('Improve mobile experience before next batch');
      const failedMobileTests = report.mobileValidationResults.tests.filter((t: any) => !t.passed);
      if (failedMobileTests.length > 0) {
        recommendations.push(`Priority: ${failedMobileTests[0].name}`);
      }
    }

    // Gate-based recommendations
    if (!report.postBatchGateResults.readyForNextBatch) {
      recommendations.push('Critical: Address performance gates before proceeding');
      report.postBatchGateResults.criticalFailures.forEach((failure: any) => {
        if (failure.suggestions && failure.suggestions[0]) {
          recommendations.push(`${failure.name}: ${failure.suggestions[0]}`);
        }
      });
    }

    // Batch-specific recommendations
    const batchRecommendations = report.batchSummary.recommendations;
    if (batchRecommendations.optimizationsToImplement.length > 0) {
      recommendations.push(...batchRecommendations.optimizationsToImplement.slice(0, 2));
    }

    return recommendations;
  }

  private generateNextSteps(report: any): string[] {
    const nextSteps: string[] = [];

    if (report.overallSuccess) {
      const nextBatchNum = report.batchNumber + 1;
      const recommendedSize = report.batchSummary.recommendations.nextBatchSize;
      
      nextSteps.push(`Initialize Batch ${nextBatchNum}: npm run batch-orchestrator -- init ${nextBatchNum} ${recommendedSize} ${Math.floor(recommendedSize * 2.5)}`);
      nextSteps.push('Review and implement optimization recommendations');
      nextSteps.push('Prepare data for next batch import');
      nextSteps.push(`Monitor system: ${report.postBatchGateResults.readyForNextBatch ? 'Ready' : 'Wait for fixes'}`);
    } else {
      nextSteps.push('Do not proceed to next batch until all issues are resolved');
      nextSteps.push('Address critical performance failures');
      nextSteps.push('Re-run completion validation after fixes');
      nextSteps.push('Consider reducing next batch size if issues persist');
    }

    return nextSteps;
  }

  private saveReport(fileName: string, data: any): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = join(this.reportsDir, `${fileName}-${timestamp}.json`);
    
    writeFileSync(reportPath, JSON.stringify(data, null, 2));
    logger.info(`Report saved: ${reportPath}`);
    
    return reportPath;
  }
}

// CLI Implementation
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
DealMecca Batch Orchestrator

Usage:
  npm run batch-orchestrator -- init <batchNumber> <companies> <contacts>
  npm run batch-orchestrator -- start <batchNumber>
  npm run batch-orchestrator -- monitor <batchNumber>
  npm run batch-orchestrator -- complete <batchNumber>

Examples:
  npm run batch-orchestrator -- init 2 150 300
  npm run batch-orchestrator -- start 2
  npm run batch-orchestrator -- monitor 2
  npm run batch-orchestrator -- complete 2
`);
    process.exit(1);
  }

  const command = args[0];
  const orchestrator = new BatchOrchestrator();

  try {
    let result: BatchOrchestrationResult;

    switch (command) {
      case 'init':
        if (args.length < 4) {
          console.error('Usage: init <batchNumber> <companies> <contacts>');
          process.exit(1);
        }
        result = await orchestrator.initializeBatch(
          parseInt(args[1]),
          parseInt(args[2]),
          parseInt(args[3])
        );
        break;

      case 'start':
        if (args.length < 2) {
          console.error('Usage: start <batchNumber>');
          process.exit(1);
        }
        result = await orchestrator.startBatch(parseInt(args[1]));
        break;

      case 'monitor':
        if (args.length < 2) {
          console.error('Usage: monitor <batchNumber>');
          process.exit(1);
        }
        result = await orchestrator.monitorBatch(parseInt(args[1]));
        break;

      case 'complete':
        if (args.length < 2) {
          console.error('Usage: complete <batchNumber>');
          process.exit(1);
        }
        result = await orchestrator.completeBatch(parseInt(args[1]));
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Valid commands: init, start, monitor, complete');
        process.exit(1);
    }

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);

  } catch (error) {
    console.error(`❌ Command failed:`, error.message);
    logger.error('Orchestrator command failed:', error);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { BatchOrchestrator };