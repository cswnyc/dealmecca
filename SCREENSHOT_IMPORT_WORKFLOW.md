# Screenshot Import Workflow

This document explains how to continue importing verified independent agency partnership data from screenshots.

## Current Progress

**Completed Screenshots:**
- Screenshot 58: ✅ 4 agencies, 31 partnerships
- Screenshot 59: ✅ 4 agencies, 24 partnerships
- Screenshot 60: ✅ 4 agencies, 31 partnerships
- Screenshot 61: ⏳ 4 agencies created, 34 partnerships importing

**Next Screenshot:** 62

## Workflow for Each Screenshot

### Step 1: Extract Data from Screenshot

When you provide a screenshot path, I will:
1. Read the screenshot image
2. Extract agency names, locations, and client lists
3. Format the data for import

### Step 2: Add Data to Verified File

The extracted data gets added to `scripts/verified-independent-agencies-data.ts` with the format:

```typescript
// Screenshot XX - VERIFIED
{
  agency: 'Agency Name',
  city: 'City',
  state: 'ST',
  clients: [
    'Client 1',
    'Client 2',
    // ...
  ]
},
```

### Step 3: Process the Screenshot

Run the combined workflow:

```bash
# Create agencies and trigger import
npx tsx scripts/create-missing-agencies-screenshotXX.ts && sleep 3 && npx tsx scripts/import-verified-agencies.ts
```

### Step 4: Verify Import

After import completes (may take 5-10 minutes), verify:

```bash
npx tsx scripts/check-screenshotXX-partnerships.ts
```

## Quick Reference Commands

### Check current screenshot status
```bash
# Verify Screenshot 61
npx tsx scripts/check-screenshot61-partnerships.ts
```

### Manual import trigger (if needed)
```bash
npx tsx scripts/import-verified-agencies.ts
```

### Check database connection status
```bash
# Quick test
npx tsx -e "import {PrismaClient} from '@prisma/client'; const p = new PrismaClient(); p.company.count().then(c => console.log('Companies:',c)).finally(() => p.\$disconnect())"
```

## File Locations

**Data Files:**
- `scripts/verified-independent-agencies-data.ts` - Main data source
- `scripts/create-missing-agencies-screenshotXX.ts` - Agency creation scripts
- `scripts/check-screenshotXX-partnerships.ts` - Verification scripts

**Import Script:**
- `scripts/import-verified-agencies.ts` - Main import processor

## Workflow States

### In Progress
When I'm processing a screenshot, you'll see:
- ✅ Agencies created
- ⏳ Partnerships importing
- 0/XX partnerships showing initially

### Complete
When a screenshot is done:
- ✅ Agencies created
- ✅ XX/XX partnerships imported and verified

## Background Process Congestion

**Issue:** Multiple background import processes from previous sessions can cause database connection congestion.

**Symptoms:**
- Imports taking 5+ minutes instead of 30-60 seconds
- No output from import scripts for extended periods
- Database timeout warnings

**Solutions:**
1. **Wait it out** - Processes will eventually complete
2. **Session restart** - Start fresh session (clears background processes)
3. **Data-only mode** - Extract data without triggering imports, batch process later

## Tips for Next Session

1. **Check Screenshot 61 status first:**
   ```bash
   npx tsx scripts/check-screenshot61-partnerships.ts
   ```

2. **If complete, proceed to Screenshot 62**

3. **Use data-only mode if background congestion is severe:**
   - Extract and add data to verified file
   - Create agency creation script
   - Create verification script
   - DON'T run import
   - Batch process multiple screenshots at once later

## Data Format Example

For quick reference, here's the expected format when adding to `verified-independent-agencies-data.ts`:

```typescript
// Screenshot 62 - VERIFIED
{
  agency: 'Example Agency NYC',
  city: 'New York City',
  state: 'NY',
  clients: [
    'Example Corp',
    'Another Company',
    'Third Client'
  ]
},
{
  agency: 'Another Agency Boston',
  city: 'Boston',
  state: 'MA',
  clients: [
    'Client A',
    'Client B'
  ]
},
```

## Troubleshooting

### Import seems stuck
- Check process is still running in background
- Wait at least 5 minutes before assuming failure
- Run verification script to check if data is appearing

### Partnerships not showing up
- Ensure data is in `verified-independent-agencies-data.ts`
- Ensure format exactly matches existing entries
- Check for typos in agency names or client names

### Database errors
- Usually transient due to connection pool exhaustion
- Wait for background processes to complete
- Fresh session will clear congestion

## Session Continuity

When starting a new session, you can say:
- "Continue with next screenshot" - I'll check status and proceed
- "Verify Screenshot 61" - I'll run verification
- "Screenshot 62" + provide path - I'll process new screenshot
- "What's our progress?" - I'll summarize current state
