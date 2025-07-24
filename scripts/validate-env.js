#!/usr/bin/env node
/**
 * DealMecca Environment Variables Validation Script
 * 
 * Validates all required environment variables for production deployment
 * Run with: node scripts/validate-env.js
 */

const requiredVars = {
  // Essential variables - must have these for basic functionality
  essential: [
    'DATABASE_URL',
    'NEXTAUTH_SECRET', 
    'NEXTAUTH_URL',
    'NODE_ENV'
  ],
  // Important for full functionality - app works but features missing
  important: [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ],
  // Optional but recommended - nice to have features
  optional: [
    'PUSHER_APP_ID',
    'PUSHER_KEY',
    'PUSHER_SECRET',
    'NEXT_PUBLIC_PUSHER_KEY',
    'STRIPE_PRO_MONTHLY_PRICE_ID',
    'STRIPE_PRO_ANNUAL_PRICE_ID',
    'JWT_SECRET',
    'NEXT_PUBLIC_ENABLE_BETA_FEATURES'
  ]
};

function validateEnvironment() {
  console.log('🔍 DealMecca Environment Variables Validation\n');
  console.log('=' .repeat(50));
  
  let hasErrors = false;
  let hasWarnings = false;
  let essentialCount = 0;
  let importantCount = 0;
  let optionalCount = 0;
  
  // Check essential variables
  console.log('\n⭐ ESSENTIAL VARIABLES (required for basic functionality):');
  console.log('-' .repeat(50));
  requiredVars.essential.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName.padEnd(20)} = ${maskValue(varName, process.env[varName])}`);
      essentialCount++;
    } else {
      console.log(`❌ ${varName.padEnd(20)} = MISSING (CRITICAL - app will not work)`);
      hasErrors = true;
    }
  });
  
  // Check important variables
  console.log('\n🔧 IMPORTANT VARIABLES (needed for full functionality):');
  console.log('-' .repeat(50));
  requiredVars.important.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName.padEnd(20)} = ${maskValue(varName, process.env[varName])}`);
      importantCount++;
    } else {
      console.log(`⚠️  ${varName.padEnd(20)} = Missing (some features won't work)`);
      hasWarnings = true;
    }
  });
  
  // Check optional variables
  console.log('\n💡 OPTIONAL VARIABLES (nice-to-have features):');
  console.log('-' .repeat(50));
  requiredVars.optional.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName.padEnd(25)} = ${maskValue(varName, process.env[varName])}`);
      optionalCount++;
    } else {
      console.log(`⚪ ${varName.padEnd(25)} = Not set (optional)`);
    }
  });
  
  // Validate specific formats and values
  console.log('\n🔍 FORMAT & VALUE VALIDATION:');
  console.log('-' .repeat(50));
  
  // Database URL validation
  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.startsWith('postgresql://')) {
      console.log('✅ DATABASE_URL format valid (postgresql://)');
    } else {
      console.log('❌ DATABASE_URL must start with postgresql://');
      hasErrors = true;
    }
    
    if (process.env.DATABASE_URL.includes('sslmode=require')) {
      console.log('✅ DATABASE_URL includes SSL mode');
    } else {
      console.log('⚠️  DATABASE_URL should include sslmode=require for production');
      hasWarnings = true;
    }
  }
  
  // NextAuth secret validation
  if (process.env.NEXTAUTH_SECRET) {
    if (process.env.NEXTAUTH_SECRET.length >= 32) {
      console.log('✅ NEXTAUTH_SECRET length sufficient (≥32 chars)');
    } else {
      console.log(`❌ NEXTAUTH_SECRET too short (${process.env.NEXTAUTH_SECRET.length} chars, need ≥32)`);
      hasErrors = true;
    }
  }
  
  // NextAuth URL validation
  if (process.env.NEXTAUTH_URL) {
    if (process.env.NEXTAUTH_URL.startsWith('https://')) {
      console.log('✅ NEXTAUTH_URL format valid (https://)');
    } else {
      console.log('❌ NEXTAUTH_URL must start with https:// for production');
      hasErrors = true;
    }
    
    if (process.env.NEXTAUTH_URL.includes('vercel.app') || process.env.NEXTAUTH_URL.includes('localhost')) {
      console.log('✅ NEXTAUTH_URL appears to be valid domain');
    } else {
      console.log('⚠️  NEXTAUTH_URL should match your actual domain');
    }
  }
  
  // Node environment validation
  if (process.env.NODE_ENV) {
    if (process.env.NODE_ENV === 'production') {
      console.log('✅ NODE_ENV set to production');
    } else {
      console.log(`⚠️  NODE_ENV is "${process.env.NODE_ENV}" (should be "production" for prod deployment)`);
    }
  }
  
  // Stripe keys validation
  if (process.env.STRIPE_SECRET_KEY) {
    if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') || process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
      console.log('✅ STRIPE_SECRET_KEY format valid');
    } else {
      console.log('❌ STRIPE_SECRET_KEY should start with sk_test_ or sk_live_');
      hasErrors = true;
    }
  }
  
  // Google OAuth validation
  if (process.env.GOOGLE_CLIENT_ID) {
    if (process.env.GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
      console.log('✅ GOOGLE_CLIENT_ID format valid');
    } else {
      console.log('❌ GOOGLE_CLIENT_ID should end with .apps.googleusercontent.com');
      hasErrors = true;
    }
  }
  
  // Summary and recommendations
  console.log('\n📊 VALIDATION SUMMARY:');
  console.log('=' .repeat(50));
  console.log(`⭐ Essential: ${essentialCount}/${requiredVars.essential.length} configured`);
  console.log(`🔧 Important: ${importantCount}/${requiredVars.important.length} configured`);
  console.log(`💡 Optional:  ${optionalCount}/${requiredVars.optional.length} configured`);
  
  if (hasErrors) {
    console.log('\n❌ CRITICAL ERRORS FOUND');
    console.log('   → Fix these issues before deploying to production');
    console.log('   → Your app will not work properly with these errors');
    console.log('\n🔧 Next steps:');
    console.log('   1. Fix all critical errors above');
    console.log('   2. Add missing essential environment variables');
    console.log('   3. Re-run this validation script');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  WARNINGS DETECTED');
    console.log('   → App will work but some features may be missing');
    console.log('   → Consider adding important variables for full functionality');
    console.log('\n✅ Ready for basic deployment');
    console.log('   → Essential variables are configured');
    console.log('   → Add important variables when ready for full features');
  } else {
    console.log('\n✅ ALL VALIDATION CHECKS PASSED!');
    console.log('   → Your environment is fully configured');
    console.log('   → Ready for production deployment');
    console.log('\n🚀 Deploy with confidence!');
  }
  
  // Deployment readiness check
  console.log('\n🚀 DEPLOYMENT READINESS:');
  console.log('-' .repeat(50));
  
  const readinessChecks = [
    { name: 'Database connection', check: !!process.env.DATABASE_URL },
    { name: 'Authentication secrets', check: !!process.env.NEXTAUTH_SECRET && !!process.env.NEXTAUTH_URL },
    { name: 'Production environment', check: process.env.NODE_ENV === 'production' },
    { name: 'OAuth provider (optional)', check: !!process.env.GOOGLE_CLIENT_ID, optional: true },
    { name: 'Payment processing (optional)', check: !!process.env.STRIPE_SECRET_KEY, optional: true }
  ];
  
  readinessChecks.forEach(check => {
    const status = check.check ? '✅' : (check.optional ? '⚠️ ' : '❌');
    const suffix = check.optional && !check.check ? ' (optional)' : '';
    console.log(`${status} ${check.name}${suffix}`);
  });
  
  return !hasErrors;
}

function maskValue(varName, value) {
  // Mask sensitive values for security
  const sensitivePatterns = ['SECRET', 'KEY', 'PASSWORD', 'TOKEN'];
  const isSensitive = sensitivePatterns.some(pattern => varName.includes(pattern));
  
  if (isSensitive) {
    if (value.length <= 8) {
      return '*'.repeat(value.length);
    }
    return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
  }
  
  // Show full value for non-sensitive vars, but limit length
  return value.length > 50 ? value.substring(0, 47) + '...' : value;
}

// Run validation if this script is executed directly
if (require.main === module) {
  try {
    validateEnvironment();
  } catch (error) {
    console.error('\n❌ Validation script error:', error.message);
    process.exit(1);
  }
}

module.exports = { validateEnvironment }; 