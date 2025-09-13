/**
 * LinkedIn Firebase Auth Test Script
 * Run this to verify your Firebase configuration
 */

const { initializeApp, getApps } = require('firebase/app');
const { getAuth, OAuthProvider } = require('firebase/auth');

// Firebase config from environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

console.log('🔥 Firebase Configuration Test');
console.log('================================');

// Check Firebase config
console.log('\n1. Firebase Config:');
console.log('   Project ID:', firebaseConfig.projectId);
console.log('   Auth Domain:', firebaseConfig.authDomain);
console.log('   API Key:', firebaseConfig.apiKey ? '✅ Set' : '❌ Missing');

// Test LinkedIn provider creation
console.log('\n2. LinkedIn Provider Test:');
try {
  const provider = new OAuthProvider('oidc.linkedin');
  provider.addScope('openid');
  provider.addScope('profile');
  provider.addScope('email');
  
  console.log('   Provider ID:', provider.providerId);
  console.log('   Scopes:', provider.scopes);
  console.log('   ✅ LinkedIn provider created successfully');
} catch (error) {
  console.log('   ❌ LinkedIn provider creation failed:', error.message);
}

// Environment variables check
console.log('\n3. Environment Variables:');
console.log('   LinkedIn Client ID:', process.env.LINKEDIN_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('   LinkedIn Client Secret:', process.env.LINKEDIN_CLIENT_SECRET ? '✅ Set' : '❌ Missing');

console.log('\n4. Expected Firebase Console Setup:');
console.log('   Provider Type: OpenID Connect');
console.log('   Provider Name: linkedin');
console.log('   Provider ID: oidc.linkedin');
console.log('   Client ID:', process.env.LINKEDIN_CLIENT_ID || 'MISSING');
console.log('   Issuer URL: https://www.linkedin.com/oauth');

console.log('\n5. Required Redirect URIs in LinkedIn App:');
console.log('   Development:', `http://localhost:3001/__/auth/handler`);
console.log('   Production:', `https://${firebaseConfig.projectId}.firebaseapp.com/__/auth/handler`);

console.log('\n🚀 Next Steps:');
console.log('1. Go to Firebase Console → Authentication → Sign-in method');
console.log('2. Add OpenID Connect provider with the configuration shown above');
console.log('3. Add redirect URIs to your LinkedIn Developer app');
console.log('4. Test sign-in at: http://localhost:3001/auth/firebase-signin');