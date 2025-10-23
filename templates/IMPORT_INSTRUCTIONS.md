# CSV Creation Instructions

## Step-by-Step Guide to Creating Your Import File

### Option 1: Google Sheets (Recommended - Easiest)

1. **Open Google Sheets**: https://sheets.google.com
2. **Create new spreadsheet**
3. **Copy the headers below into Row 1**:

```
companyName	firstName	lastName	title	email	phone	linkedinUrl	department	industry	employeeCount	revenue	headquarters	description	website	domain	companyType	parentCompanyId
```

4. **Fill in your data** starting from Row 2
5. **Download as CSV**: File → Download → Comma-separated values (.csv)

### Option 2: Excel

1. **Open Excel**
2. **Create new workbook**
3. **Add the same headers in Row 1** (see above)
4. **Fill in your data** starting from Row 2
5. **Save as CSV**: File → Save As → Choose "CSV (Comma delimited)"

## Column-by-Column Instructions

### Column A: companyName ⭐ REQUIRED
**What to enter**: Full legal name of the agency
- ✅ Good: "Mindshare", "Ogilvy", "OMD Worldwide"
- ❌ Bad: "mindshare" (lowercase), "Mindshare LLC" (with legal suffix)

**Tips**:
- Use official company name from their website
- Be consistent - if you enter "Mindshare" for one contact, use "Mindshare" for all contacts at that company
- System will group contacts at the same company automatically

---

### Column B: firstName ⭐ REQUIRED
**What to enter**: Contact's first name
- ✅ Good: "Sarah", "Michael", "Mary-Ann"
- ❌ Bad: "SARAH" (all caps), "S." (just initial)

---

### Column C: lastName ⭐ REQUIRED
**What to enter**: Contact's last name
- ✅ Good: "Johnson", "Chen", "O'Brien"
- ❌ Bad: "johnson" (lowercase)

---

### Column D: title ⭐ REQUIRED
**What to enter**: Exact job title
- ✅ Good: "VP of Media Strategy", "Director of Programmatic", "Global Media Director"
- ❌ Bad: "VP" (too short), "head of media stuff" (informal)

**Important**: System auto-detects seniority and decision-making power from this field!
- C-level keywords: CEO, CMO, Chief, President
- VP keywords: VP, Vice President, SVP, EVP
- Director keywords: Director, Head of
- Manager keywords: Manager, Lead

---

### Column E: email (Optional)
**What to enter**: Work email address
- ✅ Good: "sarah.johnson@mindshare.com"
- ❌ Bad: "sjohnson@gmail.com" (personal email)
- Leave blank if you don't have it

---

### Column F: phone (Optional)
**What to enter**: Phone number (any format works)
- ✅ Good: "+1-212-555-0100", "(212) 555-0100", "212-555-0100"
- Leave blank if you don't have it

---

### Column G: linkedinUrl (Optional)
**What to enter**: Full LinkedIn profile URL
- ✅ Good: "https://linkedin.com/in/sarahjohnson"
- ❌ Bad: "linkedin.com/in/sarahjohnson" (missing https://)
- Leave blank if you don't have it

---

### Column H: department (Optional)
**What to enter**: ONE of these exact values (copy/paste):

**Media & Planning**:
- `MEDIA_PLANNING`
- `MEDIA_BUYING`
- `PROGRAMMATIC`

**Marketing & Digital**:
- `DIGITAL_MARKETING`
- `SOCIAL_MEDIA`
- `SEARCH_MARKETING`
- `MARKETING`

**Strategy & Analytics**:
- `STRATEGY_PLANNING`
- `ANALYTICS_INSIGHTS`
- `DATA_SCIENCE`

**Operations & Leadership**:
- `LEADERSHIP`
- `ACCOUNT_MANAGEMENT`
- `BUSINESS_DEVELOPMENT`
- `CREATIVE_SERVICES`
- `OPERATIONS`

**Other**:
- `TECHNOLOGY`, `FINANCE`, `HUMAN_RESOURCES`, `SALES`, `PRODUCT`

**Leave blank** if unsure - system will try to infer from title

---

### Column I: industry (Optional but recommended)
**What to enter**: Company's industry

**For advertising agencies**, use:
- `ENTERTAINMENT_MEDIA` ← **Use this for most agencies**

**For other companies**:
- `TECHNOLOGY`
- `FINANCIAL_SERVICES`
- `RETAIL_ECOMMERCE`
- `AUTOMOTIVE`
- `HEALTHCARE_PHARMA`
- `CPG_FOOD_BEVERAGE`
- `TRAVEL_HOSPITALITY`
- `TELECOM`
- (See full list in BULK_IMPORT_GUIDE.md)

---

### Column J: employeeCount (Optional)
**What to enter**: Company size range
- `1-50`
- `50-200`
- `200-500`
- `500-1000`
- `1000-5000`
- `5000-10000`
- `10000+`

---

### Column K: revenue (Optional)
**What to enter**: Annual revenue range
- `<$10M`
- `$10M-$50M`
- `$50M-$100M`
- `$100M-$500M`
- `$500M-$1B`
- `$1B+`

---

### Column L: headquarters (Optional)
**What to enter**: City, State/Country
- ✅ Good: "New York, NY", "London, UK", "Chicago, IL"
- ❌ Bad: "NYC" (use full name)

---

### Column M: description (Optional)
**What to enter**: Brief 1-2 sentence company description
- ✅ Good: "Global media planning and buying agency specializing in data-driven campaigns"
- Only needs to be filled in once per company (first row for that company)

---

### Column N: website (Optional)
**What to enter**: Full company website URL
- ✅ Good: "https://www.mindshare.com"
- ❌ Bad: "mindshare.com" (missing https://www.)
- Only needs to be filled in once per company

---

### Column O: domain (Optional)
**What to enter**: Just the domain name
- ✅ Good: "mindshare.com"
- ❌ Bad: "https://www.mindshare.com" (too much)
- Only needs to be filled in once per company

---

### Column P: companyType (Optional but recommended)
**What to enter**: ONE of these exact values:

**For agencies owned by holding companies** (WPP, Omnicom, Publicis, IPG, Dentsu, Havas, Stagwell, S4):
- `HOLDING_COMPANY_AGENCY` ← **Use this for most agencies**

**For independent agencies**:
- `INDEPENDENT_AGENCY`

**For tech vendors**:
- `ADTECH_VENDOR`
- `MARTECH_VENDOR`

**For advertisers/brands**:
- `NATIONAL_ADVERTISER`
- `LOCAL_ADVERTISER`

---

### Column Q: parentCompanyId ⭐ IMPORTANT
**What to enter**: ID of the holding company (if applicable)

**Copy one of these EXACT IDs**:

| If agency is owned by... | Enter this ID |
|--------------------------|---------------|
| WPP | `bs9onwht0250wp5kvprew9dz` |
| Omnicom Group | `c6wr8muype9yfog2tfku1ogk` |
| Publicis Groupe | `eqzewythezl1zq4fp3a6e1z3` |
| Interpublic Group (IPG) | `b7jdsq0bwab8ouheju0td6cj` |
| Dentsu | `g9z6l8c3h28bmmxs75mtaa72` |
| Havas | `oltyuqj73d2ac34cjt1d4oin` |
| Stagwell | `bk2hnab67czrf62ejull8qnx` |
| S4 Capital | `p9l34we3he6tqo9f450vdbcc` |
| Independent agency | Leave blank |

**Example**: If importing contacts from Mindshare (owned by WPP), use `bs9onwht0250wp5kvprew9dz`

---

## Example Filled Rows

### Example 1: Multiple contacts at same agency (Mindshare - WPP)

```
Mindshare	Sarah	Johnson	VP of Media Strategy	sarah.johnson@mindshare.com	+1-212-555-0100	https://linkedin.com/in/sarahjohnson	MEDIA_PLANNING	ENTERTAINMENT_MEDIA	5000-10000	$1B+	New York, NY	Global media planning and buying agency	https://www.mindshare.com	mindshare.com	HOLDING_COMPANY_AGENCY	bs9onwht0250wp5kvprew9dz

Mindshare	Michael	Chen	Director of Programmatic	michael.chen@mindshare.com	+1-212-555-0101		PROGRAMMATIC	ENTERTAINMENT_MEDIA						HOLDING_COMPANY_AGENCY	bs9onwht0250wp5kvprew9dz
```

**Note**: Second row has less company info - that's fine! System will use info from first row.

### Example 2: Different agency (OMD - Omnicom)

```
OMD	Jessica	Williams	Global Media Director	jessica.williams@omd.com		https://linkedin.com/in/jessicawilliams	MEDIA_BUYING	ENTERTAINMENT_MEDIA	5000-10000	$1B+	New York, NY	Omnicom media agency	https://www.omd.com	omd.com	HOLDING_COMPANY_AGENCY	c6wr8muype9yfog2tfku1ogk
```

---

## Pro Tips

1. **Use copy/paste for enum values** - Don't type them manually (risk of typos)
2. **Fill company info once** - For multiple contacts at same company, only fill company columns (I-Q) on the first row
3. **Required fields only for testing** - Start with just: companyName, firstName, lastName, title
4. **Add more data later** - You can always edit companies/contacts in the admin UI after import
5. **Check spelling** - Especially for enum values like department, industry, companyType
6. **Keep it simple** - Better to have accurate basic data than incomplete detailed data

---

## Quick Checklist Before Import

- [ ] Column headers exactly match (Row 1)
- [ ] All rows have: companyName, firstName, lastName, title
- [ ] Department values are from the approved list (if used)
- [ ] Industry values are from the approved list (if used)
- [ ] CompanyType values are from the approved list (if used)
- [ ] ParentCompanyId matches one of the 8 holding company IDs (if used)
- [ ] Saved as .csv file (not .xlsx)

---

## Need Help?

If you get stuck or have questions about specific fields, just ask!
