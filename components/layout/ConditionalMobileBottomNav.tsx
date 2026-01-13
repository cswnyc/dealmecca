'use client';

import { useUser } from '@/hooks/useUser';
import { usePathname } from 'next/navigation';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

/**
 * Wrapper component that conditionally renders the MobileBottomNav
 * based on user authentication and current route.
 *
 * Bottom nav is hidden on:
 * - Landing page (/)
 * - Auth pages (/auth/*)
 * - Admin pages (/admin/*)
 * - Invite-only page (/invite-only)
 * - Design system pages (/design-system/*)
 * - When user is not authenticated
 * - On tablet and desktop (sm:hidden)
 */
export default function ConditionalMobileBottomNav(): JSX.Element | null {
  const { user, loading } = useUser();
  const pathname = usePathname();

  // Don't render while checking auth state
  if (loading) {
    return null;
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  // Don't render if user account is pending approval or rejected
  if (user.accountStatus === 'PENDING' || user.accountStatus === 'REJECTED') {
    return null;
  }

  // Don't render on specific pages where we suppress app chrome
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname?.startsWith('/auth/') ||
                     pathname?.startsWith('/sign-in') ||
                     pathname?.startsWith('/sign-up');
  const isAdminPage = pathname?.startsWith('/admin');
  const isInviteOnlyPage = pathname?.startsWith('/invite-only');
  const isDesignSystemPage = pathname?.startsWith('/design-system');
  const isDevPage = pathname?.startsWith('/dev');

  if (isLandingPage || isAuthPage || isAdminPage || isInviteOnlyPage || isDesignSystemPage || isDevPage) {
    return null;
  }

  // Render mobile bottom nav for authenticated users on app pages
  // Only visible on mobile (sm:hidden)
  return (
    <div className="sm:hidden">
      <MobileBottomNav />
    </div>
  );
}
