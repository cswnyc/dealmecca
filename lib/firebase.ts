'use client';

import { getApps, initializeApp, getApp } from 'firebase/app';
import {
  getAuth,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// IMPORTANT: This must equal the Provider ID in Firebase Console (without "oidc.")
const FIREBASE_OIDC_PROVIDER_ID = 'linkedin';

export function createLinkedInProvider() {
  console.log('🔧 Creating LinkedIn OIDC provider...');

  // Create the most basic OIDC provider possible
  const provider = new OAuthProvider(`oidc.${FIREBASE_OIDC_PROVIDER_ID}`);

  // Add only essential OIDC scopes
  provider.addScope('openid');
  provider.addScope('profile');
  provider.addScope('email');

  console.log('✅ LinkedIn provider created with ID:', `oidc.${FIREBASE_OIDC_PROVIDER_ID}`);
  return provider;
}

export async function signinLinkedInPopup() {
  console.log('🚀 Starting LinkedIn OIDC popup authentication...');

  // Enhanced environment debugging
  console.group('🔍 Firebase Configuration Debug');
  console.table({
    projectId: auth.app.options.projectId,
    authDomain: auth.config.authDomain,
    apiKey: auth.app.options.apiKey?.substring(0, 20) + '...',
    providerIdInCode: `oidc.${FIREBASE_OIDC_PROVIDER_ID}`,
    locationHost: typeof window !== 'undefined' ? window.location.host : 'server',
    locationOrigin: typeof window !== 'undefined' ? window.location.origin : 'server',
  });
  console.log('🔗 Expected Redirect URL:', `https://${auth.config.authDomain}/__/auth/handler`);
  console.log('🌐 Firebase Auth REST URL:', `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${auth.app.options.apiKey}`);
  console.groupEnd();

  const provider = createLinkedInProvider();

  try {
    console.log('🎯 Attempting popup sign-in...');
    const result = await signInWithPopup(auth, provider);
    console.log('✅ LinkedIn popup authentication successful!', {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName
    });
    return result;
  } catch (error: any) {
    console.group('❌ LinkedIn Popup Authentication Error');
    console.error('Error Code:', error?.code || 'No code');
    console.error('Error Message:', error?.message || 'No message');
    console.error('Error Name:', error?.name || 'No name');

    // Specific handling for auth/operation-not-allowed
    if (error?.code === 'auth/operation-not-allowed') {
      console.error('🚨 OPERATION NOT ALLOWED - This means:');
      console.error('   1. LinkedIn OIDC provider is not enabled in Firebase Console');
      console.error('   2. Provider ID mismatch between code and console');
      console.error('   3. Domain not authorized in Firebase Console');
      console.error('   📋 Required Firebase Console Settings:');
      console.error('   • Provider Type: OpenID Connect (OIDC)');
      console.error('   • Provider ID: linkedin (exactly this)');
      console.error('   • Provider Name: LinkedIn');
      console.error('   • Issuer URL: https://www.linkedin.com');
      console.error('   • Client ID: 86de7r9h24e1oe');
      console.error('   • Authorized Domains: localhost, dealmecca-6cea8.firebaseapp.com');
    }

    // Log full error object for debugging
    console.error('Full Error Object:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
      customData: error?.customData,
      keys: Object.keys(error || {}),
      stringified: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    });
    console.groupEnd();

    throw error;
  }
}

export async function signinLinkedInRedirect() {
  console.log('🔄 Starting LinkedIn OIDC redirect authentication...');
  const provider = createLinkedInProvider();

  try {
    await signInWithRedirect(auth, provider);
    console.log('✅ LinkedIn redirect initiated successfully');
  } catch (error: any) {
    console.error('❌ LinkedIn redirect error:', error);
    throw error;
  }
}

export async function signInGooglePopup() {
  const provider = new GoogleAuthProvider();
  console.info('Google popup start');
  try {
    return await signInWithPopup(auth, provider);
  } catch (e: any) {
    console.error('Google popup error:', {
      code: e?.code,
      message: e?.message,
      customData: e?.customData,
    });
    throw e;
  }
}