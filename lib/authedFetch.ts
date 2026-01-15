'use client';

import { getAuth } from 'firebase/auth';

/**
 * Authenticated fetch wrapper that automatically attaches Firebase ID token.
 *
 * Gets the current Firebase user's ID token and adds it as a Bearer token
 * in the Authorization header. Also sets Content-Type to application/json.
 *
 * Usage:
 * ```typescript
 * const response = await authedFetch('/api/forum/posts/123/comments', {
 *   method: 'POST',
 *   body: JSON.stringify({ content: 'Hello world' }),
 * });
 *
 * const data = await response.json();
 * if (!response.ok) {
 *   throw new Error(data.error || 'Request failed');
 * }
 * ```
 *
 * @param input - URL or Request object
 * @param init - Fetch options (method, body, etc.)
 * @returns Promise resolving to Response
 * @throws Error if user is not signed in
 */
export async function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('not_signed_in');
  }

  // Get fresh ID token
  const idToken = await user.getIdToken();

  // Create headers with Authorization and Content-Type
  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${idToken}`);

  // Set Content-Type only if not already set, method is not GET, and body is present
  const isFormDataBody = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (!headers.has('Content-Type') && init.method && init.method !== 'GET' && init.body && !isFormDataBody) {
    headers.set('Content-Type', 'application/json');
  }

  // Perform the fetch with updated headers
  return fetch(input, {
    ...init,
    headers,
  });
}
