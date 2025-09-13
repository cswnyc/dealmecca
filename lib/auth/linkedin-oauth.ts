/**
 * Direct LinkedIn OAuth Implementation
 * 
 * This bypasses Firebase's OpenID Connect to avoid Google API conflicts
 * Uses LinkedIn's OAuth 2.0 API directly
 */

// LinkedIn OAuth configuration
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_PROFILE_URL = 'https://api.linkedin.com/v2/userinfo';
const LINKEDIN_EMAIL_URL = 'https://api.linkedin.com/v2/userinfo'; // Email included in userinfo

export interface LinkedInProfile {
  sub: string; // User ID
  name?: string; // Full name
  given_name?: string; // First name
  family_name?: string; // Last name
  email?: string; // Email address
  picture?: string; // Profile picture URL
  email_verified?: boolean;
}

// Email is now included in LinkedInProfile from userinfo endpoint

/**
 * Start LinkedIn OAuth flow - redirects to LinkedIn
 */
export function initiateLinkedInAuth(redirectUri: string, state?: string) {
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('LinkedIn Client ID not configured');
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state || 'linkedin-auth',
    scope: 'profile email openid'
  });

  const authUrl = `${LINKEDIN_AUTH_URL}?${params.toString()}`;
  
  // Redirect to LinkedIn OAuth
  window.location.href = authUrl;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeLinkedInCode(
  code: string, 
  redirectUri: string
): Promise<{ accessToken: string }> {
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('LinkedIn OAuth credentials not configured');
  }

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn token exchange failed: ${error}`);
  }

  const data = await response.json();
  return { accessToken: data.access_token };
}

/**
 * Get LinkedIn user profile
 */
export async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  const response = await fetch(LINKEDIN_PROFILE_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn profile fetch failed: ${error}`);
  }

  return response.json();
}

/**
 * Get LinkedIn user email (now included in profile)
 */
export async function getLinkedInEmail(accessToken: string): Promise<string> {
  // Email is now included in the userinfo endpoint
  const profile = await getLinkedInProfile(accessToken);
  
  if (!profile.email) {
    throw new Error('No email found in LinkedIn profile');
  }

  return profile.email;
}