/**
 * LinkedIn Firebase Configuration Validator
 * 
 * Run this script to check if your LinkedIn OAuth configuration is ready
 * Usage: node validate-linkedin-config.js
 */

console.log('🔗 LinkedIn Firebase Configuration Validator');
console.log('=============================================\n');

// Check environment variables
console.log('1. Environment Variables Check:');
const linkedInClientId = process.env.LINKEDIN_CLIENT_ID;
const linkedInClientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const jwtSecret = process.env.JWT_SECRET;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

console.log(`   LinkedIn Client ID: ${linkedInClientId ? '✅ Set' : '❌ Missing'}`);
console.log(`   LinkedIn Client Secret: ${linkedInClientSecret ? '✅ Set' : '❌ Missing'}`);
console.log(`   JWT Secret: ${jwtSecret ? '✅ Set' : '❌ Missing'}`);
console.log(`   Firebase Project ID: ${firebaseProjectId || '❌ Missing'}`);

console.log('\n2. LinkedIn App Configuration Required:');
console.log('   📍 LinkedIn Developer Portal: https://developer.linkedin.com/');
console.log(`   📍 Your App Client ID: ${linkedInClientId || 'NOT_SET'}`);
console.log('\n   Required Redirect URIs in LinkedIn App:');
console.log(`   • Development: http://localhost:3001/__/auth/handler`);
if (firebaseProjectId) {
  console.log(`   • Production: https://${firebaseProjectId}.firebaseapp.com/__/auth/handler`);
} else {
  console.log(`   • Production: https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`);
}

console.log('\n   Required LinkedIn App Permissions:');
console.log('   ✅ Sign In with LinkedIn using OpenID Connect');
console.log('   ✅ Share on LinkedIn (optional)');

console.log('\n3. Firebase Console Configuration Needed:');
console.log('   📍 Firebase Console: https://console.firebase.google.com/');
console.log(`   📍 Your Project: ${firebaseProjectId || 'YOUR_PROJECT_ID'}`);
console.log('   📍 Path: Authentication → Sign-in method → Add new provider');
console.log('\n   OpenID Connect Provider Settings:');
console.log('   • Provider name: linkedin');
console.log(`   • Client ID: ${linkedInClientId || 'YOUR_LINKEDIN_CLIENT_ID'}`);
console.log(`   • Client secret: ${linkedInClientSecret || 'YOUR_LINKEDIN_CLIENT_SECRET'}`);
console.log('   • Issuer URL: https://www.linkedin.com/oauth');

console.log('\n4. Expected Code Behavior:');
console.log('   • Provider ID in code: "oidc.linkedin"');
console.log('   • Scopes requested: ["openid", "profile", "email"]');
console.log('   • This should match Firebase Console configuration');

console.log('\n5. Testing Instructions:');
console.log('   1. Complete Firebase Console setup above');
console.log('   2. Verify LinkedIn app redirect URIs');
console.log('   3. Test at: http://localhost:3001/auth/firebase-signin');
console.log('   4. Check browser console for detailed error messages');

// Configuration summary
console.log('\n📋 Configuration Summary:');
const configReady = linkedInClientId && linkedInClientSecret && jwtSecret && firebaseProjectId;
console.log(`   Environment Setup: ${configReady ? '✅ Complete' : '❌ Incomplete'}`);
console.log(`   Firebase Console Setup: ❓ Manual step required`);
console.log(`   LinkedIn App Setup: ❓ Manual verification required`);

if (!configReady) {
  console.log('\n❌ Issues Found:');
  if (!linkedInClientId) console.log('   • LINKEDIN_CLIENT_ID missing from .env.local');
  if (!linkedInClientSecret) console.log('   • LINKEDIN_CLIENT_SECRET missing from .env.local');
  if (!jwtSecret) console.log('   • JWT_SECRET missing from .env.local');
  if (!firebaseProjectId) console.log('   • NEXT_PUBLIC_FIREBASE_PROJECT_ID missing from .env.local');
}

console.log('\n🚀 Next Steps:');
console.log('1. Fix any missing environment variables');
console.log('2. Configure OpenID Connect provider in Firebase Console');
console.log('3. Verify LinkedIn app redirect URIs');
console.log('4. Test LinkedIn authentication');

console.log('\n💡 Tip: The auth/internal-error usually means Firebase Console');
console.log('   configuration is missing or incorrect.');