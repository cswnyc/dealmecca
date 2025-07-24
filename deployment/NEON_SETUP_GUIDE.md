# 🗄️ Neon Database Setup for DealMecca Production

## 📋 Quick Setup Checklist (5 minutes)

### Step 1: Create Neon Account & Project
1. **Visit Neon**: Go to [neon.tech](https://neon.tech)
2. **Sign Up**: Use GitHub account (recommended for Vercel integration)
3. **Create Project**: 
   - Name: `dealmecca-production`
   - Region: `US East (N. Virginia)` (closest to Vercel's primary region)
   - Database: `dealmecca`

### Step 2: Get Database Connection String
After creating the project, you'll see the connection details:

```bash
# Example format - yours will be different
DATABASE_URL="postgresql://alex:AbC123dEf456@ep-cool-darkness-123456.us-east-1.aws.neon.tech/dealmecca?sslmode=require"
```

**Copy this entire URL - you'll need it for the next steps.**

### Step 3: Test Database Connection Locally
```bash
# Set the DATABASE_URL temporarily for testing
export DATABASE_URL="your-neon-connection-string-here"

# Run our database setup checker
npx tsx deployment/scripts/setup-neon-database.ts check

# If connection works, run migrations
npx prisma db push

# Seed with sample data
npx prisma db seed
```

### Step 4: Configure Vercel Environment Variables
1. **Go to Vercel Dashboard**: Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Select Your Project**: Click on your DealMecca project
3. **Go to Settings**: Click Settings → Environment Variables
4. **Add Required Variables**:

```bash
# Database
DATABASE_URL=your-neon-connection-string-here
DIRECT_URL=your-neon-connection-string-here

# NextAuth
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://your-app.vercel.app

# Optional: Stripe (for payments)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Optional: Pusher (for real-time features)
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster
```

### Step 5: Redeploy Application
```bash
# Trigger a new deployment with updated environment variables
vercel --prod
```

---

## 🔧 Detailed Setup Instructions

### Creating Neon Account
1. **GitHub Integration**: Sign up with GitHub for seamless Vercel integration
2. **Free Tier**: Perfect for beta testing (500MB storage, 1 billion queries/month)
3. **Auto-scaling**: Database scales to zero when not in use

### Database Configuration
- **Connection Pooling**: Enabled by default
- **SSL**: Required and configured automatically
- **Backups**: Daily automatic backups included
- **Branching**: Git-like database branching for development

### Environment Variables Explained
- **DATABASE_URL**: Main connection string for Prisma
- **DIRECT_URL**: Direct connection for migrations (same as DATABASE_URL for Neon)
- **NEXTAUTH_SECRET**: Random string for JWT encryption (generate with `openssl rand -base64 32`)
- **NEXTAUTH_URL**: Your production domain

---

## 🚨 Common Issues & Solutions

### Issue: "Connection refused"
**Solution**: Ensure the DATABASE_URL includes `?sslmode=require`

### Issue: "Database does not exist"
**Solution**: The database name in the URL must match what you created in Neon

### Issue: "Migration failed"
**Solution**: Run `npx prisma db push` instead of `npx prisma migrate deploy` for Neon

### Issue: "Vercel function timeout"
**Solution**: Database is likely cold-starting. Try the request again.

---

## ✅ Verification Steps

1. **Database Connection**: `npx tsx deployment/scripts/setup-neon-database.ts check`
2. **Migration Status**: `npx prisma db status`
3. **Data Seeding**: `npx prisma db seed`
4. **Production Health**: Visit `https://your-app.vercel.app/api/health`

---

## 📞 Need Help?

If you encounter issues:
1. Check the [Neon Documentation](https://neon.tech/docs)
2. Visit [Vercel Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
3. Run our diagnostic script: `npx tsx deployment/scripts/setup-neon-database.ts diagnose` 