# 🔐 **DealMecca Login Troubleshooting Guide**

## **Current Status**
✅ **Server**: Running on http://localhost:3000  
✅ **Database**: All user accounts exist and have valid passwords  
✅ **API**: Authentication endpoints responding correctly  
✅ **Test Results**: All credentials validated successfully  

---

## **🔍 Step-by-Step Troubleshooting**

### **1. Verify Server is Running**
```bash
# Check if server is running
curl -s http://localhost:3000/api/auth/session

# Should return: {}
```

### **2. Clear Browser Cache & Cookies**
1. **Open Chrome/Firefox Developer Tools** (F12)
2. **Go to Application tab → Storage**
3. **Clear all cookies for localhost:3000**
4. **Clear Local Storage and Session Storage**
5. **Hard refresh** (Ctrl+Shift+R / Cmd+Shift+R)

### **3. Test Login Credentials**

**Try these accounts in order:**

#### **Pro User (Recommended)**
- **Email**: `pro@dealmecca.pro`
- **Password**: `password123`

#### **Admin User**
- **Email**: `admin@dealmecca.pro`
- **Password**: `password123`

#### **Free User**
- **Email**: `free@dealmecca.pro`
- **Password**: `password123`

### **4. Browser Console Debug**
1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Try logging in** and watch for errors
4. **Look for these error types**:
   - Network errors (red text)
   - Authentication failures
   - CSRF token issues
   - JavaScript errors

### **5. Network Tab Debug**
1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Try logging in**
4. **Look for these requests**:
   - POST to `/api/auth/callback/credentials`
   - Response should be 200 or 302
   - Check response headers for session cookies

---

## **🌐 Manual Testing Steps**

### **Option A: Fresh Browser Session**
1. **Open incognito/private window**
2. **Go to**: http://localhost:3000/auth/signin
3. **Enter credentials**: `pro@dealmecca.pro` / `password123`
4. **Click "Sign In"**

### **Option B: Different Browser**
1. **Try Safari, Firefox, or Edge**
2. **Same steps as Option A**

### **Option C: Test Authentication API**
```bash
# Test the auth session endpoint
curl -s http://localhost:3000/api/auth/session | jq

# Should show your session if logged in
```

---

## **🔧 Common Issues & Solutions**

### **Issue 1: Form Not Submitting**
**Solution**: Check browser console for JavaScript errors
```bash
# Restart development server
npm run dev
```

### **Issue 2: CSRF Token Problems**
**Solution**: Clear all cookies and try again
```bash
# Check for CSRF issues in browser network tab
# Look for 'csrf' in request headers
```

### **Issue 3: Database Connection Issues**
**Solution**: Check database
```bash
# View database contents
npx prisma studio --port 5555
# Visit: http://localhost:5555
```

### **Issue 4: Session Cookie Issues**
**Solution**: Check cookie settings
- Domain should be `localhost`
- Path should be `/`
- HttpOnly should be true

---

## **📋 Manual Verification Checklist**

### **✅ Before Testing**
- [ ] Development server running on port 3000
- [ ] Browser cache cleared
- [ ] All cookies for localhost:3000 cleared
- [ ] Using incognito/private window

### **✅ During Testing**
- [ ] Email field shows: `pro@dealmecca.pro`
- [ ] Password field shows: `password123`
- [ ] Click "Sign In" button
- [ ] Watch Network tab for API calls
- [ ] Check Console for errors

### **✅ Expected Results**
- [ ] Page redirects to `/dashboard`
- [ ] or shows "Welcome Pro User" message
- [ ] or URL changes to dashboard/main page

---

## **🚀 If Still Not Working**

### **Option 1: Manual Database Check**
1. **Open Prisma Studio**: http://localhost:5555
2. **Go to User table**
3. **Find user**: `pro@dealmecca.pro`
4. **Verify**: Name, email, password hash exist

### **Option 2: Test Different Account**
Try creating a new account:
1. **Go to**: http://localhost:3000/auth/signup
2. **Create new account** with your email
3. **Try logging in** with new account

### **Option 3: Check NextAuth Configuration**
```bash
# Check environment variables
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET

# Should show:
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your-secret
```

---

## **📞 Quick Support Commands**

```bash
# Check server status
ps aux | grep -E "(npm|next)" | grep -v grep

# Check database users
node test-all-accounts.js

# View server logs
npm run dev | grep -i error

# Test auth API
curl -s http://localhost:3000/api/auth/session
```

---

## **🎯 Most Likely Solutions**

1. **Clear browser cache/cookies completely**
2. **Try incognito/private window**
3. **Use exact credentials**: `pro@dealmecca.pro` / `password123`
4. **Check browser console for errors**
5. **Restart development server if needed**

**If none of these work, the issue is likely browser-specific or session-related.** 