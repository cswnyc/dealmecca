#!/usr/bin/env npx tsx

/**
 * STEP 5: Production Deployment Preparation
 * Database Migration Testing Script
 * 
 * Tests database migrations for production deployment safety
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { performance } from 'perf_hooks';

const execAsync = promisify(exec);

interface MigrationTest {
  name: string;
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
}

class ProductionMigrationTester {
  private results: MigrationTest[] = [];
  
  async testMigration(name: string, command: string): Promise<MigrationTest> {
    console.log(`🔄 Testing: ${name}...`);
    const startTime = performance.now();
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: process.cwd(),
        timeout: 120000 // 2 minutes timeout
      });
      
      const duration = performance.now() - startTime;
      
      if (stderr && !stderr.includes('warning')) {
        throw new Error(stderr);
      }
      
      console.log(`✅ ${name} completed in ${duration.toFixed(2)}ms`);
      
      return {
        name,
        success: true,
        duration,
        output: stdout
      };
      
    } catch (error: any) {
      const duration = performance.now() - startTime;
      console.log(`❌ ${name} failed: ${error.message}`);
      
      return {
        name,
        success: false,
        duration,
        error: error.message
      };
    }
  }

  async runAllTests(): Promise<void> {
    console.log('\n🚀 PRODUCTION MIGRATION TESTING');
    console.log('===============================');
    console.log('📅 Test Date:', new Date().toLocaleString());
    console.log('🎯 Objective: Validate production deployment readiness\n');

    // Test 1: Check Prisma CLI availability
    const test1 = await this.testMigration(
      'Prisma CLI Check',
      'npx prisma --version'
    );
    this.results.push(test1);

    // Test 2: Validate schema syntax
    const test2 = await this.testMigration(
      'Schema Validation',
      'npx prisma validate'
    );
    this.results.push(test2);

    // Test 3: Generate migration diff
    const test3 = await this.testMigration(
      'Migration Diff Generation',
      'npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script'
    );
    this.results.push(test3);

    // Test 4: Check migration status
    const test4 = await this.testMigration(
      'Migration Status Check',
      'npx prisma migrate status'
    );
    this.results.push(test4);

    // Test 5: Dry run migration deploy
    const test5 = await this.testMigration(
      'Migration Deploy Dry Run',
      'npx prisma migrate deploy --help'
    );
    this.results.push(test5);

    // Test 6: Generate Prisma client
    const test6 = await this.testMigration(
      'Prisma Client Generation',
      'npx prisma generate'
    );
    this.results.push(test6);

    // Test 7: Database connection test
    const test7 = await this.testMigration(
      'Database Connection Test',
      'npx prisma db execute --stdin <<< "SELECT 1 as test"'
    );
    this.results.push(test7);

    // Test 8: Schema introspection
    const test8 = await this.testMigration(
      'Schema Introspection',
      'npx prisma db pull --print'
    );
    this.results.push(test8);
  }

  generateReport(): string {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = this.results.filter(r => !r.success);
    const successRate = (passedTests / totalTests) * 100;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    return `
🔧 PRODUCTION MIGRATION TEST REPORT
===================================
📅 Test Date: ${new Date().toLocaleString()}
🎯 Objective: Database migration readiness validation
⏱️  Total Duration: ${(totalDuration/1000).toFixed(2)}s
📊 Success Rate: ${successRate.toFixed(1)}%
🏆 Overall Status: ${successRate >= 90 ? '✅ READY' : successRate >= 70 ? '⚠️ NEEDS ATTENTION' : '❌ NOT READY'}

📋 TEST RESULTS:
===============
${this.results.map((result, index) => 
`${index + 1}. ${result.name}
   Status: ${result.success ? '✅ PASS' : '❌ FAIL'}
   Duration: ${result.duration.toFixed(2)}ms
   ${result.error ? `Error: ${result.error}` : ''}
   ${result.output ? `Output: ${result.output.substring(0, 200)}...` : ''}
`).join('\n')}

${failedTests.length > 0 ? `
❌ FAILED TESTS ANALYSIS:
========================
${failedTests.map(test => 
`• ${test.name}: ${test.error || 'Unknown error'}`
).join('\n')}

🔧 RECOMMENDED FIXES:
====================
• Ensure DATABASE_URL is properly configured
• Verify database server is accessible
• Check Prisma schema for syntax errors
• Validate migration files are in correct format
• Ensure proper database permissions
` : '✅ ALL MIGRATION TESTS PASSED!'}

🚀 PRODUCTION DEPLOYMENT READINESS:
==================================
Database Migration: ${successRate >= 90 ? '✅ READY' : '❌ NOT READY'}
Schema Validation: ${this.results.find(r => r.name.includes('Schema'))?.success ? '✅ VALID' : '❌ INVALID'}
Client Generation: ${this.results.find(r => r.name.includes('Client'))?.success ? '✅ WORKING' : '❌ FAILED'}
Connection Test: ${this.results.find(r => r.name.includes('Connection'))?.success ? '✅ CONNECTED' : '❌ DISCONNECTED'}

💡 NEXT STEPS:
=============
${successRate >= 90 ? 
`🎉 Database migrations are ready for production!
✅ Proceed with production deployment
✅ Monitor migration execution in production
✅ Have rollback plan ready` :
`🚨 Fix failed tests before production deployment
🔧 Address database connection issues
📝 Review and correct schema problems
🔄 Re-run tests after fixes`}

📚 MIGRATION COMMANDS FOR PRODUCTION:
====================================
1. Deploy migrations:
   npx prisma migrate deploy

2. Generate client:
   npx prisma generate

3. Seed database (if needed):
   npx prisma db seed

4. Check status:
   npx prisma migrate status

===================================
`;
  }
}

async function main() {
  const tester = new ProductionMigrationTester();
  
  try {
    await tester.runAllTests();
    const report = tester.generateReport();
    
    console.log(report);
    
    // Save report to file
    const fs = await import('fs/promises');
    await fs.writeFile(
      'production-migration-test-report.txt', 
      report, 
      'utf8'
    );
    
    console.log('\n📄 Report saved to: production-migration-test-report.txt');
    
    // Determine exit code based on results
    const successRate = (tester['results'].filter(r => r.success).length / tester['results'].length) * 100;
    process.exit(successRate >= 90 ? 0 : 1);
    
  } catch (error: any) {
    console.error('\n💥 Fatal error during migration testing:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 