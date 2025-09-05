# 🚀 Deploy DealMecca to Vercel - Quick Start

## ⚡ Quick Deployment (5 minutes)

### Step 1: Login to Vercel
```bash
vercel login
```
*Follow the prompts to authenticate with GitHub/email*

### Step 2: Deploy Application
```bash
npx tsx deployment/scripts/vercel-quick-deploy.ts
```
*This will build and deploy your app to Vercel*

### Step 3: Set Up Database (Neon - Recommended)
1. **Create Neon Account**: Go to [neon.tech](https://neon.tech)
2. **Create Project**: Name it `dealmecca-production`
3. **Copy Connection String**: Something like:
   ```
   postgresql://username:password@host.neon.tech/dealmecca?sslmode=require
   ```

### Step 4: Configure Environment Variables
Go to your Vercel dashboard → Project Settings → Environment Variables

**Required Variables:**
```bash
DATABASE_URL=postgresql://username:password@host.neon.tech/dealmecca?sslmode=require
NEXTAUTH_SECRET=your-32-char-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
```

**Generate secrets:**
```bash
openssl rand -base64 32  # For NEXTAUTH_SECRET
```

### Step 5: Run Database Migrations
```bash
export DATABASE_URL="your-neon-database-url"
npx prisma migrate deploy
npx prisma db seed
```

### Step 6: Test Your Deployment
Visit your Vercel URL and verify:
- ✅ Homepage loads
- ✅ Authentication works
- ✅ Company data loads

---

## 📚 Detailed Guides

- **Complete Guide**: `deployment/VERCEL_DEPLOYMENT_GUIDE.md`
- **Database Setup**: `npx tsx deployment/scripts/setup-neon-database.ts check`
- **Full Automation**: `npx tsx deployment/scripts/deploy-to-vercel.ts full`

---

## 🆘 Need Help?

**Common Issues:**
- Not logged in: `vercel login`
- Build fails: `npm run build` (test locally first)
- Database issues: Check connection string format
- Environment variables: Use Vercel dashboard to add them

**Get Support:**
- Check `deployment/VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions
- Run automated checks: `npx tsx deployment/scripts/deploy-to-vercel.ts check`

---

## 🎯 What's Deployed

✅ **Full-Stack Application**: Next.js 15 with App Router  
✅ **Authentication**: NextAuth.js with credentials  
✅ **Database**: PostgreSQL with Prisma ORM  
✅ **Real-time Features**: Pusher integration  
✅ **Payment Processing**: Stripe integration  
✅ **Professional UI**: Modern responsive design  
✅ **100+ Companies**: Pre-seeded database  
✅ **Beta Testing Ready**: Complete user testing infrastructure  

---

*🚀 Ready to launch your professional networking platform!* 