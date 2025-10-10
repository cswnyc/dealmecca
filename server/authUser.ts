import { getAdmin } from './firebaseAdmin';
import { prisma } from '@/lib/prisma';
import { makeAlias } from './alias';
import type { User } from '@prisma/client';

/**
 * Decoded Firebase ID token with extended claims
 */
export interface DecodedIdToken {
  uid: string;
  email?: string;
  firebase?: {
    sign_in_provider?: string;
    identities?: Record<string, any>;
  };
  [key: string]: any;
}

/**
 * Verify a Firebase ID token.
 *
 * @param idToken - The Firebase ID token from Authorization header
 * @returns Decoded token with user info
 * @throws Error if token is invalid or expired
 */
export async function verifyIdToken(idToken: string): Promise<DecodedIdToken> {
  const admin = getAdmin();
  const decoded = await admin.auth().verifyIdToken(idToken);
  return decoded as DecodedIdToken;
}

/**
 * Ensure a user row exists in PostgreSQL for this Firebase user.
 *
 * Strategy:
 * 1. Try to match by email first (prevents duplicate accounts when switching between Google/LinkedIn)
 * 2. Try to match by firebaseUid
 * 3. Create new user if no match found
 *
 * Always ensures firebaseUid is set and publicHandle exists.
 *
 * @param decoded - Decoded Firebase ID token
 * @returns User record from PostgreSQL
 */
export async function ensureDbUserFromFirebase(decoded: DecodedIdToken): Promise<User> {
  const email = decoded.email?.toLowerCase() || null;
  const provider = decoded.firebase?.sign_in_provider || 'custom';

  // Step 1: Try to find existing user by email (prevent duplicates across providers)
  let user: User | null = email
    ? await prisma.user.findUnique({ where: { email } })
    : null;

  // Step 2: If not found by email, try by firebaseUid
  if (!user) {
    user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
  }

  // Step 3: Create new user if none exists
  if (!user) {
    const alias = makeAlias(decoded.uid);

    console.log(`📝 Creating new user: firebaseUid=${decoded.uid}, email=${email}, handle=${alias}, provider=${provider}`);

    user = await prisma.user.create({
      data: {
        firebaseUid: decoded.uid,
        email: email,
        publicHandle: alias,
        name: alias, // Use alias as name for privacy
        provider: provider,
        // Role and other fields will use their defaults from schema
      },
    });

    console.log(`✅ User created: id=${user.id}, handle=${user.publicHandle}`);
    return user;
  }

  // Step 4: Update existing user if firebaseUid is missing (migration scenario)
  if (!user.firebaseUid) {
    // Check if this firebaseUid is already taken by another user
    const conflictingUser = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid }
    });

    if (conflictingUser && conflictingUser.id !== user.id) {
      console.warn(`⚠️ FirebaseUid ${decoded.uid} already belongs to user ${conflictingUser.id}, skipping update for user ${user.id}`);
      // Don't update - this user should use their existing account without firebaseUid
    } else {
      console.log(`🔄 Updating existing user ${user.id} with firebaseUid=${decoded.uid}`);

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseUid: decoded.uid,
          provider: provider,
        },
      });
    }
  }

  // Step 5: Ensure publicHandle exists (migration scenario)
  if (!user.publicHandle) {
    let alias = makeAlias(decoded.uid);

    // Check if this publicHandle is already taken
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const existingUser = await prisma.user.findUnique({
        where: { publicHandle: alias }
      });

      if (!existingUser || existingUser.id === user.id) {
        isUnique = true;
      } else {
        // Generate new alias with attempt number
        alias = makeAlias(`${decoded.uid}-${attempts}`);
        attempts++;
      }
    }

    if (isUnique) {
      console.log(`🔄 Adding publicHandle to user ${user.id}: ${alias}`);

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          publicHandle: alias,
        },
      });
    } else {
      console.warn(`⚠️ Could not find unique publicHandle for user ${user.id} after 10 attempts`);
    }
  }

  return user;
}
