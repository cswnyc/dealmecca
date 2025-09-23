/**
 * Simple Anonymous Authentication Hook
 * Simplified version that avoids OAuth conflicts
 */

import { useState, useEffect, useCallback } from 'react';
import {
  auth,
  onAuthStateChanged,
  signInAnonymously
} from '@/lib/firebase';
import { generateAnonymousProfile } from '@/lib/user-generator';

export interface SimpleAnonymousUser {
  id: string;
  firebaseUid: string;
  username: string;
  avatar: string;
  isAnonymous: boolean;
  isAuthenticated: boolean;
  createdAt: string;
}

interface UseSimpleAnonymousAuthReturn {
  user: SimpleAnonymousUser | null;
  isLoading: boolean;
  error: string | null;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  isAnonymous: boolean;
}

export const useSimpleAnonymousAuth = (): UseSimpleAnonymousAuthReturn => {
  const [user, setUser] = useState<SimpleAnonymousUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create or fetch user profile from database
  const createOrGetUserProfile = async (firebaseUser: any): Promise<SimpleAnonymousUser> => {
    try {
      // Check if user exists in database
      const response = await fetch('/api/auth/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          isAnonymous: firebaseUser.isAnonymous,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create/fetch user profile');
      }

      const userData = await response.json();

      // Generate profile if needed
      if (!userData.anonymousUsername && firebaseUser.isAnonymous) {
        const profile = generateAnonymousProfile(firebaseUser.uid);

        // Update user profile with generated data
        const updateResponse = await fetch('/api/auth/user', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebaseUid: firebaseUser.uid,
            anonymousUsername: profile.username,
            avatarSeed: firebaseUser.uid,
          }),
        });

        if (updateResponse.ok) {
          const updatedData = await updateResponse.json();
          return {
            id: updatedData.id,
            firebaseUid: firebaseUser.uid,
            username: updatedData.anonymousUsername,
            avatar: profile.avatar,
            isAnonymous: firebaseUser.isAnonymous,
            isAuthenticated: true,
            createdAt: updatedData.createdAt,
          };
        }
      }

      return {
        id: userData.id,
        firebaseUid: firebaseUser.uid,
        username: userData.anonymousUsername || userData.name || 'Anonymous',
        avatar: userData.avatarSeed ? generateAnonymousProfile(userData.avatarSeed).avatar : '',
        isAnonymous: userData.isAnonymous,
        isAuthenticated: true,
        createdAt: userData.createdAt,
      };
    } catch (err) {
      console.error('Error creating/fetching user profile:', err);
      throw err;
    }
  };

  // Sign in anonymously - simplified version
  const signInAnonymouslySimple = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }

      console.log('Attempting anonymous sign-in...');
      const result = await signInAnonymously(auth);
      console.log('Anonymous sign-in successful:', result.user.uid);

      const userProfile = await createOrGetUserProfile(result.user);
      setUser(userProfile);

      // Store user session in localStorage for persistence
      localStorage.setItem('simple_anonymous_user', JSON.stringify(userProfile));
    } catch (err: any) {
      console.error('Anonymous sign-in error:', err);
      setError(err?.message || 'Failed to sign in anonymously');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      if (auth) {
        await auth.signOut();
      }
      setUser(null);
      localStorage.removeItem('simple_anonymous_user');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign out');
      console.error('Sign out error:', err);
    }
  }, []);

  // Monitor Firebase auth state
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('Auth state changed - user exists:', firebaseUser.uid);
          const userProfile = await createOrGetUserProfile(firebaseUser);
          setUser(userProfile);
          localStorage.setItem('simple_anonymous_user', JSON.stringify(userProfile));
        } else {
          console.log('Auth state changed - no user');
          // Check localStorage for persisted session
          const storedUser = localStorage.getItem('simple_anonymous_user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
            } catch {
              localStorage.removeItem('simple_anonymous_user');
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } catch (err: any) {
        console.error('Auth state change error:', err);
        setError(err?.message || 'Authentication error');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto sign-in anonymously if no user exists (disabled to avoid conflicts)
  // Uncomment this if you want automatic sign-in
  /*
  useEffect(() => {
    if (!isLoading && !user && !error) {
      signInAnonymouslySimple();
    }
  }, [isLoading, user, error, signInAnonymouslySimple]);
  */

  return {
    user,
    isLoading,
    error,
    signInAnonymously: signInAnonymouslySimple,
    signOut,
    isAnonymous: user?.isAnonymous ?? true,
  };
};