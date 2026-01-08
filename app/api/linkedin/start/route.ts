export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * LinkedIn OAuth Start Route
 * 
 * IMPORTANT: LinkedIn OAuth testing in local development
 * -------------------------------------------------------
 * LinkedIn requires exact redirect URI whitelisting in their Developer Console.
 * By default, only production URLs are whitelisted.
 * 
 * For LOCAL TESTING: You must add http://localhost:3000/api/linkedin/callback
 * to your LinkedIn App's "Authorized redirect URLs" in the LinkedIn Developer Console.
 * 
 * RECOMMENDED APPROACH: Test LinkedIn OAuth in production/staging only.
 * - Test Google/Email auth locally
 * - Test LinkedIn auth in production environment
 * 
 * This is a common practice for OAuth providers with strict URI policies.
 */

// Generate random state for OAuth security
function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(req: NextRequest) {
  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  
  // Use dynamic redirect URI based on current domain
  const baseUrl = req.nextUrl.origin;
  let redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${baseUrl}/api/linkedin/callback`;
  
  // If LINKEDIN_REDIRECT_URI is just a path, rebase it to current origin
  // This prevents localhost vs 127.0.0.1 mismatches in development
  if (redirectUri.startsWith('/')) {
    redirectUri = `${baseUrl}${redirectUri}`;
  }
  
  const scope = (process.env.LINKEDIN_SCOPES || 'openid profile email').trim();

  // Generate state for security (no PKCE)
  const state = randomString(24);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
  });

  const url = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  console.log('🔗 LinkedIn OAuth start:', {
    baseUrl,
    redirectUri,
    state: state.substring(0, 10) + '...',
    isSecure: req.nextUrl.protocol === 'https:'
  });

  const res = NextResponse.redirect(url);
  
  // Set cookie with appropriate security settings
  const isSecure = req.nextUrl.protocol === 'https:';
  res.cookies.set('li_oauth_state', state, { 
    httpOnly: true, 
    secure: isSecure, 
    sameSite: 'lax',
    path: '/', 
    maxAge: 300 
  });
  
  console.log('🍪 Set li_oauth_state cookie:', {
    value: state.substring(0, 10) + '...',
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 300
  });
  
  return res;
}