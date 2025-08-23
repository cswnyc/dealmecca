# 🔐 OAuth Setup Guide - Google & LinkedIn

## 🎯 **IMPLEMENTATION COMPLETE**

DealMecca now supports **Google OAuth** and **LinkedIn OAuth** for seamless social authentication.

---

## ✅ **WHAT'S IMPLEMENTED:**

### **1. NextAuth Configuration**
- ✅ **Google OAuth Provider** configured
- ✅ **LinkedIn OAuth Provider** configured  
- ✅ **User creation & linking** for both providers
- ✅ **Session management** with JWT strategy
- ✅ **Database integration** with Prisma

### **2. UI Components** 
- ✅ **Sign-in page** with Google & LinkedIn buttons
- ✅ **Sign-up page** with social login options
- ✅ **Professional button styling** with brand icons
- ✅ **Error handling** and loading states

### **3. Database Integration**
- ✅ **Automatic user creation** for new OAuth users
- ✅ **Account linking** for existing users
- ✅ **Role assignment** (defaults to FREE tier)
- ✅ **Session persistence** across providers

---

## 🛠️ **OAUTH PROVIDER SETUP:**

### **Google OAuth Setup**

#### **Step 1: Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API:
   - **APIs & Services** → **Library**
   - Search "Google+ API" → **Enable**

#### **Step 2: Create OAuth Credentials**
1. **APIs & Services** → **Credentials** 
2. **Create Credentials** → **OAuth 2.0 Client IDs**
3. **Application type**: Web application
4. **Name**: DealMecca OAuth

#### **Step 3: Configure URLs**
```
Authorized JavaScript origins:
- http://localhost:3000 (development)
- https://your-domain.com (production)

Authorized redirect URIs:
- http://localhost:3000/api/auth/callback/google (development)
- https://your-domain.com/api/auth/callback/google (production)
```

#### **Step 4: Copy Credentials**
```bash
GOOGLE_CLIENT_ID="123456789-abc123.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcd1234567890"
```

---

### **LinkedIn OAuth Setup**

#### **Step 1: LinkedIn Developer Console**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. **Create App** or select existing app
3. Fill out app details:
   - **App name**: DealMecca
   - **LinkedIn Page**: Your company page
   - **Privacy policy URL**: https://your-domain.com/privacy
   - **App logo**: Upload DealMecca logo

#### **Step 2: OAuth Settings**
1. Go to **Auth** tab
2. **OAuth 2.0 scopes**: Select these permissions:
   - ✅ **openid** (required)
   - ✅ **profile** (required) 
   - ✅ **email** (required)

#### **Step 3: Redirect URLs**
```
OAuth 2.0 Redirect URLs:
- http://localhost:3000/api/auth/callback/linkedin (development)
- https://your-domain.com/api/auth/callback/linkedin (production)
```

#### **Step 4: Copy Credentials**
```bash
LINKEDIN_CLIENT_ID="86abc123456789"
LINKEDIN_CLIENT_SECRET="WPL_AP1.abc123def456.xyz789"
```

---

## 🔧 **ENVIRONMENT VARIABLES:**

### **Required Variables**
Add these to your `.env.local` (development) and Vercel environment (production):

```bash
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"  # Change for production
NEXTAUTH_SECRET="your-nextauth-secret-key-change-this-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-google-client-secret"

# LinkedIn OAuth  
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dealmecca"
```

### **Production Environment (Vercel)**
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add each variable with **Environment**: Production
3. Update URLs to use your production domain

---

## 🧪 **TESTING THE IMPLEMENTATION:**

### **Local Development Test**
1. **Start the server**: `npm run dev`
2. **Visit**: http://localhost:3000/auth/signin
3. **Test Google OAuth**:
   - Click "Continue with Google"
   - Should redirect to Google login
   - After login, should redirect to `/dashboard`
4. **Test LinkedIn OAuth**:
   - Click "Continue with LinkedIn" 
   - Should redirect to LinkedIn login
   - After login, should redirect to `/dashboard`

### **Production Test**
1. **Deploy** with environment variables set
2. **Visit**: https://your-domain.com/auth/signin
3. **Test both providers** with production URLs

---

## 🔍 **TROUBLESHOOTING:**

### **Common Issues**

#### **"Invalid redirect URI" Error**
- ✅ **Check URLs** in OAuth provider settings
- ✅ **Verify protocol** (http vs https)
- ✅ **Check trailing slashes** (remove them)

#### **"Invalid client" Error**  
- ✅ **Verify client ID** in environment variables
- ✅ **Check client secret** is correct
- ✅ **Ensure no extra spaces** in .env values

#### **"Scope error" for LinkedIn**
- ✅ **Verify scopes** in LinkedIn app: `openid profile email`
- ✅ **Check app review status** (may need approval)

#### **NextAuth Session Issues**
- ✅ **Clear browser cookies** and try again
- ✅ **Check NEXTAUTH_SECRET** is set
- ✅ **Verify NEXTAUTH_URL** matches your domain

### **Debug Mode**
Enable NextAuth debug logging:
```bash
NEXTAUTH_DEBUG=true
```

---

## 🚀 **DEPLOYMENT CHECKLIST:**

### **Pre-Deployment**
- [ ] **Google OAuth** app configured with production URLs
- [ ] **LinkedIn OAuth** app configured with production URLs  
- [ ] **Environment variables** set in Vercel
- [ ] **Database** accessible from production
- [ ] **NEXTAUTH_URL** set to production domain

### **Post-Deployment**
- [ ] **Test Google login** on production
- [ ] **Test LinkedIn login** on production
- [ ] **Verify user creation** in database
- [ ] **Check session persistence** after login
- [ ] **Test logout functionality**

---

## 📊 **AUTHENTICATION FLOW:**

### **New User Flow**
1. **User clicks** "Continue with Google/LinkedIn"
2. **Redirected** to OAuth provider
3. **User grants permission** 
4. **Redirected back** to DealMecca with auth code
5. **NextAuth exchanges** code for access token
6. **User profile fetched** from provider
7. **New user created** in database with:
   - Email from OAuth provider
   - Name from OAuth provider  
   - Role: 'FREE'
   - SubscriptionTier: 'FREE'
8. **Session created** and user redirected to dashboard

### **Existing User Flow**
1. **User clicks** social login button
2. **OAuth flow** completes
3. **User found** in database by email
4. **Session created** with existing user data
5. **Redirected** to dashboard

---

## 🔐 **SECURITY FEATURES:**

### **Built-in Security**
- ✅ **CSRF protection** via NextAuth
- ✅ **State validation** in OAuth flow
- ✅ **Secure session cookies** with httpOnly
- ✅ **JWT token encryption** with NEXTAUTH_SECRET
- ✅ **Email verification** via OAuth providers

### **Production Security**
- ✅ **HTTPS enforcement** for OAuth redirects
- ✅ **Secure cookie settings** for production
- ✅ **Domain-specific** cookie configuration
- ✅ **Rate limiting** via middleware (already implemented)

---

## 🎉 **SUCCESS! OAUTH IMPLEMENTATION COMPLETE**

**Google OAuth** and **LinkedIn OAuth** are now fully implemented and ready for production use. Users can sign up and sign in using their professional accounts, making DealMecca more accessible to media industry professionals.

### **Benefits:**
- ✅ **Faster user onboarding** - no password creation needed
- ✅ **Professional authentication** - LinkedIn for industry networking
- ✅ **Reduced friction** - familiar OAuth providers  
- ✅ **Better security** - OAuth handles password security
- ✅ **Enhanced UX** - seamless social login experience

**Ready for production deployment!** 🚀
