# Bulk Contact Import Guide

This guide explains how to bulk import contacts into DealMecca using CSV files.

## Quick Start

1. **Download the template**: [contacts-import-template.csv](/templates/contacts-import-template.csv)
2. **Fill in your contact data** (see field descriptions below)
3. **Go to Admin Panel**: [http://localhost:3000/admin/bulk-import](http://localhost:3000/admin/bulk-import)
4. **Upload your CSV** and review the import

---

## CSV Template Fields

### Required Fields ⚠️

| Field | Description | Example |
|-------|-------------|---------|
| `firstName` | Contact's first name (2-50 chars) | `John` |
| `lastName` | Contact's last name (2-50 chars) | `Doe` |
| `title` | Job title (2-100 chars) | `VP of Marketing` |
| `companyName` | Company name (will auto-create if doesn't exist) | `Acme Corporation` |
| `seniority` | Seniority level (see valid values below) | `VP` |

### Optional Fields

| Field | Description | Example | Format |
|-------|-------------|---------|--------|
| `email` | Business email | `john.doe@acme.com` | Valid email format |
| `phone` | Phone number | `+1-555-0100` | Any format accepted |
| `linkedinUrl` | LinkedIn profile URL | `https://linkedin.com/in/johndoe` | Full LinkedIn URL |
| `personalEmail` | Personal email | `john@gmail.com` | Valid email format |
| `department` | Department (see valid values below) | `MARKETING` | Must match enum |
| `isDecisionMaker` | Is this person a decision maker? | `true` or `false` | Boolean |
| `verified` | Is contact information verified? | `true` or `false` | Boolean |
| `photoUrl` | URL to contact photo | `https://example.com/photo.jpg` | Valid image URL |

---

## Valid Enum Values

### Department Values
```
MARKETING
SALES
BUSINESS_DEVELOPMENT
ACCOUNT_MANAGEMENT
CREATIVE
STRATEGY
MEDIA
OPERATIONS
TECHNOLOGY
FINANCE
HR
EXECUTIVE
```

### Seniority Values
```
C_LEVEL          # CEO, CFO, CMO, etc.
VP               # Vice President
SVP              # Senior Vice President
EVP              # Executive Vice President
DIRECTOR         # Director
SENIOR_DIRECTOR  # Senior Director
MANAGER          # Manager
SENIOR_MANAGER   # Senior Manager
SENIOR           # Senior Level (non-manager)
ASSOCIATE        # Associate
COORDINATOR      # Coordinator
ANALYST          # Analyst
SPECIALIST       # Specialist
UNKNOWN          # Unknown seniority
```

---

## Photo URL Requirements

The `photoUrl` field accepts:
- ✅ Direct image URLs (JPG, PNG, WebP)
- ✅ Public CDN URLs
- ✅ Vercel Blob Storage URLs
- ❌ Cannot be LinkedIn profile photos (blocked by LinkedIn)
- ❌ Cannot be password-protected URLs

**What happens if no photo URL is provided?**
- Auto-generated avatar will be created using:
  - Gravatar (if email provided)
  - DiceBear (initials-based avatar)

**Photo URL Examples:**
```csv
# Good examples
https://example.com/photos/john-doe.jpg
https://cdn.example.com/avatars/jane.png
https://blob.vercel-storage.com/contacts/photo-abc123.jpg

# Will be skipped (invalid)
linkedin.com/in/johndoe
http://private.intranet/photo.jpg
```

---

## Company Matching & Auto-Creation

### How Companies Are Matched

The system matches companies by **exact name** (case-insensitive):

1. **Exact match found**: Contact is linked to existing company
2. **No match found**: New company is created automatically

### Auto-Created Company Details

When a company doesn't exist, it's created with:
- **Name**: From `companyName` field
- **Type**: `UNKNOWN` (can be updated later in admin panel)
- **Status**: Active
- **Verification**: Unverified (needs manual review)
- **Logo**: Auto-generated placeholder

**Example:**
```csv
companyName
Acme Corporation        # If exists: use it, if not: create it
ACME CORPORATION        # Matches "Acme Corporation" (case-insensitive)
Acme Corp              # No match - creates new company "Acme Corp"
```

### Best Practices

- ✅ Use consistent company names across your CSV
- ✅ Check existing companies first in Admin Panel > Organizations > Companies
- ✅ Review auto-created companies after import
- ❌ Don't use abbreviations if full name exists in system

---

## Data Validation Rules

### Email Validation
- Must be valid email format: `user@domain.com`
- Business email and personal email must be different
- Duplicate emails across contacts are allowed (same person at multiple companies)

### Phone Validation
- Accepts any format: `+1-555-0100`, `(555) 123-4567`, `5551234567`
- International numbers supported
- No strict formatting required

### LinkedIn URL Validation
- Must start with `https://linkedin.com/in/` or `https://www.linkedin.com/in/`
- Must include profile slug: `https://linkedin.com/in/johndoe`
- ❌ Invalid: `linkedin.com/in/johndoe` (missing https://)

### Name Validation
- First name: 2-50 characters
- Last name: 2-50 characters
- No special characters restrictions
- Unicode/international names supported

---

## Import Process

### Step 1: Prepare Your CSV

```csv
firstName,lastName,title,email,companyName,seniority,department,verified
John,Doe,VP of Marketing,john@acme.com,Acme Corporation,VP,MARKETING,true
Jane,Smith,Sales Director,jane@techcorp.com,TechCorp Inc,DIRECTOR,SALES,true
```

### Step 2: Upload & Validate

1. Go to [/admin/bulk-import](http://localhost:3000/admin/bulk-import)
2. Click "Choose File" and select your CSV
3. System validates:
   - ✓ Required fields present
   - ✓ Enum values correct
   - ✓ Email formats valid
   - ✓ No duplicate contacts at same company

### Step 3: Review Preview

The system shows:
- ✅ Valid contacts (green)
- ⚠️ Warnings (yellow) - will import but needs review
- ❌ Errors (red) - will be skipped

### Step 4: Confirm Import

- Click "Import Contacts"
- Progress bar shows real-time status
- Results summary displayed when complete

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required field: firstName" | Empty firstName cell | Fill in all required fields |
| "Invalid email format" | Malformed email | Use format: `user@domain.com` |
| "Invalid seniority value" | Wrong enum value | Use values from Seniority Values list |
| "Duplicate contact at company" | Contact already exists | Update existing contact instead |
| "Invalid LinkedIn URL" | Wrong URL format | Use: `https://linkedin.com/in/username` |

### Partial Import

- ✅ Valid rows will be imported
- ❌ Invalid rows will be skipped
- 📊 Summary report shows what was imported and what failed

---

## Advanced Features

### Update Existing Contacts

To update instead of create:
- Match is based on: `firstName + lastName + companyName`
- Existing contact will be updated with new data
- Photos are preserved unless new `photoUrl` provided
- Auto-generated photos are replaced if better data available

### Bulk Photo Import

1. **Option A: Direct URLs**
   ```csv
   photoUrl
   https://cdn.example.com/photos/john.jpg
   https://example.com/images/jane.png
   ```

2. **Option B: Upload photos after import**
   - Import contacts without photos
   - Use Admin Panel to upload photos one-by-one
   - Photos uploaded via admin panel are optimized and stored in Vercel Blob

### Verification Status

- `verified=true`: Contact info has been manually verified
- `verified=false`: Needs verification (default)
- Verified contacts show ✓ badge in UI
- Affects data quality score

---

## Performance Tips

### Import Size Limits

- **Recommended**: 100-500 contacts per CSV
- **Maximum**: 1000 contacts per CSV
- **Processing time**: ~1-2 seconds per 100 contacts

### Large Imports

For 1000+ contacts:
1. Split into multiple CSVs (500 each)
2. Import sequentially
3. Monitor progress in Admin Dashboard
4. Review auto-created companies between batches

### Database Performance

After large imports:
- System automatically updates company contact counts
- Search index rebuilds automatically
- No manual intervention needed

---

## Post-Import Checklist

✅ **Review Auto-Created Companies**
- Go to Admin > Organizations > Companies
- Filter by "Unverified"
- Update company types (AGENCY, BRAND, VENDOR, etc.)
- Add company details (website, description, industry)

✅ **Verify Contact Photos**
- Check contacts with auto-generated avatars
- Upload real photos for key contacts
- Remove broken photo URLs

✅ **Update Verification Status**
- Mark verified contacts
- Add notes to contacts
- Set decision makers

✅ **Test Search**
- Search for newly imported contacts
- Verify filtering works correctly
- Check organization charts

---

## Troubleshooting

### CSV Not Uploading

**Issue**: File upload fails
**Solutions**:
- Check file size (max 10MB)
- Ensure UTF-8 encoding
- Remove special characters from filename
- Try re-saving as CSV from Excel

### Company Not Matching

**Issue**: Creates duplicate companies
**Solutions**:
- Check exact spelling: "Acme Corp" ≠ "Acme Corporation"
- Remove extra spaces
- Use consistent casing
- Check companies list first: `/admin/orgs/companies`

### Photos Not Loading

**Issue**: Photo URLs don't show images
**Solutions**:
- Verify URL is publicly accessible
- Check image format (JPG, PNG, WebP only)
- Ensure HTTPS (not HTTP)
- Test URL in browser first
- Remove LinkedIn URLs (they block external access)

### Validation Errors

**Issue**: Many contacts failing validation
**Solutions**:
- Download template and compare headers
- Check enum values match exactly (case-sensitive)
- Validate emails externally first
- Remove empty rows at end of CSV

---

## Example Import Scenarios

### Scenario 1: Basic Contact List

**Goal**: Import 10 contacts with minimal data

```csv
firstName,lastName,title,companyName,seniority
John,Doe,Marketing VP,Acme Corp,VP
Jane,Smith,Sales Director,TechCo,DIRECTOR
```

**Result**:
- ✅ 10 contacts created
- ⚠️ 2 companies auto-created
- 💡 Auto-generated avatars used

### Scenario 2: Verified Contacts with Photos

**Goal**: Import verified contacts with professional photos

```csv
firstName,lastName,title,email,companyName,seniority,verified,photoUrl
John,Doe,VP Marketing,john@acme.com,Acme Corporation,VP,true,https://cdn.example.com/john.jpg
```

**Result**:
- ✅ Contacts created with verified badge
- ✅ Photos loaded from URLs
- ✅ Higher data quality scores

### Scenario 3: Update Existing Contacts

**Goal**: Update existing contacts with new titles

```csv
firstName,lastName,title,companyName,seniority
John,Doe,SVP of Marketing,Acme Corporation,SVP
```

**Result**:
- ✅ Existing "John Doe at Acme Corporation" updated
- ✅ Title changed: VP → SVP
- ✅ Seniority changed: VP → SVP
- ✅ Other data preserved

---

## Support

### Questions?

- **Documentation**: Check `/docs` folder
- **Issues**: Report at GitHub Issues
- **Email**: support@dealmecca.com

### Best Practices Summary

✅ **DO**:
- Download and use the template
- Validate data in Excel/Sheets first
- Start with small test import (10-20 contacts)
- Review preview carefully before importing
- Update auto-created companies after import

❌ **DON'T**:
- Don't skip required fields
- Don't use LinkedIn photos as URLs
- Don't import without reviewing preview
- Don't ignore validation warnings
- Don't import 1000+ contacts at once without testing

---

## Version History

- **v1.0** (Current): Initial bulk import with photo support
  - Auto-generated avatars (Gravatar/DiceBear)
  - Photo URL import
  - Company auto-creation
  - Duplicate detection
  - Update existing contacts

---

**Ready to import?**

1. [Download Template](/templates/contacts-import-template.csv)
2. [Go to Bulk Import](/admin/bulk-import)
3. Upload and test with 5-10 contacts first
4. Review results and import larger batches

Happy importing! 🚀
