# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication with Google and LinkedIn OAuth, complete with confetti celebrations! 🎉

## Step 1: Create Firebase Project

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create New Project**:
   - Click "Create a project"
   - Name: "DealMecca" or your preferred name
   - Enable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Authentication

1. **Go to Authentication**:
   - In your Firebase project, click "Authentication" in the left sidebar
   - Click "Get started"

2. **Configure Sign-in Methods**:
   - Click "Sign-in method" tab
   - Enable the following providers:

### Google OAuth Setup
1. **Enable Google Provider** (Firebase handles everything automatically):
   - Click "Google" from the list
   - Toggle "Enable"
   - Select your project support email
   - Click "Save"

**⚠️ IMPORTANT**: Do NOT set up Google Cloud Console OAuth credentials separately! Firebase creates and manages the OAuth client automatically when you enable the Google provider. 

If you accidentally created OAuth credentials in Google Cloud Console, you can delete them - they're not needed for Firebase Auth.

### LinkedIn OAuth Setup
1. **Enable Generic OAuth Provider**:
   - Click "Add new provider"
   - Select "OpenID Connect"
   - Provider name: `linkedin`
   - Client ID: (get from LinkedIn Developer Console)
   - Client secret: (get from LinkedIn Developer Console)
   - Issuer (OpenID Connect issuer URL): `https://www.linkedin.com/oauth/openid`

2. **LinkedIn Developer Setup**:
   - Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
   - Create a new app
   - Add OAuth 2.0 redirect URLs:
     - `http://localhost:3001/__/auth/handler` (development)
     - `https://yourdomain.com/__/auth/handler` (production)
   - Request these permissions:
     - `openid`
     - `profile` 
     - `email`

## Step 3: Get Firebase Configuration

1. **Project Settings**:
   - Click the gear icon next to "Project Overview"
   - Click "Project settings"

2. **Add Web App**:
   - Scroll down to "Your apps"
   - Click the web icon `</>`
   - App nickname: "DealMecca Web"
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy Configuration**:
   - Copy the `firebaseConfig` object
   - You'll need these values for your `.env.local`

## Step 4: Update Environment Variables

Update your `.env.local` file with the Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key_here"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123:web:abc123"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-ABC123DEF4"
```

## Step 5: Update Root Layout (Optional)

If you want to use Firebase auth throughout your app, add the provider to your root layout:

```tsx
// app/layout.tsx
import { FirebaseProvider } from '@/components/providers/FirebaseProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
      </body>
    </html>
  )
}
```

## Step 6: Test the Authentication

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Visit Firebase Sign-in Page**:
   - Go to http://localhost:3001/auth/firebase-signin
   - Try signing in with Google and LinkedIn

3. **Check for Confetti**:
   - New users should see a massive confetti explosion 🎉
   - Returning users should see a gentle sparkle effect ✨
   - Each provider has its own themed colors

## Step 7: Production Setup

1. **Add Production Domains**:
   - In Firebase Console > Authentication > Settings
   - Add your production domain to "Authorized domains"

2. **Update OAuth Redirect URIs**:
   - Update Google OAuth redirect URIs in Google Cloud Console
   - Update LinkedIn redirect URIs in LinkedIn Developer Portal

3. **Environment Variables**:
   - Set the same Firebase environment variables in your production environment

## Available Confetti Celebrations

The system includes several celebration types:

- 🎆 **welcome-new-user**: Massive explosion for first-time signups
- ✨ **welcome-back**: Gentle sparkle for returning users
- 🔵 **google-signin**: Google brand colors (blue, green, red, yellow)
- 💼 **linkedin-signin**: LinkedIn blue theme
- 🏆 **subscription-upgrade**: Golden premium effect

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to Firebase Console > Authentication > Settings > Authorized domains

2. **LinkedIn OAuth not working**
   - Ensure you're using the correct OpenID Connect configuration
   - Check that your LinkedIn app has the right permissions

3. **Popup blocked**
   - Use the "redirect" option instead of popup
   - Check the checkbox on the sign-in page

4. **No confetti showing**
   - Check browser console for errors
   - Ensure the celebration trigger is being called

### Debug Mode:

Set `debug: true` in your Firebase config for detailed logging:

```typescript
// lib/firebase.ts
if (process.env.NODE_ENV === 'development') {
  auth.settings.appVerificationDisabledForTesting = true;
}
```

## Next Steps

Once authentication is working:
1. Test both Google and LinkedIn sign-in
2. Verify user data is syncing to your database
3. Check that confetti celebrations work
4. Set up production domains and credentials

## Files Created

This setup created the following files:
- `lib/firebase.ts` - Firebase configuration
- `lib/auth/firebase-auth.tsx` - Auth context and hooks
- `components/auth/ConfettiCelebration.tsx` - Confetti system
- `app/auth/firebase-signin/page.tsx` - Firebase sign-in page  
- `app/api/auth/firebase-sync/route.ts` - Database sync API
- `components/providers/FirebaseProvider.tsx` - Provider wrapper

You can now use Firebase Auth alongside or instead of NextAuth.js! 🚀