# 🔐 Vercel Environment Variables Setup

## 📋 COPY THESE TO VERCEL DASHBOARD

**Go to:** [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

### Required Variables (Copy exactly):

```bash
DATABASE_URL=postgresql://neondb_owner:npg_B3Sdq4aviYgN@ep-wild-lake-afcy495t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

DIRECT_URL=postgresql://neondb_owner:npg_B3Sdq4aviYgN@ep-wild-lake-afcy495t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEXTAUTH_SECRET=4WBgfMl+Z+5LXSYwQlY7Pgya3vsJBV6BpHZxC/4uXzs=

NEXTAUTH_URL=https://website-qszx7bymm-cws-projects-e62034bb.vercel.app
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