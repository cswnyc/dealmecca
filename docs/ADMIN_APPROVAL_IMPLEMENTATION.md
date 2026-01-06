# Admin Approval System Implementation

## Overview
Implemented a comprehensive admin approval system for new user signups. All new users (Google/LinkedIn/Email) now start with `PENDING` status and require admin approval before accessing protected features.

## Changes Made

### 1. Database Schema (`prisma/schema.prisma`)
- **Added `AccountStatus` enum**: `PENDING`, `APPROVED`, `REJECTED`
- **Added fields to User model**:
  - `accountStatus` (default: `APPROVED` for existing users, `PENDING` for new)
  - `approvedAt` (timestamp when approved)
  - `approvedByUserId` (admin who approved)
  - `approvalNotes` (optional notes about approval decision)
- **Added indexes** on `accountStatus` and `approvedAt` for efficient queries

### 2. User Creation (`app/api/auth/firebase-sync/route.ts`, `server/authUser.ts`)
- New users are created with `accountStatus: 'PENDING'`
- Existing users remain `APPROVED` (safe default)
- Account status is included in API responses

### 3. Auth Enforcement (`server/requireAuth.ts`, `server/authUser.ts`)
- **Updated `requireAuth`**: Added `requireApproved` option to block pending users
- **Added `getAuthUser`**: Helper function for API routes that need user object
- **403 Response**: Pending users get clear error message with account status
- Protected API routes can now use: `requireAuth(req, { requireApproved: true })`

### 4. User Experience (`app/auth/pending-approval/page.tsx`)
- **Dedicated pending page**: Clean, informative UI explaining the approval process
- **Auto-polling**: Checks approval status every 30 seconds
- **Auto-redirect**: When approved, automatically redirects to forum
- **Help section**: Links to support for questions

### 5. Auth Guard Updates (`components/auth/AuthGuard.tsx`)
- Checks account status after authentication
- Redirects `PENDING` and `REJECTED` users to `/auth/pending-approval`
- Prevents access to protected features while maintaining auth session

### 6. Middleware (`middleware.ts`)
- Added `/auth/pending-approval` to allowed auth routes
- Ensures pending users can access their status page

### 7. Admin UI (`app/admin/users/page.tsx`, `components/admin/EditUserModal.tsx`)
- **Users table**: New "Account Status" column showing approval state
- **Visual indicators**: Color-coded badges (green=approved, yellow=pending, red=rejected)
- **Edit modal**: Three-button approval interface (Approve/Pending/Reject)
- **Approval notes**: Optional text field for admin notes
- **Approval timestamp**: Shows when user was previously approved

### 8. Admin API (`app/api/admin/users/route.ts`)
- **GET**: Returns `accountStatus`, `approvedAt`, `approvalNotes`
- **PATCH**: Supports updating approval status
- **Auto-timestamp**: Sets `approvedAt` when status changed to `APPROVED`
- **Audit trail**: Stores `approvedByUserId` and `approvalNotes`

## Migration Script
Created `scripts/migrate-user-approval-status.ts` to:
- Set all existing users to `APPROVED` status
- Add migration notes for audit trail
- Show summary statistics after migration

## User Flow

### New User Signup
1. User signs up via Google/LinkedIn/Email
2. Account created with `accountStatus: 'PENDING'`
3. User redirected to `/auth/pending-approval`
4. Page explains approval process and timeline (24-48 hours)
5. User can sign out or wait for approval

### Admin Approval
1. Admin visits `/admin/users`
2. Sees pending users with yellow "PENDING" badge
3. Clicks "Edit" on user
4. Selects "Approved" status
5. Optionally adds approval notes
6. Saves changes

### User Gets Access
1. Pending page auto-polls for status changes
2. When approved, user automatically redirected to `/forum`
3. Full platform access granted

## API Protection Examples

### Protect an API route (require approved users):
```typescript
import { requireAuth } from '@/server/requireAuth';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, { requireApproved: true });
  if (auth instanceof NextResponse) return auth; // Error response
  
  // User is authenticated AND approved
  const userId = auth.dbUserId;
  // ... protected logic
}
```

### Get user object with approval check:
```typescript
import { getAuthUser } from '@/server/authUser';

export async function POST(req: NextRequest) {
  const result = await getAuthUser(req, { requireApproved: true });
  if (result instanceof NextResponse) return result; // Error response
  
  const { user } = result;
  // ... use user object
}
```

## Testing Checklist

### Before Deployment
- [ ] Run migration: `npx ts-node scripts/migrate-user-approval-status.ts`
- [ ] Apply Prisma schema: `npx prisma db push` or `npx prisma migrate dev`
- [ ] Verify existing users are `APPROVED`
- [ ] Test new signup flow (all three methods)
- [ ] Test admin approval workflow
- [ ] Test pending user experience
- [ ] Verify auto-redirect on approval

### Test Scenarios
1. **New Email Signup**: Should create PENDING user
2. **New Google Signup**: Should create PENDING user  
3. **New LinkedIn Signup**: Should create PENDING user
4. **Pending User Access**: Should redirect to pending page
5. **Admin Approval**: Should update status and allow access
6. **Admin Rejection**: Should keep user on pending page
7. **Existing Users**: Should remain APPROVED and have full access

## Configuration

### Default Behavior
- New users: `PENDING` (requires approval)
- Existing users: `APPROVED` (grandfathered in)
- Admin users: Can approve/reject via UI

### Customization Options
To auto-approve specific users (e.g., from trusted domains), modify:
- `app/api/auth/firebase-sync/route.ts` (line ~47)
- `server/authUser.ts` (line ~66)

Example:
```typescript
const trustedDomains = ['company.com', 'partner.com'];
const emailDomain = email?.split('@')[1];
const accountStatus = trustedDomains.includes(emailDomain) ? 'APPROVED' : 'PENDING';
```

## Security Considerations
- ✅ Pending users cannot access protected API routes
- ✅ Pending users cannot post/comment in forum
- ✅ Pending users cannot access org charts or data tools
- ✅ Admin-only approval (no self-service)
- ✅ Audit trail with timestamps and notes
- ✅ Clear error messages for pending users

## Future Enhancements
- Email notifications when users are approved/rejected
- Bulk approval actions in admin UI
- Approval workflow with multiple admin levels
- Auto-approval rules based on LinkedIn verification
- Waitlist integration for rejected users

