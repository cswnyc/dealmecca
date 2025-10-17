# Bulk Import Quick Reference

## Required Fields
- `firstName`, `lastName`, `title`, `companyName`, `seniority`

## Optional Fields
- `email`, `phone`, `linkedinUrl`, `personalEmail`
- `department`, `isDecisionMaker`, `verified`, `photoUrl`

## Seniority Values
`C_LEVEL`, `VP`, `SVP`, `EVP`, `DIRECTOR`, `SENIOR_DIRECTOR`, `MANAGER`, `SENIOR_MANAGER`, `SENIOR`, `ASSOCIATE`, `COORDINATOR`, `ANALYST`, `SPECIALIST`, `UNKNOWN`

## Department Values
`MARKETING`, `SALES`, `BUSINESS_DEVELOPMENT`, `ACCOUNT_MANAGEMENT`, `CREATIVE`, `STRATEGY`, `MEDIA`, `OPERATIONS`, `TECHNOLOGY`, `FINANCE`, `HR`, `EXECUTIVE`

## Photo URLs
- ✅ Direct image URLs (JPG, PNG, WebP)
- ✅ Public CDN URLs
- ❌ LinkedIn profile photos (blocked)
- Leave empty for auto-generated avatars

## Company Matching
- Exact name match (case-insensitive)
- Creates new company if no match
- Review auto-created companies after import

## Tips
- Start with 10-20 contacts for testing
- Max 1000 contacts per CSV
- UTF-8 encoding required
- Check [Full Guide](/docs/BULK_IMPORT_GUIDE.md) for details
