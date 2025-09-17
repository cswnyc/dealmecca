'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/firebase-auth';

interface AdminGuardProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

export function AdminGuard({ children, fallbackUrl = '/auth/firebase-signin' }: AdminGuardProps) {
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
        return;
      }

      // Check if user has admin privileges
      // For now, we'll check if the email matches admin patterns
      // Later this can be enhanced with proper role management
      const adminEmails = [
        'admin@dealmecca.pro',
        'chris@dealmecca.com',
        'csw@dealmecca.com'
      ];

      const isAdmin = adminEmails.includes(user.email || '');

      if (!isAdmin) {
        // Not an admin - redirect to forum or organizations
        router.replace('/forum');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message (this shouldn't normally be seen due to redirects)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  // User is authorized - render admin content
  return <>{children}</>;
}