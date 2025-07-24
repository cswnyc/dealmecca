# 🚀 DealMecca Vercel Production Deployment Guide

## 📋 Overview

This guide will walk you through deploying DealMecca to Vercel with a production database for the beta user testing launch.

**Deployment Stack:**
- **Frontend/Backend**: Vercel (Next.js)
- **Database**: Neon PostgreSQL (recommended)
- **Domain**: Custom domain or Vercel subdomain
- **Environment**: Production configuration

---

## 🗄️ STEP 1: Set Up Production Database (Neon)

### Why Neon?
- ✅ Free tier with generous limits
- ✅ Excellent Vercel integration
- ✅ Serverless PostgreSQL
- ✅ Automatic scaling and branching
- ✅ Built-in connection pooling

### 1.1 Create Neon Account & Project

1. **Go to Neon**: Visit [neon.tech](https://neon.tech)
2. **Sign Up**: Create account with GitHub (recommended for Vercel integration)
3. **Create Project**: 
   - Project Name: `dealmecca-production`
   - Database Name: `dealmecca`
   - Region: Choose closest to your users (US East recommended)

### 1.2 Get Database Connection Details

1. **Navigate to Dashboard**: Go to your project dashboard
2. **Connection Details**: Click "Connection Details" 
3. **Copy DATABASE_URL**: Copy the full PostgreSQL connection string
   ```
   postgresql://username:password@host.neon.tech/dealmecca?sslmode=require
   ```
4. **Save Credentials**: Store these securely for environment setup

### 1.3 Configure Connection Pooling (Optional but Recommended)

1. **Enable Pooling**: In Neon dashboard, enable connection pooling
2. **Pool Mode**: Set to "Transaction" for Next.js compatibility
3. **Pool Size**: Start with 20 connections

---

## 🌐 STEP 2: Deploy to Vercel

### 2.1 Prepare Local Environment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Initialize project (run from project root)
vercel
```

### 2.2 Configure Environment Variables

Create production environment file:

```bash
# Copy template
cp deployment/production.env.example .env.production

# Edit with your values
nano .env.production
```

**Required Environment Variables:**

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXTAUTH_URL=https://your-app.vercel.app

# Database (from Neon)
DATABASE_URL=postgresql://username:password@host.neon.tech/dealmecca?sslmode=require
DIRECT_URL=postgresql://username:password@host.neon.tech/dealmecca?sslmode=require

# Authentication
NEXTAUTH_SECRET=your-super-secure-secret-32-chars-minimum
JWT_SECRET=your-jwt-secret-32-chars-minimum

# Stripe (use test keys for beta)
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Pusher
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-pusher-cluster
```

### 2.3 Add Environment Variables to Vercel

```bash
# Add environment variables via CLI
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
# ... add all required variables

# Or use Vercel dashboard:
# 1. Go to project settings
# 2. Environment Variables tab
# 3. Add each variable for Production environment
```

### 2.4 Deploy Application

```bash
# Deploy to production
vercel --prod

# Follow prompts:
# - Link to existing project or create new
# - Set up project settings
# - Deploy
```

---

## 🗄️ STEP 3: Database Setup & Migration

### 3.1 Run Database Migrations

```bash
# Set production database URL locally
export DATABASE_URL="your-neon-database-url"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status
```

### 3.2 Seed Production Database

```bash
# Run seed script
npx prisma db seed

# Verify data
npx prisma studio
```

### 3.3 Test Database Connection

```bash
# Test connection
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Company\";"
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\";"
```

---

## ✅ STEP 4: Verify Deployment

### 4.1 Basic Functionality Check

1. **Visit Your Site**: Go to your Vercel URL
2. **Test Homepage**: Ensure it loads without errors
3. **Test Authentication**: Try signup/signin flows
4. **Test API**: Check `/api/health` endpoint
5. **Test Database**: Verify data loads in company listings

### 4.2 Run Deployment Verification

```bash
# Run verification script against production
npx tsx deployment/scripts/post-deployment-verification.ts https://your-app.vercel.app
```

### 4.3 Performance Check

1. **Lighthouse Audit**: Run in Chrome DevTools
2. **Response Times**: Check API endpoint speeds
3. **Database Performance**: Monitor query times in Neon dashboard

---

## 🔧 STEP 5: Custom Domain Setup (Optional)

### 5.1 Add Custom Domain

1. **Vercel Dashboard**: Go to project settings
2. **Domains Tab**: Add your custom domain
3. **DNS Configuration**: Follow Vercel's DNS instructions
4. **SSL Certificate**: Vercel automatically provisions SSL

### 5.2 Update Environment Variables

```bash
# Update NEXTAUTH_URL with custom domain
vercel env add NEXTAUTH_URL production https://yourdomain.com
vercel env add NEXT_PUBLIC_APP_URL production https://yourdomain.com
```

---

## 📊 STEP 6: Monitoring & Analytics

### 6.1 Enable Vercel Analytics

1. **Vercel Dashboard**: Go to Analytics tab
2. **Enable Analytics**: Turn on Web Analytics
3. **Speed Insights**: Enable Speed Insights

### 6.2 Set Up Error Monitoring

Consider adding error tracking:
- **Sentry**: For error monitoring
- **LogRocket**: For session replay
- **Vercel Functions**: Built-in monitoring

---

## 🚨 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Check build logs in Vercel dashboard
# Common fixes:
npm run build  # Test build locally first

# Environment variable issues
vercel env ls  # Check all variables are set
```

#### Database Connection Issues
```bash
# Test connection string
psql "postgresql://username:password@host.neon.tech/dealmecca?sslmode=require"

# Check connection pooling settings in Neon
# Verify SSL mode is set to 'require'
```

#### Authentication Issues
```bash
# Verify NEXTAUTH_URL matches deployment URL
# Check NEXTAUTH_SECRET is set and long enough (32+ chars)
# Ensure callback URLs are correctly configured
```

### Performance Issues
```bash
# Check Neon dashboard for query performance
# Monitor Vercel function execution times
# Use Vercel Speed Insights for frontend performance
```

---

## 📋 Pre-Launch Checklist

### Technical Verification
- [ ] Site loads without errors
- [ ] Authentication works (signup/signin)
- [ ] Database connection successful
- [ ] API endpoints responding
- [ ] Health check passes
- [ ] SSL certificate active
- [ ] Environment variables configured

### Content Verification
- [ ] Company data loaded (100+ companies)
- [ ] User roles and permissions working
- [ ] Search functionality operational
- [ ] Forum features accessible
- [ ] Event listings displayed
- [ ] Admin panel functional

### Beta Testing Preparation
- [ ] Known issues documented
- [ ] Feedback system operational
- [ ] User onboarding materials ready
- [ ] Support channels configured
- [ ] Monitoring and analytics enabled

---

## 🔄 Deployment Commands Reference

```bash
# Quick deployment
vercel --prod

# Environment management
vercel env ls
vercel env add VARIABLE_NAME
vercel env rm VARIABLE_NAME

# Domain management
vercel domains ls
vercel domains add yourdomain.com

# Project management
vercel projects ls
vercel link

# Logs and debugging
vercel logs
vercel inspect [deployment-url]
```

---

## 📞 Support & Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Community
- [Vercel Discord](https://vercel.com/discord)
- [Neon Discord](https://discord.gg/neon)

### Monitoring
- Vercel Dashboard: Real-time metrics
- Neon Dashboard: Database performance
- Uptime monitoring: Consider UptimeRobot

---

**🎉 Ready for Beta Launch!**

Once all steps are complete, your DealMecca application will be live and ready for beta user testing. The combination of Vercel and Neon provides a robust, scalable foundation for your professional networking platform.

---

*Last Updated: January 20, 2025*  
*Version: 1.0* 