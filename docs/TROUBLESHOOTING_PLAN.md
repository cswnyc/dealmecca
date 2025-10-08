# DealMecca Troubleshooting Plan

**Created:** 2025-10-08
**Status:** Phase 1 - In Progress
**Goal:** Systematically fix and verify all application features

---

## Progress Overview

- ✅ **Completed:** 0/6 phases
- 🚧 **In Progress:** Phase 1 - Authentication Foundation
- ⏳ **Pending:** Phases 2-6

---

## Phase 1: Authentication Foundation (CRITICAL) 🚧

**Status:** In Progress
**Priority:** P0 - Blocking all other phases
**Started:** 2025-10-08

### Problem
All authenticated features returning 401 errors across the application.

### Root Cause
✅ **IDENTIFIED:** No user currently signed in (authentication system is fully functional, just needs a user to authenticate)

### Tasks
- [x] Diagnose authentication system (COMPLETED)
- [x] Identify root cause: no signed-in user (COMPLETED)
- [ ] Create dev authentication page at `/app/dev-auth/page.tsx`
- [ ] Test authentication flow end-to-end
- [ ] Verify 401 errors are resolved
- [ ] Document authentication flow

### Success Criteria
- [ ] User can sign in via dev auth page
- [ ] `auth.currentUser` is not null after sign-in
- [ ] `authedFetch()` successfully sends Bearer token
- [ ] Forum actions (comment, bookmark) work without 401 errors
- [ ] Session cookie (`dealmecca-session`) is set
- [ ] Backend sync completes successfully

### Test Accounts
- **Admin:** admin@dealmecca.pro / password123
- **Pro User:** pro@dealmecca.pro / test123

### Files Modified
- `/app/dev-auth/page.tsx` (to be created)

### Notes
- Firebase auth system confirmed working (onAuthStateChanged active)
- Auth flow: Firebase Auth → Get ID Token → Send as Bearer → requireAuth validates
- Middleware checks for cookies: `auth-token`, `__session`, `linkedin-auth`
- Backend sync endpoint: `/api/auth/firebase-sync` (sets `dealmecca-session` cookie)

---

## Phase 2: Forum 🔲

**Status:** Pending
**Priority:** P1 - High priority user-facing feature
**Depends on:** Phase 1 (Authentication)

### Known Issues
- Comments returning 401 (blocked by auth)
- Bookmark/follow actions returning 401 (blocked by auth)
- Post creation needs testing
- Unknown if admin data matches frontend

### Tasks
- [ ] Test post creation/viewing
- [ ] Test comment system
- [ ] Test bookmark functionality
- [ ] Test follow/unfollow actions
- [ ] Verify admin panel data matches frontend
- [ ] Test post editing/deletion
- [ ] Verify categories system
- [ ] Test search/filtering

### Success Criteria
- [ ] Can create new posts
- [ ] Can comment on posts
- [ ] Can bookmark posts
- [ ] Can follow/unfollow posts
- [ ] Admin panel shows accurate post/comment counts
- [ ] No 401/500 errors on forum actions

### Files to Check
- `/app/forum/**`
- `/app/api/forum/**`
- `/app/admin/forum/**`

### Notes
_Add notes as issues are discovered_

---

## Phase 3: Organizations/Org Charts 🔲

**Status:** Pending
**Priority:** P1 - Core feature
**Depends on:** Phase 1 (Authentication)

### Current State
- 17 companies seeded in database
- Org charts exist at `/orgs`
- Unknown if fully functional

### Tasks
- [ ] Test org chart viewing
- [ ] Verify all 17 companies display correctly
- [ ] Test company profile pages
- [ ] Test contact listings
- [ ] Verify search functionality
- [ ] Check mobile responsiveness
- [ ] Verify data quality scoring displays correctly

### Success Criteria
- [ ] All 17 companies display in org charts
- [ ] Company profiles show complete information
- [ ] Contacts linked to companies correctly
- [ ] Search works across companies/contacts
- [ ] Mobile view works correctly

### Files to Check
- `/app/orgs/**`
- `/app/api/companies/**`
- `/app/api/contacts/**`

### Notes
_Add notes as issues are discovered_

---

## Phase 4: Events 🔲

**Status:** Pending
**Priority:** P2 - Medium priority feature
**Depends on:** Phase 1 (Authentication)

### Current State
- Unknown functionality status
- Need to verify event listings and management

### Tasks
- [ ] Test event listing page
- [ ] Test event creation (if applicable)
- [ ] Test event details/viewing
- [ ] Verify admin controls
- [ ] Check mobile responsiveness

### Success Criteria
- [ ] Events display correctly
- [ ] Event details show complete information
- [ ] Admin can manage events
- [ ] No errors on event pages

### Files to Check
- `/app/events/**`
- `/app/api/events/**`

### Notes
_Add notes as issues are discovered_

---

## Phase 5: Settings & Profile 🔲

**Status:** Pending
**Priority:** P2 - Medium priority feature
**Depends on:** Phase 1 (Authentication)

### Current State
- Unknown functionality status
- Need to verify user settings and profile management

### Tasks
- [ ] Test profile viewing
- [ ] Test profile editing
- [ ] Test settings page
- [ ] Verify role-based features (FREE vs PRO)
- [ ] Test account preferences
- [ ] Check mobile responsiveness

### Success Criteria
- [ ] User can view/edit profile
- [ ] Settings save correctly
- [ ] Role-based features display appropriately
- [ ] No errors on profile/settings pages

### Files to Check
- `/app/profile/**`
- `/app/settings/**`
- `/app/api/users/**`

### Notes
_Add notes as issues are discovered_

---

## Phase 6: Admin Panel Consolidation 🔲

**Status:** Pending
**Priority:** P3 - Technical debt cleanup
**Depends on:** Phases 1-5

### Current State
- 30+ test/debug pages exist
- Multiple admin sections need consolidation
- Need comprehensive documentation

### Tasks
- [ ] Audit all admin pages
- [ ] Identify pages to keep vs remove
- [ ] Consolidate duplicate functionality
- [ ] Document admin panel structure
- [ ] Clean up test pages
- [ ] Update admin navigation
- [ ] Create admin user guide

### Success Criteria
- [ ] Single, organized admin panel
- [ ] All functionality documented
- [ ] Test pages removed or properly organized
- [ ] Admin navigation is clear and logical

### Files to Check
- `/app/admin/**`
- All test/debug pages

### Notes
_Add notes as issues are discovered_

---

## Issue Log

### Resolved Issues
1. **Waitlist email capture error** (2025-10-07)
   - **Issue:** Internal server error on form submission
   - **Root Cause:** Missing `@default(cuid())` on WaitlistEmail.id
   - **Resolution:** Added default to schema, ran prisma generate
   - **Commit:** dc78022 "fix: resolve waitlist email capture issues"

2. **MailerLite group ID validation error** (2025-10-07)
   - **Issue:** 422 error from MailerLite API
   - **Root Cause:** Placeholder value being sent as group ID
   - **Resolution:** Added validation to skip invalid group IDs
   - **Commit:** dc78022 "fix: resolve waitlist email capture issues"

3. **Database schema drift** (2025-10-07)
   - **Issue:** Production DB had extra columns from old commits
   - **Resolution:** Ran `npx prisma db push --accept-data-loss`

### Active Issues
1. **401 errors on authenticated actions** (Phase 1)
   - **Status:** Root cause identified, fix in progress
   - **Next Step:** Create dev auth page

### Blocked Issues
_Issues discovered but blocked by other work_

---

## Quick Reference

### Test Credentials
- **Admin:** admin@dealmecca.pro / password123
- **Pro User:** pro@dealmecca.pro / test123

### Key URLs
- **Production:** https://www.getmecca.com
- **Local Dev:** http://localhost:3002
- **Dev Auth:** http://localhost:3002/dev-auth (to be created)
- **Admin Panel:** /admin
- **Forum:** /forum
- **Org Charts:** /orgs

### Key Commands
```bash
# Start dev server
npm run dev

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Deploy to production (OAuth-safe)
npm run deploy:prod
# OR
vercel --prod --alias getmecca.com
```

### Authentication Flow
1. User signs in via Firebase (Google/LinkedIn/Email)
2. Frontend gets Firebase ID token
3. `authedFetch()` sends token as `Authorization: Bearer {token}`
4. Backend `requireAuth()` validates token
5. Backend syncs user via `/api/auth/firebase-sync`
6. Session cookie `dealmecca-session` is set
7. User is authenticated

---

## Phase Completion Checklist

When completing a phase:
1. ✅ Check all tasks completed
2. ✅ Verify all success criteria met
3. ✅ Update "Progress Overview" section
4. ✅ Document any issues in Issue Log
5. ✅ Add commit references
6. ✅ Update next phase status to "In Progress"
7. ✅ Commit troubleshooting plan updates

---

**Last Updated:** 2025-10-08
**Next Review:** After Phase 1 completion
