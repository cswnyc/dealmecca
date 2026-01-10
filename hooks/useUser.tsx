'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { UserRole } from '@/lib/permissions';
import { useAuth } from '@/lib/auth/firebase-auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  teamId?: string;
  teamName?: string;
  profilePicture?: string;
  accountStatus?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get Firebase auth state
  const { user: firebaseUser, idToken, loading: authLoading } = useAuth();

  const fetchUser = async (): Promise<void> => {
    // Don't fetch if Firebase auth is still loading or user not authenticated
    if (authLoading) {
      return;
    }

    if (!firebaseUser || !idToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use Firebase Authorization header
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const userData = await response.json();

        // Map profile data to User interface
        const mappedUser = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role as UserRole,
          isActive: true,
          teamId: userData.teamId,
          teamName: userData.teamName,
          profilePicture: userData.profilePicture,
          accountStatus: userData.accountStatus
        };

        setUser(mappedUser);
      } else if (response.status === 401) {
        // User not authenticated
        console.warn('⚠️ useUser: Profile API returned 401 - user not authenticated');
        setUser(null);
      } else {
        const errorText = await response.text();
        console.error('❌ useUser: Profile API error:', response.status, errorText);
        throw new Error('Failed to fetch user data');
      }
    } catch (err) {
      console.error('❌ useUser: Error in fetchUser:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    await fetchUser();
  };

  const updateUser = (updates: Partial<User>): void => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  useEffect(() => {
    fetchUser();
  }, [firebaseUser, idToken, authLoading]); // Re-fetch when auth state changes

  const value: UserContextType = {
    user,
    loading,
    error,
    refreshUser,
    updateUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}