/**
 * Anonymous Authentication Hook
 * Manages Firebase anonymous authentication and user profile generation
 */

import { useState, useEffect, useCallback } from 'react';
import {
  auth,
  signInUserAnonymously,
  onAuthStateChanged,
  linkAnonymousToLinkedIn
} from '@/lib/firebase';
import { generateAnonymousProfile } from '@/lib/user-generator';

export interface AnonymousUser {
  id: string;
  firebaseUid: string;
  username: string;
  avatar: string;
  isAnonymous: boolean;
  isAuthenticated: boolean;
  createdAt: string;
}

interface UseAnonymousAuthReturn {
  user: AnonymousUser | null;
  isLoading: boolean;
  error: string | null;
  signInAnonymously: () => Promise<void>;
  upgradeToLinkedIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isAnonymous: boolean;
}

export const useAnonymousAuth = (): UseAnonymousAuthReturn => {
  const [user, setUser] = useState<AnonymousUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create or fetch user profile from database
  const createOrGetUserProfile = async (firebaseUser: any): Promise<AnonymousUser> => {
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

  // Sign in anonymously
  const signInAnonymously = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signInUserAnonymously();
      const firebaseUser = result.user;

      const userProfile = await createOrGetUserProfile(firebaseUser);
      setUser(userProfile);

      // Store user session in localStorage for persistence
      localStorage.setItem('anonymous_user', JSON.stringify(userProfile));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in anonymously');
      console.error('Anonymous sign-in error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upgrade anonymous user to LinkedIn
  const upgradeToLinkedIn = useCallback(async () => {
    if (!user || !auth?.currentUser) {
      throw new Error('No anonymous user to upgrade');
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await linkAnonymousToLinkedIn(auth.currentUser);
      const linkedInUser = result.user;

      // Update user profile with LinkedIn data
      const response = await fetch('/api/auth/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: linkedInUser.uid,
          email: linkedInUser.email,
          name: linkedInUser.displayName,
          isAnonymous: false,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        const updatedUser: AnonymousUser = {
          ...user,
          username: updatedData.name || user.username,
          isAnonymous: false,
        };

        setUser(updatedUser);
        localStorage.setItem('anonymous_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade account');
      console.error('Account upgrade error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      if (auth) {
        await auth.signOut();
      }
      setUser(null);
      localStorage.removeItem('anonymous_user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
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
          const userProfile = await createOrGetUserProfile(firebaseUser);
          setUser(userProfile);
          localStorage.setItem('anonymous_user', JSON.stringify(userProfile));
        } else {
          // Check localStorage for persisted session
          const storedUser = localStorage.getItem('anonymous_user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
            } catch {
              localStorage.removeItem('anonymous_user');
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto sign-in anonymously if no user exists
  useEffect(() => {
    if (!isLoading && !user && !error) {
      signInAnonymously();
    }
  }, [isLoading, user, error, signInAnonymously]);

  return {
    user,
    isLoading,
    error,
    signInAnonymously,
    upgradeToLinkedIn,
    signOut,
    isAnonymous: user?.isAnonymous ?? true,
  };
};