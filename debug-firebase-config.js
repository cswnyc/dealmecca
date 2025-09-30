/**
 * Runtime Firebase Configuration Checker
 * Run this to verify your Firebase config at runtime
 */

console.log('🔥 Firebase Runtime Configuration Check');
console.log('=======================================');

// Environment variables (server-side available)
console.log('\n1. Environment Variables:');
console.log('   API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('   Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('   Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('   Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

// Verify project alignment
console.log('\n2. Project Verification:');
const expectedProjectId = 'dealmecca-6cea8';
const actualProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
console.log('   Expected Project ID:', expectedProjectId);
console.log('   Actual Project ID:', actualProjectId);
console.log('   Match:', actualProjectId === expectedProjectId ? '✅ Yes' : '❌ No');

const expectedAuthDomain = 'dealmecca-6cea8.firebaseapp.com';
const actualAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
console.log('   Expected Auth Domain:', expectedAuthDomain);
console.log('   Actual Auth Domain:', actualAuthDomain);
console.log('   Match:', actualAuthDomain === expectedAuthDomain ? '✅ Yes' : '❌ No');

// LinkedIn configuration
console.log('\n3. LinkedIn OAuth Configuration:');
console.log('   Client ID:', process.env.LINKEDIN_CLIENT_ID);
console.log('   Public Client ID:', process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID);
console.log('   Client Secret:', process.env.LINKEDIN_CLIENT_SECRET ? '✅ Set' : '❌ Missing');

console.log('\n4. Expected Firebase Console Configuration:');
console.log('   Provider Type: OpenID Connect (OIDC)');
console.log('   Provider Name: linkedin');
console.log('   Provider ID: oidc.linkedin');
console.log('   Client ID:', process.env.LINKEDIN_CLIENT_ID);
console.log('   Issuer URL: https://www.linkedin.com/oauth');

console.log('\n5. Redirect URIs for LinkedIn App:');
console.log('   Development:', `http://localhost:3000/__/auth/handler`);
console.log('   Production:', `https://${actualProjectId}.firebaseapp.com/__/auth/handler`);

console.log('\n✅ Configuration check complete!');