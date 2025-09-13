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
  signOut
} from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase config - these will be set via environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Analytics only in browser and if supported
export const initializeAnalytics = async () => {
  if (typeof window !== 'undefined') {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
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

// Export auth functions for direct use
export {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
};

export { app };
export default app;