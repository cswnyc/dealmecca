export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { pkcePair, randomString } from '@/lib/oauth';

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI!;
  const scope = (process.env.LINKEDIN_SCOPES || 'openid profile email').trim();

  const { verifier, challenge } = await pkcePair();
  const state = randomString(24);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  const url = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  const res = NextResponse.redirect(url);
  // short-lived httpOnly cookies for PKCE + state
  res.cookies.set('li_pkce_verifier', verifier, { httpOnly: true, secure: false, path: '/', maxAge: 300 });
  res.cookies.set('li_oauth_state', state, { httpOnly: true, secure: false, path: '/', maxAge: 300 });
  return res;
}