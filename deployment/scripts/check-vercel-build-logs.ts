#!/usr/bin/env npx tsx

/**
 * VERCEL BUILD VERIFICATION
 * 
 * Check for build issues and verify file deployment
 */

import { promises as fs } from 'fs';
import { join } from 'path';

const PROD_URL = 'https://website-gjgyoiava-cws-projects-e62034bb.vercel.app';

// Critical files that should be deployed
const CRITICAL_FILES = [
  'package.json',
  'next.config.mjs',
  'middleware.ts',
  'app/layout.tsx',
  'app/page.tsx',
  'app/auth/signin/page.tsx',
  'app/dashboard/page.tsx',
  'app/admin/page.tsx',
  'app/events/page.tsx',
  'app/forum/page.tsx',
  'app/orgs/page.tsx',
  'lib/auth.ts',
  'lib/prisma.ts',
  'prisma/schema.prisma'
];

// API routes that should be deployed
const API_ROUTES = [
  'app/api/health/route.ts',
  'app/api/auth/[...nextauth]/route.ts',
  'app/api/orgs/companies/route.ts',
  'app/api/events/route.ts',
  'app/api/forum/posts/route.ts',
  'app/api/admin/companies/route.ts'
];

async function checkVercelBuildStatus() {
  console.log('🔍 VERCEL BUILD & DEPLOYMENT VERIFICATION');
  console.log('=========================================');
  console.log(`📅 Time: ${new Date().toLocaleString()}\n`);

  // Check local files exist
  console.log('📂 CHECKING LOCAL FILES');
  console.log('=======================');
  
  const missingFiles = [];
  const presentFiles = [];

  for (const file of [...CRITICAL_FILES, ...API_ROUTES]) {
    try {
      await fs.access(file);
      presentFiles.push(file);
      console.log(`✅ ${file}`);
    } catch (error) {
      missingFiles.push(file);
      console.log(`❌ ${file} - NOT FOUND`);
    }
  }

  console.log('\n🌐 TESTING DEPLOYMENT STATUS');
  console.log('============================');

  // Test if routes respond in production
  const deploymentTests = [];

  // Test page routes
  const pageRoutes = [
    '/',
    '/auth/signin',
    '/dashboard',
    '/events',
    '/forum',
    '/orgs',
    '/admin'
  ];

  for (const route of pageRoutes) {
    try {
      const response = await fetch(`${PROD_URL}${route}`, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Build-Verification/1.0' }
      });
      
      deploymentTests.push({
        type: 'page',
        path: route,
        status: response.status,
        deployed: response.status < 500
      });
    } catch (error) {
      deploymentTests.push({
        type: 'page',
        path: route,
        status: 'error',
        deployed: false
      });
    }
  }

  // Test API routes
  const apiRoutes = [
    '/api/health',
    '/api/auth/providers',
    '/api/forum/posts',
    '/api/orgs/companies'
  ];

  for (const route of apiRoutes) {
    try {
      const response = await fetch(`${PROD_URL}${route}`, {
        method: 'HEAD',
        headers: { 'User-Agent': 'Build-Verification/1.0' }
      });
      
      deploymentTests.push({
        type: 'api',
        path: route,
        status: response.status,
        deployed: response.status < 500
      });
    } catch (error) {
      deploymentTests.push({
        type: 'api',
        path: route,
        status: 'error',
        deployed: false
      });
    }
  }

  // Display deployment test results
  const deployedPages = deploymentTests.filter(t => t.type === 'page' && t.deployed);
  const deployedAPIs = deploymentTests.filter(t => t.type === 'api' && t.deployed);
  
  console.log(`✅ Pages Deployed: ${deployedPages.length}/${pageRoutes.length}`);
  deployedPages.forEach(test => {
    console.log(`   • ${test.path}: ${test.status}`);
  });

  console.log(`\n✅ APIs Deployed: ${deployedAPIs.length}/${apiRoutes.length}`);
  deployedAPIs.forEach(test => {
    console.log(`   • ${test.path}: ${test.status}`);
  });

  // Check for common build issues
  console.log('\n🔧 COMMON BUILD ISSUE CHECKS');
  console.log('============================');

  const buildIssues = [];

  // Check for TypeScript issues
  try {
    const tsConfig = await fs.readFile('tsconfig.json', 'utf8');
    console.log('✅ TypeScript config present');
  } catch (error) {
    buildIssues.push('Missing tsconfig.json');
    console.log('❌ TypeScript config missing');
  }

  // Check for Next.js config
  try {
    const nextConfig = await fs.readFile('next.config.mjs', 'utf8');
    console.log('✅ Next.js config present');
  } catch (error) {
    buildIssues.push('Missing next.config.mjs');
    console.log('❌ Next.js config missing');
  }

  // Check for environment variables
  try {
    const envFile = await fs.readFile('.env.local', 'utf8');
    console.log('✅ Environment file present');
  } catch (error) {
    console.log('⚠️  .env.local not found (may use Vercel env vars)');
  }

  // Check package.json scripts
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    const hasValidScripts = packageJson.scripts?.build && packageJson.scripts?.start;
    if (hasValidScripts) {
      console.log('✅ Build scripts configured');
    } else {
      buildIssues.push('Missing or invalid build scripts');
      console.log('❌ Build scripts missing');
    }
  } catch (error) {
    buildIssues.push('Cannot read package.json');
    console.log('❌ Package.json issue');
  }

  // Test component rendering capability
  console.log('\n🎨 COMPONENT RENDERING VERIFICATION');
  console.log('===================================');

  const componentTests = [];

  // Test if home page loads without crashing
  try {
    const homeResponse = await fetch(`${PROD_URL}/`);
    const homeContent = await homeResponse.text();
    
    if (homeContent.includes('<html') && homeContent.includes('</html>')) {
      componentTests.push({ component: 'Homepage', status: 'working' });
      console.log('✅ Homepage renders correctly');
    } else {
      componentTests.push({ component: 'Homepage', status: 'error' });
      console.log('❌ Homepage rendering issue');
    }
  } catch (error) {
    componentTests.push({ component: 'Homepage', status: 'error' });
    console.log('❌ Homepage network error');
  }

  // Test if auth page loads
  try {
    const authResponse = await fetch(`${PROD_URL}/auth/signin`);
    const authContent = await authResponse.text();
    
    if (authContent.includes('sign') || authContent.includes('login')) {
      componentTests.push({ component: 'Auth Page', status: 'working' });
      console.log('✅ Auth page renders correctly');
    } else {
      componentTests.push({ component: 'Auth Page', status: 'error' });
      console.log('❌ Auth page rendering issue');
    }
  } catch (error) {
    componentTests.push({ component: 'Auth Page', status: 'error' });
    console.log('❌ Auth page network error');
  }

  // Summary Report
  console.log('\n📊 BUILD VERIFICATION SUMMARY');
  console.log('=============================');
  
  const filesScore = Math.round((presentFiles.length / (CRITICAL_FILES.length + API_ROUTES.length)) * 100);
  const deploymentScore = Math.round(((deployedPages.length + deployedAPIs.length) / (pageRoutes.length + apiRoutes.length)) * 100);
  const componentScore = Math.round((componentTests.filter(t => t.status === 'working').length / componentTests.length) * 100);
  
  console.log(`📂 Local Files: ${presentFiles.length}/${CRITICAL_FILES.length + API_ROUTES.length} (${filesScore}%)`);
  console.log(`🚀 Deployment: ${deployedPages.length + deployedAPIs.length}/${pageRoutes.length + apiRoutes.length} (${deploymentScore}%)`);
  console.log(`🎨 Components: ${componentTests.filter(t => t.status === 'working').length}/${componentTests.length} (${componentScore}%)`);
  console.log(`🔧 Build Issues: ${buildIssues.length}`);

  if (buildIssues.length > 0) {
    console.log('\n⚠️  BUILD ISSUES FOUND:');
    buildIssues.forEach(issue => console.log(`   • ${issue}`));
  }

  // Overall assessment
  const overallScore = Math.round((filesScore + deploymentScore + componentScore) / 3);
  
  console.log(`\n🎯 Overall Build Status: ${overallScore}%`);
  
  if (overallScore >= 90) {
    console.log('✅ EXCELLENT: Build and deployment working perfectly');
  } else if (overallScore >= 75) {
    console.log('⚠️  GOOD: Minor issues but mostly working');
  } else {
    console.log('❌ NEEDS ATTENTION: Significant build or deployment issues');
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('==================');
  
  if (missingFiles.length > 0) {
    console.log('📂 Missing Files:');
    missingFiles.forEach(file => console.log(`   • Check if ${file} is needed`));
  }
  
  if (buildIssues.length > 0) {
    console.log('🔧 Build Issues to Address:');
    buildIssues.forEach(issue => console.log(`   • ${issue}`));
  }
  
  if (overallScore >= 90) {
    console.log('🎉 Your build and deployment are working excellently!');
    console.log('✅ Ready for production use');
  }

  console.log('\n🔍 MANUAL VERIFICATION STEPS');
  console.log('============================');
  console.log('To complete verification:');
  console.log('1. 🌐 Open production site and test user flows');
  console.log('2. 🔑 Test authentication with pro@dealmecca.pro');
  console.log('3. 📊 Verify data loads correctly');
  console.log('4. 🔧 Test admin panel functionality');
  console.log('5. 📱 Check mobile responsiveness');

  return {
    filesScore,
    deploymentScore,
    componentScore,
    overallScore,
    buildIssues: buildIssues.length,
    success: overallScore >= 85
  };
}

if (require.main === module) {
  checkVercelBuildStatus()
    .then((result) => {
      if (result.success) {
        console.log('\n🎉 Build verification successful!');
        process.exit(0);
      } else {
        console.log('\n⚠️  Build verification found issues');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ Build verification error:', error);
      process.exit(1);
    });
}

export { checkVercelBuildStatus }; 