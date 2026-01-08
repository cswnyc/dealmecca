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
 * - Invite-only page (/invite-only)
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

  // Don't render sidebar if user account is pending approval or rejected
  if (user.accountStatus === 'PENDING' || user.accountStatus === 'REJECTED') {
    return null;
  }

  // Don't render sidebar on landing page, auth pages, admin pages, or invite-only page
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname?.startsWith('/auth/') ||
                     pathname?.startsWith('/sign-in') ||
                     pathname?.startsWith('/sign-up');
  const isAdminPage = pathname?.startsWith('/admin');
  const isInviteOnlyPage = pathname?.startsWith('/invite-only');
  const isDesignSystemPage = pathname?.startsWith('/design-system');

  if (isLandingPage || isAuthPage || isAdminPage || isInviteOnlyPage || isDesignSystemPage) {
    return null;
  }

  // Render sidebar for authenticated users on app pages
  return <CollapsibleSidebar />;
}
