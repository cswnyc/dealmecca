# 🚨 Vercel Environment Variables Debug Checklist

## 📋 **Current Issue Analysis**
Production is **STILL** showing DATABASE_URL error even after setting environment variables.

**Error:** `the URL must start with the protocol postgresql:// or postgres://`

---

## 🔍 **DEBUG STEPS (Follow in Order)**

### **Step 1: Verify Environment Variables in Vercel Dashboard**

1. **Go to**: [Vercel Dashboard](https://vercel.com/dashboard)
2. **Click your project** → **Settings** → **Environment Variables**
3. **Look for these 4 variables:**

```bash
DATABASE_URL = postgresql://neondb_owner:npg_B3Sdq4aviYgN@...
DIRECT_URL = postgresql://neondb_owner:npg_B3Sdq4aviYgN@...
NEXTAUTH_SECRET = (32-character secret)
NEXTAUTH_URL = https://website-incne6jv0-cws-projects-e62034bb.vercel.app
```

**✅ Check that:**
- [ ] All 4 variables exist
- [ ] DATABASE_URL starts with `postgresql://`
- [ ] Environment is set to **Production** ✓
- [ ] No extra spaces or quotes around values

### **Step 2: Check for Common Issues**

**❌ Common Mistakes:**
```bash
# WRONG - Missing protocol
DATABASE_URL = neondb_owner:npg_B3Sdq4aviYgN@ep-wild-lake...

# WRONG - Extra quotes
DATABASE_URL = "postgresql://neondb_owner:..."

# WRONG - Wrong environment selected
Environment: Preview ❌ (should be Production ✓)
```

**✅ Correct Format:**
```bash
DATABASE_URL = postgresql://neondb_owner:npg_B3Sdq4aviYgN@ep-wild-lake-afcy495t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### **Step 3: Force New Deployment**

Even if variables are correct, Vercel might be using cached deployment:

1. **Go to Deployments tab**
2. **Click "Redeploy"** on latest deployment
3. **Wait 2-3 minutes** for completion
4. **Test again**

### **Step 4: Alternative - Trigger Build from CLI**

If dashboard redeploy doesn't work:

```bash
# Force new deployment with environment refresh
vercel --prod --force
```

### **Step 5: Check Build Logs**

If still failing:
1. **Go to Deployments**
2. **Click latest deployment**
3. **View Build Logs**
4. **Look for environment variable errors**

---

## 🎯 **Quick Test Commands**

After making changes, test these:

```bash
# Test health endpoint
curl https://website-incne6jv0-cws-projects-e62034bb.vercel.app/api/health

# Should return: {"status": "healthy"}
```

---

## 🔧 **If Still Not Working**

### **Nuclear Option - Delete & Re-add Variables:**

1. **Delete** all 4 environment variables
2. **Save changes**
3. **Re-add** them one by one with correct values
4. **Redeploy**

### **Alternative Database URL Format:**

If current format doesn't work, try:
```bash
# Remove channel_binding parameter
DATABASE_URL = postgresql://neondb_owner:npg_B3Sdq4aviYgN@ep-wild-lake-afcy495t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

---

## ✅ **Success Indicators**

You'll know it's fixed when:
- [ ] Health check returns `{"status": "healthy"}`
- [ ] Dashboard loads with data
- [ ] Organizations page shows companies
- [ ] Search functionality works 