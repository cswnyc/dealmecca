# Bulk Import Guide - Real Agency & Contact Data

## Overview

This guide will help you prepare real agency and contact data for bulk import into DealMecca.

## CSV Format

### Required Columns (Must Have Data)

- **companyName** - Full company name (e.g., "Ogilvy", "Mindshare")
- **firstName** - Contact's first name
- **lastName** - Contact's last name
- **title** - Job title (e.g., "VP of Media Strategy", "Media Director")

### Optional Company Columns

- **parentCompanyId** - ID of holding company (use IDs from table below)
- **companyType** - Type of company (see Company Types section)
- **website** - Full website URL (e.g., "https://www.ogilvy.com")
- **domain** - Domain name (e.g., "ogilvy.com")
- **industry** - Industry vertical (see Industry Values section)
- **employeeCount** - Employee range (e.g., "1000-5000", "5000-10000")
- **revenue** - Revenue range (e.g., "$100M-$500M", "$1B+")
- **headquarters** - Location (e.g., "New York, NY", "London, UK")
- **description** - Brief company description

### Optional Contact Columns

- **email** - Contact's email address
- **phone** - Phone number (any format)
- **linkedinUrl** - LinkedIn profile URL
- **department** - Department (see Department Values section)

## Your Holding Company IDs

Use these IDs for the `parentCompanyId` column:

| Holding Company | ID |
|----------------|-----|
| WPP | `bs9onwht0250wp5kvprew9dz` |
| Omnicom Group | `c6wr8muype9yfog2tfku1ogk` |
| Publicis Groupe | `eqzewythezl1zq4fp3a6e1z3` |
| Interpublic Group (IPG) | `b7jdsq0bwab8ouheju0td6cj` |
| Dentsu | `g9z6l8c3h28bmmxs75mtaa72` |
| Havas | `oltyuqj73d2ac34cjt1d4oin` |
| Stagwell | `bk2hnab67czrf62ejull8qnx` |
| S4 Capital | `p9l34we3he6tqo9f450vdbcc` |

## Company Types

Valid values for `companyType`:

- `INDEPENDENT_AGENCY`
- `HOLDING_COMPANY_AGENCY` (agencies owned by holding companies)
- `MEDIA_HOLDING_COMPANY` (only for holding companies themselves)
- `NATIONAL_ADVERTISER`
- `LOCAL_ADVERTISER`
- `ADTECH_VENDOR`
- `MARTECH_VENDOR`
- `MEDIA_OWNER`
- `BROADCASTER`
- `PUBLISHER`

**Recommended:** Use `HOLDING_COMPANY_AGENCY` for agencies under WPP, Omnicom, etc.

## Industry Values

Valid values for `industry`:

- `ENTERTAINMENT_MEDIA` (recommended for advertising agencies)
- `AUTOMOTIVE`
- `TECHNOLOGY`
- `HEALTHCARE_PHARMA`
- `FINANCIAL_SERVICES`
- `RETAIL_ECOMMERCE`
- `CPG_FOOD_BEVERAGE`
- `CPG_PERSONAL_CARE`
- `FASHION_BEAUTY`
- `TRAVEL_HOSPITALITY`
- `TELECOM`
- `ENERGY`
- `EDUCATION`
- `REAL_ESTATE`
- `GAMING`
- `INSURANCE`
- `NONPROFIT`
- `GOVERNMENT_NONPROFIT`
- `B2B_SERVICES`
- `PROFESSIONAL_SERVICES`
- `LOGISTICS`

## Department Values

Valid values for `department`:

- `MARKETING`
- `MEDIA_PLANNING`
- `MEDIA_BUYING`
- `DIGITAL_MARKETING`
- `PROGRAMMATIC`
- `SOCIAL_MEDIA`
- `SEARCH_MARKETING`
- `STRATEGY_PLANNING`
- `ANALYTICS_INSIGHTS`
- `CREATIVE_SERVICES`
- `ACCOUNT_MANAGEMENT`
- `BUSINESS_DEVELOPMENT`
- `OPERATIONS`
- `TECHNOLOGY`
- `FINANCE`
- `LEADERSHIP`
- `HUMAN_RESOURCES`
- `SALES`
- `PRODUCT`
- `DATA_SCIENCE`

## Auto-Detection Features

The system will automatically:

- **Infer seniority** from job title (C-level, VP, Director, Manager, etc.)
- **Extract specializations** (Programmatic, Social, Search, Video, etc.)
- **Determine budget authority** (High, Medium, Low based on title)
- **Identify decision makers** (Directors and above)
- **Group multiple contacts** under the same company

## CSV Template Structure

```csv
companyName,firstName,lastName,title,email,phone,linkedinUrl,department,industry,employeeCount,revenue,headquarters,description,website,domain,companyType,parentCompanyId
```

## Example Row (Real Format)

```csv
Mindshare,Sarah,Johnson,VP of Media Strategy,sarah.johnson@mindshare.com,+1-212-555-0100,https://linkedin.com/in/sarahjohnson,MEDIA_PLANNING,ENTERTAINMENT_MEDIA,5000-10000,$1B+,"New York, NY",Global media agency,https://www.mindshare.com,mindshare.com,HOLDING_COMPANY_AGENCY,bs9onwht0250wp5kvprew9dz
```

## Tips for Preparing Your Data

1. **Start Small**: Prepare 50-100 records first as a test batch
2. **One Row Per Contact**: Each contact gets their own row
3. **Repeat Company Info**: If multiple contacts work at the same company, repeat the company columns for each row
4. **Leave Blanks**: If you don't have data for optional fields, just leave them empty
5. **Use Excel/Google Sheets**: Easier than text editor for CSV creation

## Import Process

### Step 1: Prepare Your CSV
- Create a CSV file with your real agency and contact data
- Use the template structure above
- Validate your data (check for typos in enum values)

### Step 2: Access Bulk Import
- Go to: `http://localhost:3000/admin/bulk-import` (development)
- Or: `https://your-domain.com/admin/bulk-import` (production)

### Step 3: Upload & Validate
- Upload your CSV file
- System will validate the data and show any errors
- Preview the data before importing

### Step 4: Import
- Click "Import" to add data to database
- System will:
  - Create companies (or link to existing ones)
  - Create contacts
  - Link contacts to companies
  - Auto-detect roles, seniority, and specializations

### Step 5: Verify
- Check imported data in admin interface
- Verify companies are linked to correct holding companies
- Check that contacts have correct titles and departments

## Common Questions

**Q: What if I import the same company twice?**
A: The system has duplicate detection - it will link to the existing company instead of creating a duplicate.

**Q: Can I add more contacts to a company later?**
A: Yes! Just create a new CSV with additional contacts for that company.

**Q: Do I need to include ALL columns?**
A: No. Only `companyName`, `firstName`, `lastName`, and `title` are required.

**Q: What if I don't know the parentCompanyId?**
A: Leave it blank for independent agencies. Only use it for agencies owned by the 8 holding companies.

**Q: Can I edit data after import?**
A: Yes! Use the admin interface to edit companies and contacts individually.

## Need Help?

If you have questions about preparing your data or need help with the import process, let me know!
