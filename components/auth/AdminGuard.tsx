'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/firebase-auth';
import { authedFetch } from '@/lib/authedFetch';

interface AdminGuardProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

export function AdminGuard({ children, fallbackUrl = '/auth/signup' }: AdminGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Wait for auth to load
      if (loading) {
        return;
      }

      // No user - redirect to login
      if (!user) {
        router.replace(fallbackUrl);
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      try {
        const response = await authedFetch('/api/users/profile', { method: 'GET' });

        if (response.status === 401) {
          router.replace(fallbackUrl);
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        if (!response.ok) {
          router.replace('/forum');
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        const profile: { role?: string } = await response.json();
        const role = profile.role;
        const isAdmin = role === 'ADMIN';

        if (!isAdmin) {
          router.replace('/forum');
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message === 'not_signed_in') {
          router.replace(fallbackUrl);
        } else {
          router.replace('/forum');
        }
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAdminAccess();
  }, [user, loading, router, fallbackUrl]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message (this shouldn't normally be seen due to redirects)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  // User is authorized - render admin content
  return <>{children}</>;
}