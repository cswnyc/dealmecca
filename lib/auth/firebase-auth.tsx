'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  OAuthProvider,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Types
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
  isNewUser?: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: (useRedirect?: boolean) => Promise<{ user: AuthUser; isNewUser: boolean } | null>;
  signInWithLinkedIn: (useRedirect?: boolean) => Promise<{ user: AuthUser; isNewUser: boolean } | null>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Convert Firebase user to our AuthUser format
  const convertFirebaseUser = (firebaseUser: FirebaseUser): AuthUser => {
    const providerId = firebaseUser.providerData[0]?.providerId || 'firebase';
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      providerId
    };
  };

  // Handle auth state changes
  useEffect(() => {
    // Handle case where Firebase is not configured
    if (!auth) {
      console.log('🔥 Firebase not configured, using demo mode');
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const authUser = convertFirebaseUser(firebaseUser);
        setUser(authUser);
        console.log('🔥 Firebase Auth: User signed in', authUser);
      } else {
        setUser(null);
        console.log('🔥 Firebase Auth: User signed out');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check for redirect result on mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      // Handle case where Firebase is not configured
      if (!auth) {
        console.log('🔥 Firebase not configured, skipping redirect check');
        return;
      }

      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const authUser = convertFirebaseUser(result.user);
          // Check if this is a new user (you might need additional logic here)
          const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
          
          console.log('🔥 Firebase Auth: Redirect result processed', { authUser, isNewUser });
          
          // Trigger celebration here if needed
          if (typeof window !== 'undefined' && (window as any).triggerAuthCelebration) {
            (window as any).triggerAuthCelebration(authUser, isNewUser);
          }
        }
      } catch (error) {
        console.error('🔥 Firebase Auth: Redirect result error', error);
        handleAuthError(error as AuthError);
      }
    };

    checkRedirectResult();
  }, []);

  // Error handling
  const handleAuthError = (authError: AuthError) => {
    console.error('🔥 Firebase Auth Error:', authError);
    
    let errorMessage = 'Authentication failed. Please try again.';
    
    switch (authError.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in was cancelled. Please try again.';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Pop-up was blocked. Please allow pop-ups and try again.';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Only one sign-in request at a time is allowed.';
        break;
      case 'auth/account-exists-with-different-credential':
        errorMessage = 'An account with this email already exists with a different sign-in method.';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Invalid credentials. Please try again.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'This sign-in method is not enabled. Please contact support.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection and try again.';
        break;
      default:
        errorMessage = `Authentication error: ${authError.message}`;
    }
    
    setError(errorMessage);
  };

  // Google Sign-In
  const signInWithGoogle = async (useRedirect = false) => {
    try {
      setError(null);
      setLoading(true);
      
      // Handle case where Firebase is not configured
      if (!auth) {
        setError('Authentication is not configured. Please contact support.');
        return null;
      }
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      let result: UserCredential;
      
      if (useRedirect) {
        await signInWithRedirect(auth, provider);
        return null; // Result will be handled by redirect effect
      } else {
        result = await signInWithPopup(auth, provider);
      }
      
      const authUser = convertFirebaseUser(result.user);
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      
      console.log('🔥 Google Sign-In Success:', { authUser, isNewUser });
      
      return { user: authUser, isNewUser };
      
    } catch (error) {
      handleAuthError(error as AuthError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // LinkedIn Sign-In
  const signInWithLinkedIn = async (useRedirect = false) => {
    try {
      setError(null);
      setLoading(true);
      
      // Handle case where Firebase is not configured
      if (!auth) {
        setError('Authentication is not configured. Please contact support.');
        return null;
      }
      
      // Create LinkedIn OAuth provider - this should match your Firebase Console configuration
      // The provider ID should be exactly as configured in Firebase Console (e.g., 'oidc.linkedin')
      const provider = new OAuthProvider('oidc.linkedin');
      
      // Add required scopes for LinkedIn OpenID Connect
      provider.addScope('openid');
      provider.addScope('profile'); 
      provider.addScope('email');
      
      // Set custom parameters if needed
      provider.setCustomParameters({
        // This ensures we get the proper LinkedIn sign-in flow
        'prompt': 'select_account'
      });
      
      let result: UserCredential;
      
      if (useRedirect) {
        await signInWithRedirect(auth, provider);
        return null; // Result will be handled by redirect effect
      } else {
        result = await signInWithPopup(auth, provider);
      }
      
      const authUser = convertFirebaseUser(result.user);
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      
      console.log('🔥 LinkedIn Sign-In Success:', { authUser, isNewUser });
      
      return { user: authUser, isNewUser };
      
    } catch (error) {
      handleAuthError(error as AuthError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      // Handle case where Firebase is not configured
      if (!auth) {
        console.log('🔥 Firebase not configured, clearing user state');
        setUser(null);
        return;
      }

      await firebaseSignOut(auth);
      setUser(null);
      console.log('🔥 Firebase Auth: Sign out successful');
    } catch (error) {
      console.error('🔥 Firebase Auth: Sign out error', error);
      handleAuthError(error as AuthError);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithLinkedIn,
    signOut,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {!mounted ? (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}

// Hook for checking if user is authenticated
export function useAuthUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}

// Hook for auth loading state
export function useAuthLoading(): boolean {
  const { loading } = useAuth();
  return loading;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }
    
    if (!user) {
      // Redirect to sign-in page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
      return null;
    }
    
    return <Component {...props} />;
  };
}

export default FirebaseAuthProvider;