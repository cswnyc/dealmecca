# 🔥 Vercel Environment Variables Setup (Firebase Migration)

## ⚠️ UPDATED FOR FIREBASE AUTHENTICATION

**Go to:** [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

### 🚨 CRITICAL: Remove Old NextAuth Variables First:
- ❌ Remove `NEXTAUTH_URL` (no longer needed)
- ❌ Remove any OAuth provider variables (Google/LinkedIn client IDs/secrets)

### 🔥 Required Firebase Variables (Copy exactly):

```bash
# Database (keep existing)
DATABASE_URL=postgresql://neondb_owner:npg_B3Sdq4aviYgN@ep-wild-lake-afcy495t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

DIRECT_URL=postgresql://neondb_owner:npg_B3Sdq4aviYgN@ep-wild-lake-afcy495t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secret (rename from NEXTAUTH_SECRET)
JWT_SECRET=4WBgfMl+Z+5LXSYwQlY7Pgya3vsJBV6BpHZxC/4uXzs=

# Firebase Configuration (NEW - REQUIRED)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBDw_eWB7SfwD3ACzER3_GJwge9hJFNnbY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dealmecca-6cea8.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dealmecca-6cea8
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dealmecca-6cea8.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1006862468059
NEXT_PUBLIC_FIREBASE_APP_ID=1:1006862468059:web:55b82a0407900fc5b59dfe
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-32DLKJENW3
```

### Optional Variables (for full features):

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=us2
```

## 📋 STEP-BY-STEP INSTRUCTIONS:

### 1. Open Vercel Dashboard
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Click on your DealMecca project
- Go to **Settings** tab
- Click **Environment Variables** in the sidebar

### 2. Add Each Variable
For each variable above:
1. Click **"Add New"**
2. **Name**: Enter the variable name (e.g., `DATABASE_URL`)
3. **Value**: Enter the variable value
4. **Environment**: Select **"Production"**
5. Click **"Save"**

### 3. Critical Variables to Add First:
1. ✅ `DATABASE_URL` 
2. ✅ `DIRECT_URL`
3. ✅ `NEXTAUTH_SECRET`
4. ✅ `NEXTAUTH_URL`

### 4. After Adding Variables:
- Click **"Redeploy"** or run: `vercel --prod`
- Test at: https://website-qszx7bymm-cws-projects-e62034bb.vercel.app/api/health

## ✅ Database Status:
- ✅ **Neon Database**: Connected and operational
- ✅ **Schema**: Successfully deployed
- ✅ **Sample Data**: Seeded
- ✅ **Connection**: Tested and working

## 🚀 Ready for Production!

Your DealMecca application is ready for beta testing once you add these environment variables to Vercel. 