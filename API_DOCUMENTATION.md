# DealMecca API Documentation

## Overview

The DealMecca API provides access to companies, contacts, and user management functionality with role-based access control and subscription tier enforcement.

**Base URL**: `http://localhost:3000/api`

## Authentication

All API endpoints require authentication via NextAuth.js session cookies, except for authentication endpoints themselves.

### User Roles & Tiers
- **FREE**: 10 searches/month, basic access
- **PRO**: Unlimited searches, advanced features
- **TEAM**: Team management features
- **ADMIN**: Full system access, can create/edit/delete data

## Companies API

### GET /api/companies

List and search companies with advanced filtering options.

**Parameters:**
- `q` (string): Search query for company name, description, or industry
- `type` (string): Company type filter (`ADVERTISER`, `AGENCY`, `MEDIA_COMPANY`, `TECH_VENDOR`, `PUBLISHER`, `PRODUCTION_COMPANY`)
- `industry` (string): Industry filter (partial match)
- `minEmployees` (number): Minimum employee count
- `maxEmployees` (number): Maximum employee count
- `headquarters` (string): Headquarters location filter (partial match)
- `sortBy` (string): Sort field (`name`, `employeeCount`, `createdAt`, `updatedAt`) - default: `name`
- `sortOrder` (string): Sort direction (`asc`, `desc`) - default: `asc`
- `includeContacts` (boolean): Include top decision makers - default: `true`
- `page` (number): Page number - default: `1`
- `limit` (number): Results per page (max 50) - default: `10`

**Response:**
```json
{
  "companies": [
    {
      "id": "company_id",
      "name": "Company Name",
      "type": "ADVERTISER",
      "industry": "Technology",
      "description": "Company description",
      "website": "https://company.com",
      "employeeCount": 1000,
      "headquarters": "New York, NY",
      "revenue": "$1B+",
      "parentCompany": "Parent Corp",
      "contacts": [
        {
          "id": "contact_id",
          "name": "John Doe",
          "title": "Director of Marketing",
          "email": "john@company.com",
          "isDecisionMaker": true,
          "department": "Marketing"
        }
      ],
      "_count": {
        "contacts": 15
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "totalPages": 16
  },
  "filters": {
    "query": "tech",
    "type": null,
    "industry": "Technology",
    "minEmployees": 100,
    "maxEmployees": null,
    "headquarters": null,
    "sortBy": "name",
    "sortOrder": "asc",
    "includeContacts": true
  },
  "searchInfo": {
    "userTier": "PRO",
    "searchTracked": true
  }
}
```

### GET /api/companies/[id]

Get detailed company information including all contacts.

**Response:**
```json
{
  "id": "company_id",
  "name": "Company Name",
  // ... all company fields
  "contacts": [
    {
      "id": "contact_id",
      "name": "John Doe",
      "title": "Director of Marketing",
      "email": "john@company.com",
      "phone": "+1-555-123-4567",
      "isDecisionMaker": true,
      "department": "Marketing",
      "seniority": "Director"
    }
  ]
}
```

### POST /api/companies

Create a new company (Admin only).

**Request Body:**
```json
{
  "name": "New Company",
  "type": "ADVERTISER",
  "industry": "Technology",
  "description": "Company description",
  "website": "https://newcompany.com",
  "employeeCount": 500,
  "headquarters": "San Francisco, CA",
  "revenue": "$100M+",
  "parentCompany": "Parent Corp"
}
```

### PUT /api/companies/[id]

Update company information (Admin only).

### DELETE /api/companies/[id]

Delete a company and all related contacts (Admin only).

## Contacts API

### GET /api/contacts

List and search contacts with filtering options.

**Parameters:**
- `q` (string): Search query for contact name, title, department, or company name
- `companyId` (string): Filter by specific company
- `title` (string): Job title filter (partial match)
- `department` (string): Department filter (partial match)
- `isDecisionMaker` (boolean): Filter by decision maker status
- `page` (number): Page number - default: `1`
- `limit` (number): Results per page - default: `10`

**Response:**
```json
{
  "contacts": [
    {
      "id": "contact_id",
      "name": "Jane Smith",
      "title": "VP of Marketing",
      "email": "jane@company.com",
      "phone": "+1-555-987-6543",
      "linkedinUrl": "https://linkedin.com/in/janesmith",
      "isDecisionMaker": true,
      "department": "Marketing",
      "seniority": "VP",
      "company": {
        "id": "company_id",
        "name": "Company Name",
        "type": "ADVERTISER",
        "industry": "Technology"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  },
  "searchInfo": {
    "userTier": "PRO",
    "searchTracked": true
  }
}
```

### GET /api/contacts/[id]

Get detailed contact information including company details.

### POST /api/contacts

Create a new contact (Admin only).

**Request Body:**
```json
{
  "companyId": "company_id",
  "name": "New Contact",
  "title": "Marketing Manager",
  "email": "contact@company.com",
  "phone": "+1-555-111-2222",
  "linkedinUrl": "https://linkedin.com/in/newcontact",
  "isDecisionMaker": false,
  "department": "Marketing",
  "seniority": "Manager"
}
```

### PUT /api/contacts/[id]

Update contact information (Admin only).

### DELETE /api/contacts/[id]

Delete a contact (Admin only).

## User Management API

### GET /api/users/profile

Get current user profile information.

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "PRO",
  "subscriptionTier": "PRO",
  "searchesUsed": 5,
  "searchesResetAt": "2024-01-01T00:00:00Z",
  "createdAt": "2023-12-01T00:00:00Z"
}
```

## Search Tracking API

### POST /api/search/track

Record a search action (automatically called by other endpoints).

## Authentication API

### POST /api/auth/signin

Sign in with email and password.

### POST /api/auth/signout

Sign out current user.

## Error Responses

All endpoints may return these error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden (Search Limit Exceeded)
```json
{
  "error": "Search limit exceeded",
  "message": "Free users are limited to 10 searches per month. Upgrade to Pro for unlimited searches.",
  "upgradeUrl": "/upgrade"
}
```

### 403 Forbidden (Admin Required)
```json
{
  "error": "Admin access required",
  "message": "Only administrators can create new companies"
}
```

### 404 Not Found
```json
{
  "error": "Company not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- **Free users**: 10 searches per month (searches with `q` parameter)
- **Pro/Team users**: Unlimited searches
- **All users**: API requests are limited by Next.js middleware

## Testing

Run the comprehensive API test suite:

```bash
npm run test:api
```

This will test all endpoints with different user roles and verify:
- Authentication and authorization
- Search functionality and limits
- CRUD operations for admins
- Error handling
- Data consistency

## Notes

- All timestamps are in ISO 8601 format
- Search queries are case-insensitive
- Pagination starts at page 1
- Maximum page size is 50 items
- Search tracking only applies to queries with the `q` parameter
- Company deletion cascades to delete all related contacts
- Admin operations require ADMIN role, not just PRO tier 