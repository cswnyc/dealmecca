# LinkedIn Authentication Testing Guide

## Overview
LinkedIn OAuth works in **production** but typically **not in local development** due to redirect URI restrictions.

## Why LinkedIn Doesn't Work Locally

LinkedIn requires **exact redirect URI whitelisting** in their Developer Console:
- ✅ Production URL is whitelisted: `https://yourdomain.com/api/linkedin/callback`
- ❌ Localhost is NOT whitelisted by default: `http://localhost:3000/api/linkedin/callback`

When LinkedIn receives an OAuth request with an un-whitelisted redirect URI, it **rejects the request before redirecting back**, so our callback code never runs.

## Recommended Testing Approach

### For Local Development:
- ✅ **Test Google OAuth** - Works locally without restrictions
- ✅ **Test Email/Password auth** - Works locally without restrictions
- ❌ **Skip LinkedIn OAuth** - Test in production instead

### For Production/Staging:
- ✅ **Test LinkedIn OAuth** - Fully functional
- ✅ **Test all auth flows** - Complete end-to-end testing

## If You MUST Test LinkedIn Locally

### Option 1: Add Localhost to LinkedIn Whitelist (Not Recommended)
1. Go to [LinkedIn Developer Console](https://www.linkedin.com/developers/apps)
2. Select your DealMecca app
3. Navigate to "Auth" tab
4. Under "Authorized redirect URLs", add:
   ```
   http://localhost:3000/api/linkedin/callback
   ```
5. Save changes

**Note:** This exposes your OAuth app to localhost testing, which can be a security concern in shared environments.

### Option 2: Use Tunneling Service (Advanced)
Use a service like ngrok to create a public HTTPS URL that tunnels to localhost:
```bash
ngrok http 3000
```
Then add the ngrok URL to LinkedIn's whitelist.

## Current Implementation Status

✅ **Email normalization** - Prevents duplicate users from case variations  
✅ **Google OAuth** - Works in all environments  
✅ **Email/Password** - Works in all environments  
✅ **LinkedIn OAuth** - Works in production only (by design)  
✅ **Pending user redirect** - Fixed for all auth methods  

## Testing Checklist

### Local Development (http://localhost:3000)
- [x] Email/Password sign-in → works
- [x] Email/Password sign-up → works  
- [x] Google OAuth sign-in → works
- [x] Google OAuth sign-up → works
- [ ] LinkedIn OAuth → **test in production**

### Production (https://yourdomain.com)
- [x] Email/Password sign-in → works
- [x] Email/Password sign-up → works
- [x] Google OAuth sign-in → works
- [x] Google OAuth sign-up → works
- [x] LinkedIn OAuth sign-in → works
- [x] LinkedIn OAuth sign-up → works

## Related Files

- `/app/api/linkedin/start/route.ts` - OAuth initiation
- `/app/api/linkedin/callback/route.ts` - OAuth callback handler
- `/app/api/auth/linkedin-callback/route.ts` - Legacy callback (deprecated)
- `/components/auth/LinkedInSignInButton.tsx` - UI component

## Support

If LinkedIn OAuth fails in production:
1. Verify redirect URI is whitelisted in LinkedIn Console
2. Check environment variables (`LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`)
3. Review server logs for specific error messages
4. Ensure LinkedIn app has correct scopes: `openid profile email`
