#!/usr/bin/env npx tsx

/**
 * Quick Production Health Check
 * 
 * Rapid status check for DealMecca production monitoring
 */

const PRODUCTION_URL = 'https://website-gjgyoiava-cws-projects-e62034bb.vercel.app';

async function quickHealthCheck() {
  console.log(`⚡ QUICK HEALTH CHECK`);
  console.log(`===================`);
  console.log(`🌐 URL: ${PRODUCTION_URL}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}\n`);

  const checks = [
    { name: 'Health API', url: '/api/health', critical: true },
    { name: 'Home Page', url: '/', critical: true },
    { name: 'Auth Pages', url: '/auth/signin', critical: true },
    { name: 'Search Page', url: '/search', critical: false },
    { name: 'Organizations', url: '/orgs/companies', critical: false }
  ];

  let criticalFailures = 0;
  let totalChecks = 0;

  for (const check of checks) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${PRODUCTION_URL}${check.url}`);
      const duration = Date.now() - startTime;
      
      const status = response.ok || response.url.includes('/auth/signin') ? 'PASS' : 'FAIL';
      const icon = status === 'PASS' ? '✅' : (check.critical ? '🚨' : '⚠️');
      
      console.log(`${icon} ${check.name}: ${status} (${response.status}, ${duration}ms)`);
      
      if (status === 'FAIL' && check.critical) {
        criticalFailures++;
      }
      
      totalChecks++;
      
    } catch (error: any) {
      const icon = check.critical ? '🚨' : '⚠️';
      console.log(`${icon} ${check.name}: ERROR (${error.message})`);
      
      if (check.critical) {
        criticalFailures++;
      }
      
      totalChecks++;
    }
  }

  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total Checks: ${totalChecks}`);
  console.log(`   Critical Failures: ${criticalFailures}`);
  
  const overallStatus = criticalFailures === 0 ? '✅ HEALTHY' : 
                       criticalFailures <= 1 ? '⚠️ DEGRADED' : '🚨 CRITICAL';
  
  console.log(`   Overall Status: ${overallStatus}`);

  if (criticalFailures > 0) {
    console.log(`\n🔧 NEXT STEPS:`);
    console.log(`   1. Check Vercel dashboard for deployment status`);
    console.log(`   2. Run full monitoring: npx tsx deployment/scripts/monitor-production-logs.ts`);
    console.log(`   3. Check database: npx tsx deployment/scripts/verify-database-state.ts`);
  } else {
    console.log(`\n🎉 All systems operational!`);
  }

  return { criticalFailures, totalChecks, overallStatus };
}

quickHealthCheck().catch(console.error); 