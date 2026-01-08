/**
 * Post-login redirect helper that syncs user with backend and redirects based on account status.
 * This ensures pending/rejected users don't see protected pages like /forum.
 */

import { AuthUser } from './firebase-auth';

interface SyncResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    subscriptionTier: string;
    accountStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  };
}

/**
 * Syncs Firebase user with backend and returns account status
 */
export async function syncUserAndGetStatus(
  user: AuthUser,
  isNewUser: boolean = false
): Promise<'PENDING' | 'APPROVED' | 'REJECTED' | null> {
  try {
    const syncResponse = await fetch('/api/auth/firebase-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providerId: user.providerId,
        isNewUser
      }),
      credentials: 'include'
    });

    if (syncResponse.ok) {
      const syncData: SyncResponse = await syncResponse.json();
      return syncData.user?.accountStatus ?? null;
    }

    return null;
  } catch (error) {
    console.error('Error syncing user:', error);
    return null;
  }
}

/**
 * Gets the appropriate redirect path based on account status
 */
export function getRedirectPath(accountStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null): string {
  if (accountStatus === 'PENDING' || accountStatus === 'REJECTED') {
    return '/auth/pending-approval';
  }
  // APPROVED or null (legacy users) go to forum
  return '/forum';
}

/**
 * Syncs user with backend and returns the appropriate redirect path
 */
export async function syncAndGetRedirectPath(
  user: AuthUser,
  isNewUser: boolean = false
): Promise<string> {
  const accountStatus = await syncUserAndGetStatus(user, isNewUser);
  return getRedirectPath(accountStatus);
}
