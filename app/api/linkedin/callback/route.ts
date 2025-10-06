export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAnonymousProfile } from '@/lib/user-generator';
import { randomBytes } from 'crypto';

// Generate a random ID similar to CUID format
const generateId = () => {
  return `cmg${randomBytes(12).toString('base64url')}`;
};

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

async function postFormWithBasicAuth(url: string, data: Record<string,string>, clientId: string, clientSecret: string) {
  const body = new URLSearchParams(data).toString();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body,
  });

  const responseText = await res.text();

  // Log errors for debugging
  if (!res.ok) {
    console.error('LinkedIn token exchange with Basic Auth failed:', res.status, responseText);
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
  try {
    console.log('LinkedIn callback initiated:', {
      origin: req.nextUrl.origin,
      hasCode: !!req.nextUrl.searchParams.get('code'),
      hasState: !!req.nextUrl.searchParams.get('state'),
      hasError: !!req.nextUrl.searchParams.get('error'),
      timestamp: new Date().toISOString()
    });

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

    // Validate environment variables
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing LinkedIn environment variables:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('LINKEDIN'))
      });
      return NextResponse.json({
        error: 'Server configuration error',
        details: 'Missing LinkedIn credentials'
      }, { status: 500 });
    }

    // Use dynamic redirect URI based on current domain
    const baseUrl = req.nextUrl.origin;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${baseUrl}/api/linkedin/callback`;
    console.log('Environment check passed, proceeding with token exchange:', {
      clientId: clientId.substring(0, 5) + '...',
      redirectUri,
      baseUrl
    });


    // Exchange authorization code for access token
    console.log('Attempting token exchange with LinkedIn using Basic Auth...');
    console.log('Token exchange parameters:', {
      grant_type: 'authorization_code',
      code: code?.substring(0, 10) + '...',
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret_length: clientSecret.length,
      client_secret_preview: clientSecret.substring(0, 5) + '...'
    });

    // Try Basic Auth first (more secure and preferred by some OAuth providers)
    const tokenDataBasicAuth: Record<string,string> = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    };

    let token = await postFormWithBasicAuth('https://www.linkedin.com/oauth/v2/accessToken', tokenDataBasicAuth, clientId, clientSecret);
    console.log('Basic Auth response:', { status: token.status, ok: token.ok });

    // If Basic Auth fails, try form parameters method
    if (!token.ok) {
      console.log('Basic Auth failed, trying form parameters method...');
      const tokenDataFormAuth: Record<string,string> = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      };

      token = await postForm('https://www.linkedin.com/oauth/v2/accessToken', tokenDataFormAuth);
      console.log('Form parameters response:', { status: token.status, ok: token.ok });
    }

    if (!token.ok) {
      console.error('LinkedIn token exchange failed:', {
        status: token.status,
        response: token.json
      });
      return NextResponse.json({
        error: 'Failed to exchange authorization code',
        details: token.json
      }, { status: 400 });
    }

    if (!token.json?.access_token) {
      console.error('No access token received from LinkedIn:', token.json);
      return NextResponse.json({
        error: 'No access token received',
        details: 'LinkedIn did not return an access token'
      }, { status: 400 });
    }

    console.log('Token exchange successful, fetching user profile...');

    // Get user info from LinkedIn
    let userinfo = await getJSON('https://api.linkedin.com/v2/userinfo', {
      Authorization: `Bearer ${token.json.access_token}`,
    });

    console.log('OIDC userinfo response:', {
      ok: userinfo.ok,
      status: userinfo.status,
      hasSub: !!userinfo.json?.sub,
      hasEmail: !!userinfo.json?.email,
      hasName: !!userinfo.json?.name
    });

    // Fallback to legacy API if OIDC userinfo failed
    let me = null as any;
    let email = null as any;
    if (!userinfo.ok || !userinfo.json?.sub) {
      console.log('OIDC failed, trying legacy API endpoints...');

      me = await getJSON('https://api.linkedin.com/v2/me', {
        Authorization: `Bearer ${token.json.access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      });

      email = await getJSON('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        Authorization: `Bearer ${token.json.access_token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      });

      console.log('Legacy API responses:', {
        meOk: me?.ok,
        meStatus: me?.status,
        hasId: !!me?.json?.id,
        emailOk: email?.ok,
        emailStatus: email?.status,
        hasEmailAddr: !!email?.json?.elements?.[0]?.['handle~']?.emailAddress
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

    console.log('Extracted user data:', {
      hasLinkedinId: !!linkedinId,
      hasName: !!name,
      hasEmail: !!emailAddr,
      source: userinfo?.ok ? 'oidc' : 'legacy'
    });

    // Ensure we have a valid LinkedIn ID
    if (!linkedinId) {
      console.error('Failed to extract LinkedIn user ID from API responses');
      return NextResponse.json({ error: 'Unable to retrieve user profile' }, { status: 400 });
    }

    // Create or find user in database
    const userEmail = emailAddr?.toLowerCase();
    const userIdentifier = userEmail || `linkedin:${linkedinId}`;

    console.log('Creating/finding database user:', { userIdentifier, hasEmail: !!userEmail });

    let dbUser;
    try {
      // Try to find existing user by email first
      if (userEmail) {
        dbUser = await prisma.user.findUnique({
          where: { email: userEmail }
        });
      }

      // If no user found by email, try to find by a unique identifier approach
      if (!dbUser) {
        // For LinkedIn users without email, we'll use firebaseUid field to store linkedin:id
        const linkedinIdentifier = userEmail || `linkedin:${linkedinId}`;
        dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: userEmail },
              { firebaseUid: `linkedin:${linkedinId}` }
            ]
          }
        });
      }

      if (!dbUser) {
        // Create new user with anonymous profile
        const anonymousProfile = generateAnonymousProfile(linkedinId);
        const userId = generateId();

        console.log('🆕 Creating new LinkedIn user with ID:', userId);

        dbUser = await prisma.user.create({
          data: {
            id: userId,
            email: userEmail || null,
            firebaseUid: userEmail ? null : `linkedin:${linkedinId}`,
            name: name || null,
            anonymousUsername: anonymousProfile.username,
            avatarSeed: anonymousProfile.avatarId,
            isAnonymous: true,
            role: 'FREE',
            subscriptionTier: 'FREE',
            subscriptionStatus: 'ACTIVE'
          }
        });

        console.log('✅ Created new LinkedIn user in database:', {
          id: dbUser.id,
          email: dbUser.email,
          firebaseUid: dbUser.firebaseUid,
          anonymousUsername: dbUser.anonymousUsername
        });
      } else {
        console.log('✅ Found existing LinkedIn user in database:', {
          id: dbUser.id,
          email: dbUser.email,
          firebaseUid: dbUser.firebaseUid
        });
      }
    } catch (dbError) {
      console.error('❌ Database user creation/lookup failed:', dbError);
      console.error('Error details:', dbError instanceof Error ? dbError.message : 'Unknown error');

      // IMPORTANT: Don't continue if database operations fail
      return NextResponse.json({
        error: 'Failed to create or find user in database',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Verify we have a valid database user before continuing
    if (!dbUser || !dbUser.id) {
      console.error('❌ No valid database user after creation/lookup');
      return NextResponse.json({
        error: 'User creation failed',
        details: 'Database user is null or missing ID'
      }, { status: 500 });
    }

    // Create session data compatible with existing auth system
    const uid = emailAddr ? emailAddr.toLowerCase() : `linkedin:${linkedinId}`;
    const sessionData = {
      userId: dbUser.id, // IMPORTANT: Use database user ID, not LinkedIn ID!
      dbUserId: dbUser.id, // Database user ID for identity system
      firebaseUid: dbUser.firebaseUid, // Firebase UID equivalent for API compatibility
      linkedinId: linkedinId, // Store LinkedIn ID for reference
      email: emailAddr || undefined,
      name: name || undefined,
      provider: 'linkedin',
      source: userinfo?.ok ? 'oidc' : 'legacy',
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours expiration
      timestamp: new Date().toISOString(),
    };

    console.log('📝 Session data created with database user ID:', {
      userId: sessionData.userId,
      dbUserId: sessionData.dbUserId,
      linkedinId: sessionData.linkedinId
    });

    console.log('Creating session token and redirect URL...');

    // Encode session as base64 token
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    // Create redirect to success page with session data
    const successUrl = new URL('/auth/linkedin-success', req.nextUrl.origin);
    successUrl.searchParams.set('session', sessionToken);
    successUrl.searchParams.set('redirect', '/forum');
    successUrl.searchParams.set('user', JSON.stringify({
      id: dbUser.id, // Use database ID, not LinkedIn ID
      email: emailAddr,
      name: name,
      provider: 'linkedin'
    }));

    console.log('Redirecting to success page:', successUrl.pathname);

    const res = NextResponse.redirect(successUrl);

    // Set authentication cookie for the user session
    const cookieValue = `linkedin-${dbUser.id}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    res.cookies.set('linkedin-auth', cookieValue, {
      httpOnly: false, // Allow client-side JavaScript to read (for debugging)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      path: '/',
      expires: expiresAt
    });
    console.log('🍪 Set linkedin-auth cookie:', cookieValue);

    // Clear OAuth state cookie (no PKCE verifier to clear)
    res.cookies.set('li_oauth_state', '', { path: '/', maxAge: 0 });
    return res;

  } catch (error) {
    console.error('LinkedIn callback error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      error: 'Internal server error',
      details: 'LinkedIn authentication failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}