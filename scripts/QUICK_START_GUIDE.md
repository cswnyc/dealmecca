# SellerCrowd Scraper - Quick Start Guide

## 🚀 Fastest Method (Recommended)

### 1. Create the Bookmarklet (One-Time Setup)

1. **Create new bookmark** in your browser:
   - Chrome/Edge: Ctrl+D (Cmd+D on Mac), then edit
   - Firefox: Ctrl+D (Cmd+D on Mac), then edit
   - Safari: Cmd+D, then edit

2. **Name it:** `📊 Extract SellerCrowd`

3. **For the URL:** Copy the entire bookmarklet code from `sellercrowd-bookmarklet.txt`

4. **Save to bookmarks bar** for easy access

### 2. Use It

1. Go to SellerCrowd agency page (e.g., WPP Media NY)
2. Click the `📊 Extract SellerCrowd` bookmark
3. Answer 3 quick prompts
4. CSV downloads automatically!
5. Upload to bulk import

**Time per agency: ~2-3 minutes** (including prompts and download)

---

## 🔧 Alternative Method (Full Control)

If bookmarklet doesn't work or you want more control:

### Option A: Browser Console

1. Open SellerCrowd page
2. Press **F12** (or Cmd+Option+J on Mac)
3. Go to **Console** tab
4. Copy entire contents of `sellercrowd-scraper-v2.js`
5. Paste and press **Enter**
6. Follow prompts

### Option B: Inspect First, Then Scrape

If scraper doesn't find contacts:

1. Run `sellercrowd-inspector.js` in console
2. It will analyze page and suggest selectors
3. Update scraper with recommended selectors
4. Run scraper again

---

## 📋 Parent Company IDs Reference

Keep these IDs handy for the prompts:

### Holding Companies:
```
WPP:                    bs9onwht0250wp5kvprew9dz
Omnicom:                [Get from admin panel]
Publicis:               [Get from admin panel]
IPG:                    [Get from admin panel]
Dentsu:                 [Get from admin panel]
Havas:                  [Get from admin panel]
Stagwell:               [Get from admin panel]
S4 Capital:             [Get from admin panel]
```

### WPP Agency Brands:
```
WPP Media:              ftfgtb8jjw7holt6q6q14kir
CMI Media Group:        [Get from admin panel]
Mindshare:              [Get from admin panel]
GroupM:                 [Get from admin panel]
Wavemaker:              [Get from admin panel]
EssenceMediacom:        [Get from admin panel]
```

**To get company IDs:**
1. Go to admin panel
2. Navigate to Companies
3. Click on company
4. Copy ID from URL: `.../companies/[THIS-IS-THE-ID]/edit`

---

## 📊 Workflow for Hundreds of Agencies

### Recommended Process:

**Week 1: Setup & Test**
- [ ] Create bookmarklet
- [ ] Test on 2-3 small agencies (< 50 contacts each)
- [ ] Verify CSV format matches bulk import
- [ ] Test bulk import with sample data

**Week 2-4: Batch Processing**
- [ ] Process 5-10 agencies per day
- [ ] Create tracking spreadsheet (see template below)
- [ ] Keep all CSV files organized in folders
- [ ] Upload in batches, verify each batch

**Week 5+: Scale Up**
- [ ] Increase to 10-20 agencies per day
- [ ] Use bookmarklet for speed
- [ ] Maintain quality checks

### Tracking Spreadsheet Template:

| Date       | Agency Name      | Parent ID  | Contacts | CSV File                    | Uploaded | Verified |
|------------|------------------|------------|----------|-----------------------------|----------|----------|
| 2025-10-22 | WPP Media NY     | ftfg...    | 309      | WPP_Media_NY_1729....csv    | ✅       | ✅       |
| 2025-10-22 | CMI Media Boston | [ID]       | 145      | CMI_Media_Boston_1729...csv | ✅       | ⏳       |
| 2025-10-23 | Mindshare LA     | [ID]       | 287      | Mindshare_LA_1729....csv    | ⏳       | ⏳       |

---

## 🎯 Tips for Best Results

### Before Extraction:
1. ✅ Ensure stable internet connection
2. ✅ Close unnecessary browser tabs
3. ✅ Have parent company ID ready
4. ✅ Verify you're on correct agency page

### During Extraction:
1. ✅ Let auto-scroll complete (don't interact with page)
2. ✅ Wait for "Extraction Complete" message
3. ✅ Don't close browser until CSV downloads

### After Extraction:
1. ✅ Open CSV and verify data looks correct
2. ✅ Check for: Name, Email, LinkedIn, Title
3. ✅ Spot-check 3-5 random contacts
4. ✅ Fix any obvious issues before upload

### During Upload:
1. ✅ Upload to DEV first, test with small batch
2. ✅ Verify contacts appear correctly
3. ✅ Check parent company relationships
4. ✅ Then upload to PRODUCTION

---

## 🐛 Troubleshooting

### "No contacts found"
- **Cause:** Scraper can't find contact elements
- **Fix:** Run `sellercrowd-inspector.js` to identify selectors
- **Or:** Manually scroll to bottom first, then run scraper

### "Only got 10-20 contacts (should be 300+)"
- **Cause:** Infinite scroll didn't complete
- **Fix:**
  1. Manually scroll to very bottom of page
  2. Wait for all contacts to load
  3. Run scraper and choose "Cancel" when asked to scroll
  4. Script will extract all visible contacts

### "CSV columns don't match bulk import"
- **Cause:** CSV header order might be different
- **Fix:** Open CSV and verify headers match exactly:
  ```
  companyName,firstName,lastName,title,email,phone,linkedinUrl,department,
  industry,employeeCount,revenue,headquarters,description,website,domain,
  companyType,parentCompanyId
  ```

### "Bookmarklet doesn't work"
- **Cause:** Browser blocking bookmarklets or code not copied correctly
- **Fix:**
  1. Ensure entire code is copied (starts with `javascript:`)
  2. Try different browser (Chrome usually works best)
  3. Use console method instead

### "Extracted data missing emails"
- **Cause:** SellerCrowd might hide emails behind login or selectors are wrong
- **Fix:**
  1. Ensure you're logged into SellerCrowd
  2. Check if emails are visible on page
  3. Run inspector script to verify selectors

---

## 📈 Expected Performance

### Time Estimates:

| Contacts | Scroll Time | Extract Time | Total Time |
|----------|-------------|--------------|------------|
| 1-50     | 10s         | 5s           | ~15-20s    |
| 51-100   | 20s         | 10s          | ~30-40s    |
| 101-200  | 40s         | 15s          | ~1min      |
| 201-500  | 90s         | 25s          | ~2min      |
| 500+     | 120s        | 40s          | ~3min      |

*Times include prompts and CSV download*

### Batch Processing Estimates:

**Daily capacity:**
- Conservative: 10 agencies/day = ~30 mins/day
- Moderate: 20 agencies/day = ~1 hour/day
- Aggressive: 50 agencies/day = ~2.5 hours/day

**To process 300 agencies:**
- @ 10/day = 30 business days (~6 weeks)
- @ 20/day = 15 business days (~3 weeks)
- @ 50/day = 6 business days (~1.5 weeks)

---

## 📞 Need Help?

### If scraper completely fails:

1. **Share HTML sample:**
   - Right-click on contact card
   - Inspect → Copy → Copy outer HTML
   - Share first contact's HTML
   - Script can be customized for exact structure

2. **Check console errors:**
   - Press F12
   - Go to Console tab
   - Look for red error messages
   - Share error details

3. **Manual fallback:**
   - If automation fails, fall back to manual CSV creation
   - Create template with headers
   - Copy-paste data in batches

---

## 🎉 Success Checklist

After first successful extraction:

- [ ] CSV downloaded with correct filename
- [ ] CSV has all 17 column headers
- [ ] Data includes: firstName, lastName, email, linkedinUrl
- [ ] Uploaded to dev environment successfully
- [ ] Contacts appear in admin panel
- [ ] Parent company relationship correct
- [ ] Ready to scale to hundreds of agencies!

---

## 🔄 Workflow Summary

```
┌─────────────────────────────────────────┐
│ 1. Navigate to SellerCrowd Agency Page  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 2. Click Bookmarklet                    │
│    (or run script in console)           │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 3. Enter Prompts:                       │
│    - Company Name                       │
│    - Parent Company ID                  │
│    - Website (optional)                 │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 4. Auto-scroll loads all contacts       │
│    (1-3 minutes depending on size)      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 5. Extraction & CSV generation          │
│    (10-40 seconds)                      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 6. CSV auto-downloads                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 7. Review CSV quality                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 8. Upload to bulk import                │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 9. Verify in admin panel                │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 10. Repeat for next agency! 🔄          │
└─────────────────────────────────────────┘
```

**Total time per agency: 2-5 minutes** ⚡

Repeat this workflow for all agencies - you'll get faster with practice!

---

## 🎊 You're Ready!

You now have everything needed to extract data from hundreds of agencies 100x faster than manual copying.

**Files you have:**
- ✅ `sellercrowd-scraper-v2.js` - Full-featured scraper
- ✅ `sellercrowd-bookmarklet.txt` - One-click bookmarklet
- ✅ `sellercrowd-inspector.js` - Debugging tool
- ✅ `SCRAPER_INSTRUCTIONS.md` - Detailed docs
- ✅ `QUICK_START_GUIDE.md` - This file!

**Next steps:**
1. Create the bookmarklet
2. Test on WPP Media NY (you already have the data)
3. Compare results with your manual CSV
4. Once confident, scale to all agencies!

Good luck! 🚀
