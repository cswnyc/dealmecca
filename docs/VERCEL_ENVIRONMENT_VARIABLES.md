# 📋 VERCEL DASHBOARD ENVIRONMENT VARIABLES

## 🚀 EXACT COPY-PASTE VALUES FOR VERCEL DASHBOARD

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

### ⭐ ESSENTIAL VARIABLES (Set these first)

**Add each variable individually:**

---

**Variable 1:**
```
Name: DATABASE_URL
Value: [REPLACE_WITH_YOUR_NEON_CONNECTION_STRING]
Environment: Production
```
*Example: `postgresql://user:pass@ep-wild-lake-afcy495t.us-west-2.aws.neon.tech/neondb?sslmode=require`*

---

**Variable 2:**
```
Name: NEXTAUTH_SECRET
Value: eHUMoYSBd/p7zAx6Fek6PTgNHceytamkAmIvPGGD5ok=
Environment: Production
```
*✅ Ready-to-use secure secret (copy exactly)*

---

**Variable 3:**
```
Name: NEXTAUTH_URL
Value: [REPLACE_WITH_YOUR_VERCEL_DOMAIN]
Environment: Production
```
*Example: `https://dealmecca-abc123.vercel.app`*

---

**Variable 4:**
```
Name: NODE_ENV
Value: production
Environment: Production
```

---

### 🔧 IMPORTANT VARIABLES (For full functionality)

**Variable 5:**
```
Name: GOOGLE_CLIENT_ID
Value: [YOUR_GOOGLE_CLIENT_ID]
Environment: Production
```
*Get from: Google Cloud Console → Credentials*

---

**Variable 6:**
```
Name: GOOGLE_CLIENT_SECRET
Value: [YOUR_GOOGLE_CLIENT_SECRET]
Environment: Production
```
*Get from: Google Cloud Console → Credentials*

---

**Variable 7:**
```
Name: STRIPE_SECRET_KEY
Value: [YOUR_STRIPE_SECRET_KEY]
Environment: Production
```
*Example: `sk_test_abcd1234567890...`*

---

**Variable 8:**
```
Name: STRIPE_WEBHOOK_SECRET
Value: [YOUR_STRIPE_WEBHOOK_SECRET]
Environment: Production
```
*Example: `whsec_abcd1234567890...`*

---

### 💡 OPTIONAL VARIABLES (Real-time features)

**Variable 9:**
```
Name: PUSHER_APP_ID
Value: [YOUR_PUSHER_APP_ID]
Environment: Production
```

**Variable 10:**
```
Name: PUSHER_KEY
Value: [YOUR_PUSHER_KEY]
Environment: Production
```

**Variable 11:**
```
Name: PUSHER_SECRET
Value: [YOUR_PUSHER_SECRET]
Environment: Production
```

**Variable 12:**
```
Name: NEXT_PUBLIC_PUSHER_KEY
Value: [YOUR_PUSHER_KEY]
Environment: Production
```
*Same value as PUSHER_KEY*

---

## 🔐 SECURE SECRETS (Ready to Use)

**These are cryptographically secure and ready for production:**

```bash
NEXTAUTH_SECRET=eHUMoYSBd/p7zAx6Fek6PTgNHceytamkAmIvPGGD5ok=
JWT_SECRET=CDErOF54F/qXRrhCJ6hOxJyzV4YHStta6+64988RAz4=
```

## 🎯 MINIMUM VIABLE SETUP

**For basic functionality, you only need these 4 variables:**

1. `DATABASE_URL` - Your Neon PostgreSQL connection
2. `NEXTAUTH_SECRET` - `eHUMoYSBd/p7zAx6Fek6PTgNHceytamkAmIvPGGD5ok=`
3. `NEXTAUTH_URL` - Your Vercel domain
4. `NODE_ENV` - `production`

## ✅ VALIDATION

**After setting variables, run:**
```bash
node scripts/validate-env.js
```

**Expected output:**
```
✅ All validation checks passed!
🚀 Deploy with confidence!
```

## 🚀 DEPLOYMENT READY

Once you've set the essential variables:

1. **Redeploy your app** in Vercel dashboard
2. **Test endpoints:**
   - `https://your-app.vercel.app/api/health`
   - `https://your-app.vercel.app/api/orgs/companies`
3. **Verify frontend** shows companies and contacts data

Your DealMecca platform will be fully operational! 🎉 