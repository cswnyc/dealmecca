export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Retrieves the LinkedIn custom token from httpOnly cookie.
 * This is a one-time use endpoint - the cookie is cleared after retrieval.
 *
 * Called by /auth/linkedin-complete page to get the token for signing in.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('li_custom_token')?.value || null;

  console.log('🔑 Custom token requested:', token ? 'found' : 'not found');

  const res = NextResponse.json({ token });

  // Clear the cookie after retrieval (one-time use)
  if (token) {
    res.cookies.set('li_custom_token', '', { path: '/', maxAge: 0 });
    console.log('🗑️ Custom token cookie cleared');
  }

  return res;
}
