export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

async function postForm(url: string, data: Record<string,string>) {
  const body = new URLSearchParams(data).toString();

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const responseText = await res.text();

  // Log errors for debugging
  if (!res.ok) {
    console.error('LinkedIn token exchange failed:', res.status, responseText);
  }

  let json;
  try {
    json = JSON.parse(responseText);
  } catch (e) {
    json = { _raw_response: responseText };
  }

  return { status: res.status, ok: res.ok, json };
}

async function getJSON(url: string, headers: Record<string,string>) {
  const res = await fetch(url, { headers });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, json };
}

export async function GET(req: NextRequest) {

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');

  if (error) {
    console.error('LinkedIn OAuth authorization error:', error);
    return NextResponse.json({ error: 'Authorization failed', details: error }, { status: 400 });
  }
  if (!code) {
    console.error('No authorization code received from LinkedIn');
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  const cookieState = req.cookies.get('li_oauth_state')?.value || null;

  if (!cookieState || cookieState !== state) {
    console.error('LinkedIn OAuth state mismatch:', {
      cookieState: cookieState?.substring(0, 10) + '...',
      receivedState: state?.substring(0, 10) + '...',
      hasCookie: !!cookieState,
      hasState: !!state,
      allCookies: Object.fromEntries(
        Array.from(req.cookies.entries()).map(([key, cookie]) => [key, cookie.value?.substring(0, 10) + '...'])
      )
    });
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
  const redirectUri = `${req.nextUrl.origin}/api/linkedin/callback`;


  // Exchange authorization code for access token
  const tokenData: Record<string,string> = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  };

  const token = await postForm('https://www.linkedin.com/oauth/v2/accessToken', tokenData);

  // Get user info from LinkedIn
  let userinfo = await getJSON('https://api.linkedin.com/v2/userinfo', {
    Authorization: `Bearer ${token.json?.access_token || ''}`,
  });

  // Fallback to legacy API if OIDC userinfo failed
  let me = null as any;
  let email = null as any;
  if (!userinfo.ok || !userinfo.json?.sub) {
    me = await getJSON('https://api.linkedin.com/v2/me', {
      Authorization: `Bearer ${token.json?.access_token || ''}`,
      'X-Restli-Protocol-Version': '2.0.0',
    });
    email = await getJSON('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      Authorization: `Bearer ${token.json?.access_token || ''}`,
      'X-Restli-Protocol-Version': '2.0.0',
    });
  }

  // Extract user identity from API responses
  const linkedinId =
    userinfo?.json?.sub ||
    me?.json?.id || null;
  const name =
    userinfo?.json?.name ||
    (me?.json?.localizedFirstName && me?.json?.localizedLastName
      ? `${me.json.localizedFirstName} ${me.json.localizedLastName}`
      : null);
  const emailAddr =
    userinfo?.json?.email ||
    email?.json?.elements?.[0]?.['handle~']?.emailAddress ||
    null;

  // Ensure we have a valid LinkedIn ID
  if (!linkedinId) {
    console.error('Failed to extract LinkedIn user ID');
    return NextResponse.json({ error: 'Unable to retrieve user profile' }, { status: 400 });
  }

  // Create session data compatible with existing auth system
  const uid = emailAddr ? emailAddr.toLowerCase() : `linkedin:${linkedinId}`;
  const sessionData = {
    userId: linkedinId, // Use userId for compatibility with success page
    email: emailAddr || undefined,
    name: name || undefined,
    provider: 'linkedin',
    source: userinfo?.ok ? 'oidc' : 'legacy',
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours expiration
    timestamp: new Date().toISOString(),
  };

  // Encode session as base64 token
  const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');

  // Create redirect to success page with session data
  const successUrl = new URL('/auth/linkedin-success', req.nextUrl.origin);
  successUrl.searchParams.set('session', sessionToken);
  successUrl.searchParams.set('redirect', '/forum');
  successUrl.searchParams.set('user', JSON.stringify({
    id: linkedinId,
    email: emailAddr,
    name: name,
    provider: 'linkedin'
  }));

  const res = NextResponse.redirect(successUrl);

  // Clear OAuth state cookie
  res.cookies.set('li_oauth_state', '', { path: '/', maxAge: 0 });
  return res;
}