export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

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
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${baseUrl}/api/linkedin/callback`;
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

  const res = NextResponse.redirect(url);
  // Only store state for validation (no PKCE verifier)
  res.cookies.set('li_oauth_state', state, { httpOnly: true, secure: false, path: '/', maxAge: 300 });
  return res;
}