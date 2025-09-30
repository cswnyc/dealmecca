# 🚀 Deploy DealMecca to Vercel - Quick Start

## ⚡ Quick Deployment (5 minutes)

### Step 1: Login to Vercel
```bash
vercel login
```
*Follow the prompts to authenticate with GitHub/email*

### Step 2: Deploy Application (OAuth-Safe)
```bash
# CRITICAL: Use domain alias for OAuth integrations
vercel --prod --alias getmecca.com

# OR use the convenient npm script:
npm run deploy:prod
```
*⚠️ NEVER use `vercel --prod` alone - it creates random URLs that break LinkedIn/Stripe OAuth*

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

## 🔐 OAuth Integration Requirements

### **Critical: Domain Consistency for OAuth**
OAuth providers (LinkedIn, Google, Stripe) require **exact domain matches** for security:

**✅ Registered OAuth Redirect URIs:**
- `https://getmecca.com/api/linkedin/callback`
- `https://getmecca.com/api/stripe/webhook`
- `http://localhost:3000/api/linkedin/callback` (development)

**❌ Common OAuth Deployment Mistakes:**
```bash
vercel --prod  # Creates: dealmecca-abc123.vercel.app (BREAKS OAUTH)
```

**✅ Correct OAuth Deployment:**
```bash
vercel --prod --alias getmecca.com  # Uses: getmecca.com (WORKS)
npm run deploy:prod                 # Automated version
```

### **Why This Matters:**
- **LinkedIn OAuth**: Only works on registered domains
- **Stripe Webhooks**: Configured for specific endpoints
- **Random URLs**: Cause "invalid_client" authentication failures
- **Security**: OAuth providers block unregistered redirect URIs

---

## 📚 Detailed Guides

- **Complete Guide**: `deployment/VERCEL_DEPLOYMENT_GUIDE.md`
- **Database Setup**: `npx tsx deployment/scripts/setup-neon-database.ts check`
- **Full Automation**: `npx tsx deployment/scripts/deploy-to-vercel.ts full`

---

## ✅ Pre-Deployment Checklist

### **Before Every Production Deployment:**
- [ ] **OAuth Check**: Using `vercel --prod --alias getmecca.com` or `npm run deploy:prod`
- [ ] **Environment Variables**: All OAuth secrets configured in Vercel
- [ ] **Database**: Connection string updated for production
- [ ] **Local Build**: `npm run build` succeeds locally
- [ ] **Type Check**: `npm run type-check` passes
- [ ] **Lint Check**: `npm run lint` passes

### **After Deployment Test:**
- [ ] **Homepage**: Loads correctly on getmecca.com
- [ ] **LinkedIn OAuth**: Sign-in works from `/auth/signup`
- [ ] **Stripe Integration**: Billing page functions properly
- [ ] **Database**: Company data displays correctly
- [ ] **Authentication**: User sessions persist correctly

### **Common Deployment Issues:**
| Issue | Cause | Solution |
|-------|-------|----------|
| LinkedIn OAuth fails | Random Vercel URL | Use `npm run deploy:prod` |
| Stripe webhooks broken | Wrong domain | Check Stripe dashboard settings |
| Database connection fails | Wrong connection string | Update DATABASE_URL in Vercel |
| Build fails | TypeScript errors | Run `npm run type-check` locally |

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