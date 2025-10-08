# MailerLite Integration Setup

This guide will help you set up MailerLite integration for the DealMecca waitlist system.

## Overview

When users sign up for the waitlist at `/invite-only`, their emails are:
1. ✅ Saved to the database (`WaitlistEmail` table)
2. ✅ Synced to MailerLite (if configured)
3. ✅ Visible in the admin panel at `/admin/waitlist`

## Environment Variables

Add these to your `.env.local` (development) and Vercel environment variables (production):

```bash
# Required: Your MailerLite API key
MAILERLITE_API_KEY=your-mailerlite-api-key-here

# Optional: Group ID for waitlist subscribers
MAILERLITE_WAITLIST_GROUP_ID=your-waitlist-group-id-here
```

## Getting Your MailerLite API Key

1. Log in to your MailerLite account
2. Navigate to: **Settings** → **Integrations** → **API**
3. Or visit directly: https://dashboard.mailerlite.com/integrations/api
4. Click "Generate new token"
5. Give it a name (e.g., "DealMecca Waitlist")
6. Copy the API key and add it to your `.env.local` file

## Setting Up a Waitlist Group (Optional)

Creating a dedicated group helps organize your waitlist subscribers:

1. Go to **Subscribers** → **Groups** in MailerLite
2. Click "Create Group"
3. Name it "Waitlist" or "Early Access"
4. Copy the Group ID from the URL (e.g., `https://dashboard.mailerlite.com/subscribers/groups/123456`)
5. Add the Group ID to `MAILERLITE_WAITLIST_GROUP_ID` in your `.env`

If you don't set a group ID, subscribers will still be added to MailerLite with custom fields.

## Custom Fields

The integration automatically adds these custom fields to each subscriber:

| Field Name | Description | Example |
|------------|-------------|---------|
| `waitlist_source` | Where the user signed up from | `"invite-only"` |
| `signed_up_at` | Timestamp of signup | `"2025-10-07T21:30:00.000Z"` |
| `status` | Current waitlist status | `"waitlist"` |

These fields are automatically created in MailerLite when first used. You can view and manage them in:
**Subscribers** → **Custom Fields**

## Testing the Integration

### 1. Local Testing

```bash
# Make sure your .env.local has the API key
npm run dev

# Visit http://localhost:3000/invite-only
# Submit a test email
```

Check the server logs for:
- ✅ `New waitlist signup: test@example.com from invite-only`
- ✅ `✅ MailerLite sync successful for: test@example.com`

Or if there's an error:
- ⚠️ `⚠️ MailerLite sync failed (email still saved to database): Error message`

### 2. Verify in MailerLite Dashboard

1. Go to **Subscribers** in your MailerLite dashboard
2. Search for the test email
3. Verify the custom fields are set correctly
4. Check if they're in the correct group (if you configured one)

### 3. Verify in Admin Panel

Visit `http://localhost:3000/admin/waitlist` to see all waitlist signups from the database.

## Production Deployment

### Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - `MAILERLITE_API_KEY` = your API key
   - `MAILERLITE_WAITLIST_GROUP_ID` = your group ID (optional)
4. Apply to: **Production**, **Preview**, and **Development**
5. Redeploy your application

## Error Handling

The integration is designed to be non-blocking:

- ✅ If MailerLite sync fails, the email is still saved to the database
- ✅ Users always see success if database save succeeds
- ⚠️ MailerLite errors are logged to the server console for debugging

Common errors:
- `MailerLite API key not configured` - Add API key to `.env`
- `MailerLite API error: 401` - Invalid API key
- `MailerLite API error: 422` - Invalid email format or data

## Service Methods

The `/lib/mailerlite.ts` service provides these methods:

```typescript
// Subscribe to waitlist
await subscribeUserToWaitlist(email, source)

// Subscribe to newsletter
await subscribeUserToNewsletter(email, firstName?, userTier?)

// Direct subscriber management
await mailerLite.subscribe(email, options)
await mailerLite.getSubscriber(email)
await mailerLite.updateSubscriberFields(email, fields)
await mailerLite.addToGroup(subscriberId, groupId)
```

## Support

- MailerLite API Docs: https://developers.mailerlite.com/docs
- MailerLite Support: https://www.mailerlite.com/help

## Troubleshooting

### Subscribers not appearing in MailerLite

1. Check server logs for MailerLite errors
2. Verify API key is correct and active
3. Test API key directly: `curl -H "Authorization: Bearer YOUR_KEY" https://connect.mailerlite.com/api/subscribers`

### Subscribers in wrong group

1. Verify `MAILERLITE_WAITLIST_GROUP_ID` is correct
2. Group IDs are found in the URL when viewing a group

### Custom fields not showing

1. Custom fields are auto-created on first use
2. Check **Subscribers** → **Custom Fields** in MailerLite
3. Ensure field names match: `waitlist_source`, `signed_up_at`, `status`
