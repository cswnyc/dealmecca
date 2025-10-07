import admin from 'firebase-admin';

let app: admin.app.App | null = null;

/**
 * Resolves the Firebase private key from environment variables.
 * Handles various formats: quoted, escaped newlines, or base64-encoded.
 */
function resolvePrivateKey(): string {
  let pk = process.env.FIREBASE_PRIVATE_KEY || '';

  // Remove quotes if present (some env systems add them)
  if (pk.startsWith('"') && pk.endsWith('"')) {
    pk = pk.slice(1, -1);
  }

  // Replace escaped newlines with actual newlines
  if (pk.includes('\\n')) {
    pk = pk.replace(/\\n/g, '\n');
  }

  // Fallback to base64-encoded key if direct key not available
  if (!pk && process.env.FIREBASE_PRIVATE_KEY_B64) {
    pk = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, 'base64').toString('utf8');
  }

  if (!pk) {
    throw new Error('Missing Firebase private key - set FIREBASE_PRIVATE_KEY or FIREBASE_PRIVATE_KEY_B64');
  }

  return pk;
}

/**
 * Gets the Firebase Admin SDK instance.
 * Initializes on first call, returns cached instance on subsequent calls.
 */
export function getAdmin() {
  if (app) return admin;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !clientEmail) {
    throw new Error('Missing Firebase config - set FIREBASE_PROJECT_ID and FIREBASE_CLIENT_EMAIL');
  }

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: resolvePrivateKey(),
    }),
  });

  console.log('✓ Firebase Admin SDK initialized successfully');

  return admin;
}
