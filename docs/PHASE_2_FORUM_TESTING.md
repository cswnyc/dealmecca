# Phase 2: Forum Features Testing Guide

**Status:** Ready for Testing
**Date:** 2025-10-09
**Prerequisites:** Phase 1 (Authentication) must be complete

---

## Overview

This guide walks through testing all forum features to ensure they work correctly with the post approval workflow and authentication system.

---

## 🔧 Code Changes Applied

### ✅ Post Approval Workflow Fixed

**File:** `/app/api/forum/posts/route.ts`
**Change:** Line 454

```typescript
// BEFORE:
status: 'APPROVED'  // Auto-approve posts

// AFTER:
status: 'PENDING'  // User posts require admin approval
```

**Impact:** All user-created posts now go to PENDING status and require admin approval before appearing publicly.

---

## 📋 Testing Checklist

### 1. Post Creation & Approval Workflow

#### A. Create a Post as Regular User

**Steps:**
1. Navigate to `/dev-auth`
2. Sign in as **Pro User** (pro@dealmecca.pro / test123)
3. Navigate to `/forum`
4. Click "Create Post" or "New Post" button
5. Fill in post details:
   - Title: Auto-generated from content
   - Content: "This is a test post to verify the approval workflow"
   - Category: Select any category
   - Tags: Optional
6. Submit the post

**Expected Results:**
- ✅ Post created successfully (201 status)
- ✅ Success message displayed
- ❌ Post does NOT appear in public forum listing
- ✅ Post redirects to success page or shows pending status

#### B. Verify Post is Pending

**Steps:**
1. Stay on forum page at `/forum`
2. Refresh the page
3. Browse all posts in the forum

**Expected Results:**
- ❌ Your newly created post should NOT appear in the list
- ✅ Only APPROVED posts should be visible
- ✅ Other users cannot see your pending post

#### C. Approve Post as Admin

**Steps:**
1. Open new tab or sign out
2. Navigate to `/dev-auth`
3. Sign in as **Admin** (admin@dealmecca.pro / password123)
4. Navigate to `/admin/forum/posts`
5. Look for posts with status: PENDING
6. Find your test post in the list
7. Click "Edit" or "Approve" button
8. Change status to "APPROVED"
9. Save the changes

**Expected Results:**
- ✅ Admin panel shows pending posts
- ✅ Post status can be changed to APPROVED
- ✅ `approvedAt` timestamp is set
- ✅ `approvedBy` is set to admin user ID
- ✅ Changes saved successfully

#### D. Verify Approved Post Appears Publicly

**Steps:**
1. Return to forum tab (or navigate to `/forum`)
2. Refresh the page
3. Look for your test post in the listing

**Expected Results:**
- ✅ Post now appears in public forum
- ✅ Post shows correct title, content, author
- ✅ Post can be viewed by all users
- ✅ Comments are enabled

---

### 2. Comment Functionality (Already Tested ✅)

**Status:** WORKING (verified in Phase 1)

**Evidence from logs:**
```
🔐 Token verified: uid=DysEp8gCwAYEhRBJvppGx929P2v2
✅ Auth success: dbUser=DysEp8gCwAYEhRBJvppGx929P2v2
POST /api/forum/posts/cmgW9GWQpTHDICEbrx5/comments 201 in 832ms
```

**Quick Verification:**
1. Navigate to any approved post
2. Scroll to comments section
3. Enter comment text
4. Submit comment

**Expected Results:**
- ✅ Comment appears immediately (no approval required)
- ✅ Comment shows correct author
- ✅ Comment notifications sent to followers

---

### 3. Bookmark Functionality

**Endpoint:** `POST /api/forum/posts/[id]/bookmark`
**Authentication:** Required (Bearer token)

#### Test Steps:

1. **Sign in** at `/dev-auth` (any user account)
2. Navigate to `/forum`
3. Find an approved post
4. Click the **bookmark icon** (usually a bookmark or save button)

**Expected Results:**
- ✅ POST request to `/api/forum/posts/[postId]/bookmark` returns 200/201
- ✅ Bookmark icon changes state (filled vs outlined)
- ✅ Bookmark persists on page refresh
- ✅ User can toggle bookmark on/off

**Database Verification:**
```sql
-- Check ForumBookmark table
SELECT * FROM "ForumBookmark" WHERE "userId" = 'your-user-id';
```

---

### 4. Follow Functionality

**Endpoint:** `POST /api/forum/posts/[id]/follow`
**Authentication:** Required (Bearer token)

#### Test Steps:

1. **Sign in** at `/dev-auth` (any user account)
2. Navigate to `/forum`
3. Find an approved post
4. Click the **follow button** (usually a bell or follow icon)

**Expected Results:**
- ✅ POST request to `/api/forum/posts/[postId]/follow` returns 200/201
- ✅ Follow button changes state
- ✅ User receives notifications when new comments are posted
- ✅ Follow persists on page refresh
- ✅ User can unfollow

**Notification Test:**
1. Follow a post as User A
2. Sign in as User B
3. Comment on the same post
4. Sign back in as User A
5. Check `/notifications`

**Expected Results:**
- ✅ User A receives notification about User B's comment
- ✅ Notification includes post title and commenter name
- ✅ Clicking notification navigates to post

---

### 5. Anonymous Posting

**Field:** `isAnonymous` in post creation
**Expected Behavior:** Post shows anonymous handle instead of real name

#### Test Steps:

1. **Sign in** at `/dev-auth`
2. Navigate to forum post creation
3. Check "Post Anonymously" option (if available in UI)
4. Create a post with content
5. Submit

**Expected Results:**
- ✅ Post created with `isAnonymous: true`
- ✅ Post shows anonymous handle (e.g., "user-af2abb")
- ✅ Real author name is hidden from public view
- ✅ Admin can still see real author in admin panel

**Database Verification:**
```sql
SELECT id, title, authorId, isAnonymous, anonymousHandle
FROM "ForumPost"
WHERE "isAnonymous" = true;
```

---

### 6. Admin Panel Data Sync

**Objective:** Ensure admin panel shows the same data as frontend

#### Test Scenarios:

| Item | Frontend Location | Admin Location | What to Verify |
|------|------------------|----------------|----------------|
| Post Count | `/forum` | `/admin/forum/posts` | Total number matches |
| Post Content | Post detail page | Admin edit page | Content identical |
| Comment Count | Post card | Admin post listing | Count matches |
| Bookmark Count | Post stats | Database query | Count matches |
| Post Status | Not visible (filtered) | Admin panel | PENDING/APPROVED shown |
| Categories | Filter dropdown | Admin categories | Same categories |

#### Verification Steps:

1. **Count Posts:**
   - Frontend: Navigate to `/forum`, count visible posts
   - Admin: Navigate to `/admin/forum/posts`, filter by APPROVED, count posts
   - **Expected:** Numbers match

2. **Verify Post Content:**
   - Frontend: Click any post, note title & first paragraph
   - Admin: Find same post in admin panel, check content
   - **Expected:** Content identical

3. **Check Comment Counts:**
   - Frontend: Note comment count on post card
   - Admin: Check same post in admin listing
   - **Expected:** Comment count matches

4. **Pending Posts:**
   - Admin: Filter by status: PENDING
   - Frontend: Verify none of these posts appear in public forum
   - **Expected:** Pending posts hidden from public

---

## 🐛 Known Issues & Solutions

### Issue 1: Profile API Still Returns 401

**Problem:**
```
❌ Profile API: No user ID found in headers or cookies
GET /api/users/profile 401
```

**Cause:** Legacy endpoint expects `x-user-id` header or `linkedin-auth` cookie instead of Bearer token

**Impact:** Low - doesn't block core forum functionality

**Solution:** Update `/app/api/users/profile/route.ts` to use `requireAuth()` like other endpoints

**Priority:** Medium (can be addressed in Phase 5: Settings)

---

### Issue 2: Prisma Client Cache

**Problem:** Old schema cached in Prisma client causing validation errors

**Solution Applied:**
```bash
npx prisma generate
rm -rf .next
# Restart dev server
```

**Prevention:** Always regenerate Prisma client after schema changes

---

## 📊 API Endpoints Reference

### Public Forum Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/forum/posts` | No | List approved posts only |
| GET | `/api/forum/posts/[id]` | No | Get single post details |
| POST | `/api/forum/posts` | Yes | Create post (status: PENDING) |
| GET | `/api/forum/posts/[id]/comments` | No | Get comments (public) |
| POST | `/api/forum/posts/[id]/comments` | Yes | Create comment (no approval) |
| POST | `/api/forum/posts/[id]/bookmark` | Yes | Toggle bookmark |
| POST | `/api/forum/posts/[id]/follow` | Yes | Toggle follow |

### Admin Forum Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/admin/forum/posts` | Admin | List all posts (inc. pending) |
| GET | `/api/admin/forum/posts/[id]` | Admin | Get post details |
| PUT | `/api/admin/forum/posts/[id]` | Admin | Update post (approve/reject) |
| DELETE | `/api/admin/forum/posts/[id]` | Admin | Delete post |

---

## 🔍 Database Queries for Verification

### Check Post Status Distribution

```sql
SELECT status, COUNT(*) as count
FROM "ForumPost"
GROUP BY status;
```

**Expected Output:**
```
status    | count
----------|------
APPROVED  | 15
PENDING   | 3
```

### Check User Bookmarks

```sql
SELECT
  u.email,
  fp.title,
  fb."createdAt"
FROM "ForumBookmark" fb
JOIN "User" u ON fb."userId" = u.id
JOIN "ForumPost" fp ON fb."postId" = fp.id
ORDER BY fb."createdAt" DESC
LIMIT 10;
```

### Check Post Follows

```sql
SELECT
  u.email,
  fp.title,
  pf."createdAt"
FROM "PostFollow" pf
JOIN "User" u ON pf."userId" = u.id
JOIN "ForumPost" fp ON pf."postId" = fp.id
ORDER BY pf."createdAt" DESC
LIMIT 10;
```

### Check Notifications

```sql
SELECT
  u.email,
  n.type,
  n.title,
  n.message,
  n.read,
  n."createdAt"
FROM "Notification" n
JOIN "User" u ON n."userId" = u.id
WHERE n.type LIKE 'FORUM%'
ORDER BY n."createdAt" DESC
LIMIT 10;
```

---

## ✅ Phase 2 Completion Criteria

Phase 2 is complete when ALL of the following are verified:

- [x] **Code Changes:** Post creation sets status to PENDING
- [ ] **Post Creation:** User can create posts successfully
- [ ] **Post Pending:** New posts don't appear publicly until approved
- [ ] **Admin Approval:** Admin can approve posts from admin panel
- [ ] **Post Visibility:** Approved posts appear in public forum
- [ ] **Comments:** Users can comment on approved posts (already working)
- [ ] **Bookmarks:** Users can bookmark/unbookmark posts
- [ ] **Follows:** Users can follow/unfollow posts
- [ ] **Notifications:** Followers receive comment notifications
- [ ] **Anonymous Posts:** Anonymous posting works correctly
- [ ] **Data Sync:** Admin panel shows same data as frontend

---

## 🚀 Next Steps After Phase 2

Once all Phase 2 tests pass, proceed to:

**Phase 3: Organizations/Org Charts**
- Verify 17 seeded companies display
- Test company profiles
- Test contact listings
- Verify search functionality

See `/docs/TROUBLESHOOTING_ROADMAP.md` for full roadmap.

---

## 📝 Testing Notes Template

Use this template to record your testing results:

```markdown
## Phase 2 Testing Results - [Date]

### Tester: [Your Name]
### Environment: [Local/Production]

#### 1. Post Creation & Approval
- [ ] Post created as regular user
- [ ] Post set to PENDING status
- [ ] Post NOT visible publicly
- [ ] Admin can see pending post
- [ ] Admin can approve post
- [ ] Approved post appears publicly
- **Issues:** [None / List issues]

#### 2. Comments
- [ ] Can comment on posts
- [ ] Comments appear immediately
- **Issues:** [None / List issues]

#### 3. Bookmarks
- [ ] Can bookmark posts
- [ ] Bookmark persists
- [ ] Can unbookmark
- **Issues:** [None / List issues]

#### 4. Follows
- [ ] Can follow posts
- [ ] Receives notifications
- [ ] Can unfollow
- **Issues:** [None / List issues]

#### 5. Anonymous Posting
- [ ] Anonymous option works
- [ ] Shows anonymous handle
- **Issues:** [None / List issues]

#### 6. Admin Data Sync
- [ ] Post counts match
- [ ] Content matches
- [ ] Comment counts match
- **Issues:** [None / List issues]

### Overall Status: [PASS / FAIL]
### Notes: [Additional observations]
```

---

**Ready to begin testing!** Start with test #1: Post Creation & Approval Workflow.
