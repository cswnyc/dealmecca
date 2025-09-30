import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const returnUrl = searchParams.get('returnUrl') || '/dashboard';

    // LinkedIn OAuth 2.0 authorization parameters
    const clientId = process.env.LINKEDIN_CLIENT_ID!;
    const redirectUri = `${request.nextUrl.origin}/api/linkedin/callback`;
    const scope = 'openid profile email';
    const state = Buffer.from(JSON.stringify({ returnUrl })).toString('base64');

    // Construct LinkedIn authorization URL
    const linkedinAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    linkedinAuthUrl.searchParams.set('response_type', 'code');
    linkedinAuthUrl.searchParams.set('client_id', clientId);
    linkedinAuthUrl.searchParams.set('redirect_uri', redirectUri);
    linkedinAuthUrl.searchParams.set('scope', scope);
    linkedinAuthUrl.searchParams.set('state', state);

    console.log('🔗 LinkedIn OAuth initiation:', {
      clientId,
      redirectUri,
      scope,
      authUrl: linkedinAuthUrl.toString()
    });

    // Redirect to LinkedIn for authorization
    return NextResponse.redirect(linkedinAuthUrl.toString());

  } catch (error) {
    console.error('❌ LinkedIn OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn OAuth' },
      { status: 500 }
    );
  }
}