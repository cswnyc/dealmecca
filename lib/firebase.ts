// Firebase configuration and initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  signInAnonymously,
  linkWithPopup,
} from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase config - these will be set via environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Initialize Firebase (singleton pattern)
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.warn('Firebase initialization failed, using demo mode:', error);
  app = null;
}

// Initialize Firebase Authentication
export const auth = app ? getAuth(app) : null;

// Initialize Analytics only in browser and if supported
export const initializeAnalytics = async () => {
  if (typeof window !== 'undefined' && app) {
    try {
      const supported = await isSupported();
      if (supported) {
        return getAnalytics(app);
      }
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  }
  return null;
};

// Connect to Auth Emulator in development (disabled for production Firebase)
// Uncomment the code below if you want to use Firebase emulator
/*
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    // Only connect if not already connected
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
  } catch (error) {
    // Emulator might already be connected, ignore error
    console.log('Firebase Auth Emulator connection info:', error);
  }
}
*/

// Anonymous authentication functions
export const signInUserAnonymously = async () => {
  if (!auth) throw new Error('Firebase auth not initialized');
  return await signInAnonymously(auth);
};

export const linkAnonymousToLinkedIn = async (user: any) => {
  if (!auth) throw new Error('Firebase auth not initialized');
  const provider = new OAuthProvider('linkedin.com');
  provider.addScope('profile');
  provider.addScope('email');
  return await linkWithPopup(user, provider);
};

// LinkedIn OAuth provider setup
export const createLinkedInProvider = () => {
  const provider = new OAuthProvider('linkedin.com');
  provider.addScope('profile');
  provider.addScope('email');
  return provider;
};

// Export auth functions for direct use
export {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  signInAnonymously,
  linkWithPopup
};

// User type temporarily removed to fix import issues

export { app };
export default app;