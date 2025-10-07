import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, ensureDbUserFromFirebase } from './authUser';

/**
 * Authenticated context returned when auth succeeds.
 * Contains user info from PostgreSQL database.
 */
export interface AuthedContext {
  /** PostgreSQL User.id */
  dbUserId: string;
  /** Anonymized public handle (e.g., 'user-abc123') */
  dbUserHandle: string;
  /** Firebase UID */
  firebaseUid: string;
  /** User email (may be null) */
  email: string | null;
  /** Provider used for sign-in (google, linkedin, etc.) */
  provider: string | null;
}

/**
 * Require authentication on an API route.
 *
 * Extracts and verifies Firebase ID token from Authorization header,
 * ensures user exists in PostgreSQL, and returns user context.
 *
 * Usage in API route:
 * ```typescript
 * export async function POST(req: NextRequest) {
 *   const auth = await requireAuth(req);
 *   if (auth instanceof NextResponse) return auth; // Error response
 *
 *   // auth is AuthedContext - proceed with authenticated request
 *   const userId = auth.dbUserId;
 *   const handle = auth.dbUserHandle;
 *   // ...
 * }
 * ```
 *
 * @param req - Next.js request object
 * @returns AuthedContext on success, NextResponse (error) on failure
 */
export async function requireAuth(
  req: NextRequest
): Promise<AuthedContext | NextResponse> {
  // Extract Authorization header
  const authHeader = req.headers.get('authorization') || '';
  const match = authHeader.match(/^Bearer (.+)$/i);

  if (!match) {
    console.warn('❌ Auth failed: missing Bearer token');
    return NextResponse.json(
      {
        error: 'missing_bearer_token',
        message: 'Authorization header must include Bearer token',
      },
      { status: 401 }
    );
  }

  const idToken = match[1];

  try {
    // Verify Firebase ID token
    const decoded = await verifyIdToken(idToken);
    console.log(`🔐 Token verified: uid=${decoded.uid}, email=${decoded.email}`);

    // Ensure user exists in PostgreSQL and get DB record
    const dbUser = await ensureDbUserFromFirebase(decoded);
    console.log(`✅ Auth success: dbUser=${dbUser.id}, handle=${dbUser.publicHandle}`);

    return {
      dbUserId: dbUser.id,
      dbUserHandle: dbUser.publicHandle,
      firebaseUid: dbUser.firebaseUid || decoded.uid,
      email: dbUser.email,
      provider: dbUser.provider,
    };
  } catch (error: any) {
    console.error('❌ Auth failed:', error);

    // Return detailed error for debugging
    return NextResponse.json(
      {
        error: 'invalid_token',
        message: 'Failed to verify authentication token',
        detail: error?.message || String(error),
        code: error?.code,
      },
      { status: 401 }
    );
  }
}
