export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('=== LinkedIn Debug Endpoint ===');

    // Check environment variables
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    console.log('Environment check:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length,
      clientSecretLength: clientSecret?.length,
      clientIdPreview: clientId?.substring(0, 5) + '...',
      availableEnvVars: Object.keys(process.env).filter(key => key.includes('LINKEDIN'))
    });

    // Test basic fetch to LinkedIn
    const testUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    console.log('Testing fetch to LinkedIn...');

    const testResponse = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&client_id=' + clientId + '&client_secret=' + clientSecret
    });

    const testText = await testResponse.text();
    console.log('LinkedIn test response:', {
      status: testResponse.status,
      ok: testResponse.ok,
      headers: Object.fromEntries(testResponse.headers.entries()),
      body: testText.substring(0, 200) + '...'
    });

    return NextResponse.json({
      success: true,
      environment: {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        clientIdLength: clientId?.length,
        clientSecretLength: clientSecret?.length,
      },
      linkedin_test: {
        status: testResponse.status,
        ok: testResponse.ok,
        bodyPreview: testText.substring(0, 100)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('LinkedIn debug error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}