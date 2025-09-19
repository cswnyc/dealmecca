import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';

export interface UserRole {
  id: string;
  email: string;
  name: string;
  role: 'FREE' | 'PRO' | 'TEAM_ADMIN' | 'ADMIN';
  subscriptionTier: 'FREE' | 'PRO' | 'TEAM';
}

export function useUserRole() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.email) {
        setUserRole(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/auth/user-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName || 'User'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user role');
        }

        const data = await response.json();
        setUserRole(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching user role:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.email, user?.displayName]);

  const isAdmin = userRole?.role === 'ADMIN';
  const isRegularUser = userRole?.role && ['FREE', 'PRO', 'TEAM_ADMIN'].includes(userRole.role);

  return {
    userRole,
    loading,
    error,
    isAdmin,
    isRegularUser
  };
}