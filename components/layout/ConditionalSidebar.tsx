'use client';

import { useUser } from '@/hooks/useUser';
import { usePathname } from 'next/navigation';
import CollapsibleSidebar from './CollapsibleSidebar';

/**
 * Wrapper component that conditionally renders the CollapsibleSidebar
 * based on user authentication and current route.
 *
 * Sidebar is hidden on:
 * - Landing page (/)
 * - Auth pages (/auth/*)
 * - Sign-in/sign-up pages
 * - Admin pages (/admin/*)
 * - When user is not authenticated
 */
export default function ConditionalSidebar() {
  const { user, loading } = useUser();
  const pathname = usePathname();

  // Don't render sidebar while checking auth state
  if (loading) {
    return null;
  }

  // Don't render sidebar if user is not authenticated
  if (!user) {
    return null;
  }

  // Don't render sidebar on landing page, auth pages, or admin pages
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname?.startsWith('/auth/') ||
                     pathname?.startsWith('/sign-in') ||
                     pathname?.startsWith('/sign-up');
  const isAdminPage = pathname?.startsWith('/admin');

  if (isLandingPage || isAuthPage || isAdminPage) {
    return null;
  }

  // Render sidebar for authenticated users on app pages
  return <CollapsibleSidebar />;
}
