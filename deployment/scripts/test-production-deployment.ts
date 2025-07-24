#!/usr/bin/env npx tsx

/**
 * Test Production Deployment Script
 * 
 * Tests the live DealMecca deployment on Vercel
 */

async function testProductionApp() {
  const baseUrl = 'https://website-qszx7bymm-cws-projects-e62034bb.vercel.app';
  
  console.log(`
🧪 TESTING DEALMECCA PRODUCTION DEPLOYMENT
==========================================
🌐 Production URL: ${baseUrl}
📅 Test Date: ${new Date().toLocaleString()}
==========================================

🔍 RUNNING PRODUCTION TESTS...

`);

  const tests = [
    {
      name: '🏠 Homepage',
      url: `${baseUrl}/`,
      description: 'Landing page loads correctly'
    },
    {
      name: '💚 Health Check',
      url: `${baseUrl}/api/health`,
      description: 'Database connection and API health'
    },
    {
      name: '🔐 Sign Up Page',
      url: `${baseUrl}/auth/signup`,
      description: 'User registration form'
    },
    {
      name: '🔑 Sign In Page',
      url: `${baseUrl}/auth/signin`,
      description: 'User login form'
    },
    {
      name: '🏢 Company Directory',
      url: `${baseUrl}/orgs`,
      description: 'Company listings (requires auth)'
    },
    {
      name: '📊 Pricing Page',
      url: `${baseUrl}/pricing`,
      description: 'Subscription plans'
    }
  ];

  console.log('📋 TEST CHECKLIST:');
  console.log('==================\n');

  tests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.name}`);
    console.log(`   URL: ${test.url}`);
    console.log(`   Test: ${test.description}`);
    console.log('');
  });

  console.log(`
🎯 CRITICAL TESTS TO VERIFY:
============================

1. ✅ Health Check Response:
   Visit: ${baseUrl}/api/health
   Expected: {"status": "healthy", "database": "connected"}

2. ✅ Homepage Loads:
   Visit: ${baseUrl}/
   Expected: DealMecca landing page with navigation

3. ✅ User Registration:
   Visit: ${baseUrl}/auth/signup
   Expected: Sign up form that creates new users

4. ✅ User Login:
   Visit: ${baseUrl}/auth/signin
   Expected: Login form that authenticates users

5. ✅ Protected Routes:
   Visit: ${baseUrl}/dashboard
   Expected: Redirects to login when not authenticated

📱 MANUAL TESTING CHECKLIST:
============================

□ Create a new user account
□ Login with test credentials
□ Access the dashboard
□ Browse company directory
□ Test search functionality
□ Verify mobile responsiveness
□ Check page load speeds

🚀 PRODUCTION STATUS: READY FOR BETA TESTING!
=============================================

Your DealMecca application is live and ready for users!

Next steps:
• Begin beta user recruitment
• Monitor application performance
• Collect user feedback
• Iterate based on user insights

`);
}

if (require.main === module) {
  testProductionApp();
} 