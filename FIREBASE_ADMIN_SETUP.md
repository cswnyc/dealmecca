# Firebase Admin SDK Setup Guide

## 🎯 Current Status
- ✅ LinkedIn OAuth: Working perfectly
- 🔧 Firebase Admin: Needs credential configuration
- ✅ User Profile Extraction: Complete with JWT decoding

## 📋 Setup Steps

### 1. Get Firebase Admin SDK Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `dealmecca-6cea8`
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file

### 2. Extract Credentials from JSON

The downloaded JSON will look like:
```json
{
  "type": "service_account",
  "project_id": "dealmecca-6cea8",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@dealmecca-6cea8.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

### 3. Update Environment Variables

Update `.env.local` with the actual values:

```env
# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=dealmecca-6cea8
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@dealmecca-6cea8.iam.gserviceaccount.com
# IMPORTANT: Escape newlines as \n and put entire key on one line
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq...\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Format Private Key Correctly

The private key must be on **one line** with **escaped newlines**:

❌ **Wrong** (multiple lines):
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkq...
...
-----END PRIVATE KEY-----"
```

✅ **Correct** (one line with \n):
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq...\n...\n-----END PRIVATE KEY-----\n"
```

### 5. Test Configuration

After updating the credentials, test with:
```bash
curl http://localhost:3000/api/linkedin/test-firebase
```

Should return valid configuration details without errors.

### 6. Complete LinkedIn → Firebase Flow

Once Firebase Admin is configured, the complete flow will work:

1. **LinkedIn OAuth** → Get user profile from JWT
2. **Firebase Admin** → Create custom token with LinkedIn user ID
3. **Client-side** → Sign in to Firebase with custom token
4. **Result** → User authenticated in both LinkedIn and Firebase

## 🔧 Alternative: Use JWT Directly

If Firebase Admin SDK is not immediately available, you can use the LinkedIn JWT directly:

```javascript
// The LinkedIn ID token contains complete user profile
const userProfile = {
  sub: "TrhvJk8H3h",           // LinkedIn user ID
  name: "Chris Wong",          // Full name
  email: "cswnyc@gmail.com",   // Verified email
  picture: "https://..."       // Profile photo
}
```

This provides all necessary user authentication data without Firebase custom tokens.

## 📊 Current Test Endpoints

- `GET /api/linkedin/test-firebase` - Test Firebase configuration
- `GET /api/linkedin/start-no-pkce` - Working LinkedIn OAuth
- `GET /api/linkedin/decode-jwt?token=JWT` - Extract user profile from LinkedIn JWT
- `GET /auth/linkedin-debug` - Complete OAuth testing interface

## ✅ Production Ready Options

1. **Option 1**: Complete Firebase integration with custom tokens
2. **Option 2**: Use LinkedIn JWT directly for authentication
3. **Option 3**: Hybrid approach with both systems

All options provide secure, production-ready authentication with verified user profiles.