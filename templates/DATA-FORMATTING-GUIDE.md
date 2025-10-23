# 📊 Bulk Import Data Formatting Guide

This guide will help you prepare your data for importing into DealMecca.

## 📁 Template Files Created

1. **`bulk-import-template.csv`** - Blank template with all column headers
2. **`bulk-import-example.csv`** - 20 example records showing proper formatting

## ✅ Required Fields (Must Have)

These 4 fields are **absolutely required** for every row:

| Field | Description | Example |
|-------|-------------|---------|
| `companyName` | Full company name | "Warner Bros. Discovery" |
| `firstName` | Contact's first name | "Sarah" |
| `lastName` | Contact's last name | "Johnson" |
| `title` | Contact's job title | "VP of Advertising Sales" |

## 🎯 Highly Recommended Fields

Include these for better results:

| Field | Description | Example | Why Important |
|-------|-------------|---------|---------------|
| `email` | Contact email | "sarah@wbd.com" | Enables photo generation, prevents duplicates |
| `domain` or `website` | Company website | "wbd.com" or "https://wbd.com" | Auto-generates company logos |
| `companyType` | Company category | ADVERTISER, AGENCY, TECH_VENDOR, MEDIA_HOLDING_COMPANY | Enables filtering & organization |
| `industry` | Industry/vertical | "MEDIA", "ADVERTISING", "TECHNOLOGY" | Useful for segmentation |

## 📋 Optional Fields (Nice to Have)

| Field | Description | Example |
|-------|-------------|---------|
| `phone` | Contact phone | "212-555-0100" |
| `employeeCount` | Company size | 25000 (number, no commas) |
| `revenue` | Company revenue | "$40B" or "40000000000" |
| `headquarters` | Company HQ location | "New York, NY" |
| `description` | Company description | "Global media and entertainment company" |
| `department` | Contact's department | "advertising", "sales", "marketing" |
| `seniority` | Seniority level | "executive", "director", "manager", "specialist" |
| `linkedinUrl` | Contact LinkedIn profile | "https://linkedin.com/in/username" |
| `isDecisionMaker` | Decision maker status | true or false |

## 🎨 Formatting Rules

### Company Names
- ✅ Use full legal names: "Warner Bros. Discovery"
- ✅ Include punctuation: "NBCUniversal", "Publicis Media"
- ❌ Avoid abbreviations unless official: "WBD" → "Warner Bros. Discovery"

### Emails
- ✅ Valid format: "name@company.com"
- ✅ Lowercase preferred: "sarah@wbd.com"
- ❌ No spaces or special characters

### Websites/Domains
- ✅ Domain only: "wbd.com"
- ✅ Full URL: "https://wbd.com"
- ❌ Don't include paths: ~~"wbd.com/about"~~

### Company Type
Must be ONE of these exact values:
- `ADVERTISER` - Publishers, media companies, brands
- `AGENCY` - Advertising/media agencies
- `TECH_VENDOR` - Ad tech, martech, SaaS vendors
- `MEDIA_HOLDING_COMPANY` - Large holding companies (WPP, Omnicom, etc.)

### Employee Count & Revenue
- ✅ Numbers only: 25000 (not "25,000")
- ✅ Revenue with symbol: "$40B" or just numbers: 40000000000

### Boolean Fields (isDecisionMaker)
- ✅ Use: `true` or `false`
- ❌ Don't use: "yes", "no", "1", "0"

## 📝 How to Create Your CSV

### Option 1: Use Excel/Google Sheets (Easiest)
1. Open `bulk-import-template.csv` in Excel or Google Sheets
2. Fill in one row per contact person
3. Save as CSV when done

### Option 2: Use Google Sheets Template
1. Copy the example data from `bulk-import-example.csv`
2. Paste into Google Sheets
3. Replace with your real data
4. Download as CSV: File → Download → CSV

### Option 3: Use Your Existing Data
If you have existing data in another format:
1. Export to CSV from your current system
2. Map your columns to match our template
3. Use Excel/Sheets to rearrange columns if needed

## 🎯 For Your 100-200 Record Test

**Recommended approach:**
1. Start with your most important contacts (executives, key decision makers)
2. Include 5-10 different companies to test company grouping
3. Make sure you have a mix of:
   - Different company types (advertisers, agencies, vendors)
   - Complete vs. minimal data (to test both scenarios)
   - Contacts with and without emails

**Test dataset checklist:**
- [ ] 100-200 total rows
- [ ] 5-10 unique companies
- [ ] All 4 required fields filled for every row
- [ ] At least 50% have email addresses
- [ ] At least 50% have company websites
- [ ] Mix of seniority levels (executives, directors, managers)

## 🚀 What Happens During Import

The system will automatically:
1. **Group contacts by company** - Multiple contacts at same company are linked
2. **Generate logos** - Fetches company logos from Clearbit using domain/website
3. **Generate photos** - Creates contact photos using Gravatar (if email) or initials
4. **Detect duplicates** - Prevents importing same company/contact twice
5. **Smart merging** - Updates existing records if better data is provided
6. **Create relationships** - Links contacts to their companies

## ❓ Common Questions

**Q: What if I don't have email addresses?**
A: That's okay! Emails are optional. We'll generate placeholder photos using initials.

**Q: Can I have multiple contacts from the same company?**
A: Yes! The system groups them automatically. Use the exact same `companyName` for all contacts at that company.

**Q: What if company website is missing?**
A: We'll try to extract the domain from contact emails. But providing it gives better logo results.

**Q: Can I import the same data multiple times?**
A: Yes! The system has duplicate detection. If you import the same company/contact again, it will either skip or update the existing record (not create duplicates).

## 📞 Need Help?

If you're stuck or have questions about formatting your specific data, just ask!

---

## 🎯 Quick Start Checklist

- [ ] Download `bulk-import-template.csv`
- [ ] Open in Excel/Google Sheets
- [ ] Fill in at least 100 rows with real data
- [ ] Ensure all 4 required fields are filled
- [ ] Save as CSV
- [ ] Ready to import!
