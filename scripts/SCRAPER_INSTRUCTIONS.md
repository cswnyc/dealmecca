# SellerCrowd Contact Scraper - Instructions

## Quick Start

### Method 1: Run in Browser Console (Recommended for first time)

1. **Open SellerCrowd** and navigate to the agency contact list (e.g., WPP Media NY)
2. **Open Developer Tools**:
   - Mac: `Cmd + Option + J`
   - Windows/Linux: `Ctrl + Shift + J`
3. **Copy the script** from `sellercrowd-scraper.js`
4. **Paste into console** and press Enter
5. **Follow the prompts**:
   - Enter company name: "WPP Media NY"
   - Enter parent company ID (optional): "ftfgtb8jjw7holt6q6q14kir"
   - Click OK to auto-scroll and load all contacts
6. **Wait for extraction** - Script will:
   - Scroll through entire list
   - Extract all contact data
   - Download CSV file automatically
7. **Upload CSV** to your bulk import admin panel

## Method 2: Bookmarklet (One-Click Extraction)

### Create the Bookmarklet:

1. **Create new bookmark** in your browser
2. **Name it**: "Extract SellerCrowd"
3. **URL/Location**: Copy the minified version from `sellercrowd-bookmarklet.js`
4. **Save**

### Use the Bookmarklet:

1. Navigate to any SellerCrowd contact list
2. Click the "Extract SellerCrowd" bookmark
3. Follow the prompts
4. CSV downloads automatically!

## Troubleshooting

### Issue: "No contacts extracted"

**Cause**: SellerCrowd's HTML structure doesn't match the default selectors

**Fix**:
1. Open DevTools (F12)
2. Click the "Elements" tab
3. Use the inspector tool (top-left icon) to click on a contact card
4. Look at the HTML structure and note the class names
5. Update the `SELECTORS` object in the script:

```javascript
const SELECTORS = {
  contactCard: '.your-actual-class-name',  // Update this
  name: 'h3',                               // Update if needed
  title: '.title-class',                    // Update if needed
  email: 'a[href^="mailto:"]',             // Usually correct
  linkedin: 'a[href*="linkedin"]',         // Usually correct
};
```

### Common SellerCrowd Selectors

Based on typical React apps, try these:

```javascript
// Option 1: BEM naming
contactCard: '[class*="ContactCard"]'

// Option 2: Kebab case
contactCard: '[class*="contact-card"]'

// Option 3: Data attributes
contactCard: '[data-testid="contact-item"]'

// Option 4: Role attributes
contactCard: 'div[role="listitem"]'
```

### Issue: Not all contacts loaded

**Cause**: Infinite scroll didn't complete

**Fix**:
1. Manually scroll to the bottom first (until no new contacts load)
2. Run script and select "Cancel" when asked to scroll
3. Script will extract all currently visible contacts

### Issue: CSV format doesn't match bulk import

**Cause**: Headers might need adjustment

**Fix**:
1. Open the downloaded CSV
2. Ensure headers match this order:
   ```
   companyName,firstName,lastName,title,email,phone,linkedinUrl,department,industry,employeeCount,revenue,headquarters,description,website,domain,companyType,parentCompanyId
   ```
3. Adjust columns as needed

## Tips for Best Results

1. **Use good internet connection** - Prevents loading errors during scroll
2. **Close other tabs** - Reduces browser memory usage
3. **Don't interact with page** - While script is running
4. **Test on small list first** - Before running on 309 contacts
5. **Save parent company IDs** - Keep a reference file:

```
WPP: bs9onwht0250wp5kvprew9dz
WPP Media: ftfgtb8jjw7holt6q6q14kir
CMI Media Group: [ID]
Mindshare: [ID]
```

## Customizing for Your Needs

### Extract Additional Fields

Add to the extraction logic:

```javascript
// Example: Extract phone number
const phoneEl = element.querySelector('[class*="phone"]');
const phone = phoneEl ? phoneEl.textContent.trim() : '';

contacts.push({
  // ... existing fields
  phone: phone,  // Add new field
});
```

### Pre-fill Company Data

If all contacts belong to same company, modify the prompts:

```javascript
// Hardcode company info
const companyName = 'WPP Media NY';
const parentCompanyId = 'ftfgtb8jjw7holt6q6q14kir';
const website = 'https://www.wppmedia.com/';
const industry = 'ADVERTISING';
```

## Expected Output

### Console Output:
```
🚀 Starting SellerCrowd contact extraction...
📜 Scrolling to load all contacts...
   Scroll 1...
   Scroll 2...
   ...
✅ Reached end of list
🔍 Extracting contact data...
📊 Found 309 contact elements
   Processed 50 contacts...
   Processed 100 contacts...
   ...
✅ Successfully extracted 309 contacts
📄 Converting to CSV format...
💾 Downloading CSV...
✅ Download started!

============================================================
✅ EXTRACTION COMPLETE!
📊 Total contacts: 309
📁 Filename: WPP_Media_NY_contacts_1234567890.csv
============================================================
```

### CSV Output:
```csv
companyName,firstName,lastName,title,email,phone,linkedinUrl,department,...
WPP Media NY,Nicole,Flacks,Associate Client Investment Lead,nicole.flacks@groupm.com,,https://linkedin.com/in/nicoleflacks,,...
WPP Media NY,Ashley,Poag,Director Commerce,ashley.poag@wpp.com,,https://linkedin.com/in/ashleypoag,,...
```

## Batch Processing Multiple Agencies

To process hundreds of agencies efficiently:

1. **Create a tracking spreadsheet**:
   ```
   Agency Name | Parent ID | Date Extracted | Contacts Count | Status
   WPP Media NY | ftf... | 2025-10-22 | 309 | ✅ Complete
   CMI Media | ftf... | - | - | ⏳ Pending
   ```

2. **Process in batches**:
   - 5-10 agencies per day
   - Verify CSV quality before bulk upload
   - Keep backups of all CSVs

3. **Use bookmarklet for speed**:
   - One click per agency
   - ~2-3 minutes per extraction including prompts

4. **Bulk upload strategy**:
   - Upload agency data first (via admin panel)
   - Then upload all contacts CSVs
   - Monitor for errors in each batch

## Need Help?

If the script doesn't work:

1. **Check browser console** for error messages
2. **Inspect HTML structure** and update selectors
3. **Export sample HTML**: Right-click on contact list → Inspect → Copy outer HTML
4. **Share structure** so script can be customized

## Performance

- **Small lists** (< 50 contacts): ~10 seconds
- **Medium lists** (50-200 contacts): ~30 seconds
- **Large lists** (200-500 contacts): ~60-90 seconds
- **Extra large** (500+ contacts): ~2-3 minutes

Time includes scrolling, extraction, and CSV generation.
