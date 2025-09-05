# 🚨 URGENT VERCEL ENVIRONMENT VARIABLES FIX

## 📋 COPY-PASTE THESE EXACT VALUES INTO VERCEL

**Go to: Vercel Dashboard → dealmecca → Settings → Environment Variables**

**Click "Add New" for each variable below:**

---

### Variable 1:
```
Name: STRIPE_SECRET_KEY
Value: sk_test_placeholder_build_only_not_real
Environment: Production
```

### Variable 2:
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_placeholder_build_only_not_real
Environment: Production
```

### Variable 3:
```
Name: DATABASE_URL
Value: [REPLACE_WITH_YOUR_ACTUAL_NEON_DATABASE_URL]
Environment: Production
```

### Variable 4:
```
Name: NEXTAUTH_SECRET
Value: eHUMoYSBd/p7zAx6Fek6PTgNHceytamkAmIvPGGD5ok=
Environment: Production
```

### Variable 5:
```
Name: NEXTAUTH_URL
Value: https://dealmecca-replace-with-actual.vercel.app
Environment: Production
```

### Variable 6:
```
Name: NODE_ENV
Value: production
Environment: Production
```

---

## ⚠️ CRITICAL STEPS:

1. **Add ALL 6 variables above**
2. **Click "Save" after each one**
3. **Go to Deployments tab**
4. **Click "Redeploy" on latest deployment**
5. **Wait for build to complete**

## 🎯 SUCCESS INDICATOR:
Build should reach "✓ Finalizing page optimization" instead of failing at "Collecting page data" 