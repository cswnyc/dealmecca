# DealMecca API Routes Documentation

## Overview
DealMecca provides a comprehensive REST API built on Next.js 15 App Router. The API supports authentication, role-based access control, and provides endpoints for all platform functionality.

## API Structure

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://dealmecca.com/api`

### Response Format
All API responses follow a consistent format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}
```

## Authentication Routes

### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "FREE"
    }
  }
}
```

### NextAuth.js Routes
- `GET/POST /api/auth/signin` - Sign in page and authentication
- `GET/POST /api/auth/signout` - Sign out functionality
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - CSRF token
- `GET /api/auth/providers` - Available auth providers

## User Management Routes

### GET `/api/users/profile`
Get current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "PRO",
    "subscriptionTier": "PRO",
    "searchesUsed": 45,
    "searchesThisMonth": 45,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PATCH `/api/users/profile`
Update user profile information.

**Request Body:**
```json
{
  "name": "Updated Name",
  "annualEventGoal": 10,
  "annualNetworkingGoal": 150
}
```

### GET `/api/users/[id]`
Get user by ID (Admin only).

### GET `/api/users/[id]/events`
Get events for a specific user.

## Company Routes

### GET `/api/companies`
**Public endpoint** - Get paginated company listings.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search term
- `industry` (string[]): Filter by industries
- `size` (string[]): Filter by company sizes
- `location` (string[]): Filter by locations
- `verified` (boolean): Filter by verification status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "company_id",
      "name": "Company Name",
      "industry": "Advertising Agency",
      "size": "51-200",
      "location": "New York, NY",
      "verified": true,
      "verificationScore": 85,
      "logoUrl": "https://example.com/logo.png",
      "contactCount": 25
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "hasMore": true
  }
}
```

### GET `/api/companies/[id]`
Get detailed company information including contacts.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "company_id",
    "name": "Company Name",
    "website": "https://company.com",
    "description": "Company description",
    "industry": "Digital Agency",
    "size": "51-200",
    "location": "San Francisco, CA",
    "contacts": [
      {
        "id": "contact_id",
        "firstName": "Jane",
        "lastName": "Smith",
        "title": "Marketing Director",
        "email": "jane@company.com",
        "leadScore": 75
      }
    ]
  }
}
```

### GET `/api/companies/[id]/insights`
Get company insights and analytics (Pro/Admin only).

## Contact Routes

### GET `/api/orgs/contacts`
Get paginated contact listings with filtering.

**Query Parameters:**
- `page`, `limit`: Pagination
- `search`: Search across names and titles
- `industry`: Filter by company industry
- `seniority`: Filter by seniority level
- `department`: Filter by department
- `verificationLevel`: Minimum verification level

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contact_id",
      "firstName": "John",
      "lastName": "Doe",
      "title": "VP Marketing",
      "email": "john@company.com",
      "department": "Marketing",
      "seniority": "VP/SVP",
      "company": {
        "name": "Company Name",
        "industry": "Ad Tech"
      },
      "leadScore": 82,
      "verificationLevel": 3
    }
  ]
}
```

### GET `/api/contacts/[id]`
Get detailed contact information.

### POST `/api/contacts/[id]/interactions`
Log interaction with a contact.

**Request Body:**
```json
{
  "interactionType": "EMAIL",
  "notes": "Sent pricing information",
  "outcome": "POSITIVE",
  "followUpDate": "2024-02-15T10:00:00.000Z"
}
```

## Forum Routes

### GET `/api/forum/categories`
**Public endpoint** - Get all forum categories.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "category_id",
      "name": "Hot Opportunities",
      "slug": "hot-opportunities",
      "description": "Share and discover hot business opportunities",
      "color": "#ef4444",
      "icon": "🔥",
      "postCount": 45,
      "order": 1
    }
  ]
}
```

### GET `/api/forum/posts`
**Public endpoint (GET only)** - Get forum posts with pagination and filtering.

**Query Parameters:**
- `page`, `limit`: Pagination
- `categoryId`: Filter by category
- `search`: Search in titles and content
- `tags`: Filter by tags
- `urgency`: Filter by urgency level
- `sortBy`: Sort order (newest, popular, trending)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "post_id",
      "title": "Looking for Media Buyers in NYC",
      "content": "We have a client looking for...",
      "slug": "looking-for-media-buyers-nyc",
      "author": {
        "name": "John Doe",
        "email": "john@agency.com"
      },
      "category": {
        "name": "Hot Opportunities",
        "slug": "hot-opportunities"
      },
      "urgency": "HIGH",
      "views": 145,
      "upvotes": 12,
      "commentCount": 5,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### POST `/api/forum/posts`
Create a new forum post (Authenticated users only).

**Request Body:**
```json
{
  "title": "Post Title",
  "content": "Post content with details...",
  "categoryId": "category_id",
  "tags": ["media-buying", "nyc"],
  "urgency": "MEDIUM",
  "postType": "post"
}
```

### GET `/api/forum/posts/[id]`
Get detailed forum post with comments.

### PATCH `/api/forum/posts/[id]`
Update forum post (Author or Admin only).

### GET `/api/forum/posts/[id]/comments`
**Public endpoint** - Get comments for a forum post.

### POST `/api/forum/posts/[id]/comments`
Add comment to forum post (Authenticated users only).

**Request Body:**
```json
{
  "content": "Great opportunity! I'm interested.",
  "parentId": "parent_comment_id" // Optional for replies
}
```

### POST `/api/forum/posts/[id]/vote`
Vote on forum post (Authenticated users only).

**Request Body:**
```json
{
  "voteType": "UPVOTE" // or "DOWNVOTE"
}
```

## Event Routes

### GET `/api/events`
Get paginated event listings.

**Query Parameters:**
- `page`, `limit`: Pagination
- `search`: Search in titles and descriptions
- `eventType`: Filter by event type
- `startDate`, `endDate`: Date range filtering
- `location`: Filter by location

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "event_id",
      "title": "Digital Marketing Summit 2024",
      "description": "Annual summit for digital marketers",
      "location": "New York, NY",
      "startDate": "2024-03-15T09:00:00.000Z",
      "endDate": "2024-03-15T17:00:00.000Z",
      "eventType": "Conference",
      "attendeeCount": 45,
      "maxAttendees": 100
    }
  ]
}
```

### GET `/api/events/[id]`
Get detailed event information.

### POST `/api/events/[id]/rsvp`
RSVP to an event (Authenticated users only).

**Request Body:**
```json
{
  "status": "ATTENDING" // ATTENDING, NOT_ATTENDING, MAYBE
}
```

### GET `/api/events/[id]/attendees`
Get event attendees list.

### POST `/api/events/[id]/ratings`
Rate an event (Authenticated users only).

**Request Body:**
```json
{
  "rating": 5,
  "review": "Excellent event with great networking opportunities"
}
```

## Search Routes

### GET `/api/search/enhanced`
Advanced search across companies and contacts.

**Query Parameters:**
- `q`: Search query
- `type`: Search type (companies, contacts, all)
- `filters`: JSON string of filter object
- `page`, `limit`: Pagination
- `sortBy`: Sort criteria

### GET `/api/search/suggestions`
Get search suggestions and autocomplete.

**Query Parameters:**
- `q`: Partial search query
- `type`: Suggestion type (companies, contacts, industries)

### POST `/api/search/track`
Track search query for analytics (Authenticated users only).

**Request Body:**
```json
{
  "query": "marketing director nyc",
  "resultCount": 25,
  "filters": {
    "industry": ["Advertising Agency"],
    "seniority": ["Director"]
  }
}
```

## Admin Routes

### GET `/api/admin/stats`
Get platform statistics (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "activeThisMonth": 450,
      "newThisMonth": 85
    },
    "companies": {
      "total": 5600,
      "verified": 2800
    },
    "contacts": {
      "total": 45000,
      "highQuality": 12000
    },
    "forum": {
      "posts": 890,
      "comments": 2340,
      "activeUsers": 120
    }
  }
}
```

### POST `/api/admin/companies/[id]/verify`
Verify a company (Admin only).

### GET `/api/admin/contacts/bulk`
Bulk contact operations (Admin only).

### POST `/api/admin/contacts/bulk`
Bulk import contacts (Admin only).

## Subscription and Billing Routes

### GET `/api/stripe/checkout`
Create Stripe checkout session.

**Request Body:**
```json
{
  "priceId": "price_pro_monthly",
  "successUrl": "https://dealmecca.com/upgrade/success",
  "cancelUrl": "https://dealmecca.com/upgrade"
}
```

### POST `/api/stripe/webhook`
Handle Stripe webhooks for subscription management.

## Usage Tracking Routes

### GET `/api/usage`
Get current user's usage statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "searchesUsed": 45,
    "searchesAllowed": 1000,
    "exportsUsed": 5,
    "exportsAllowed": 50,
    "savedSearches": 8,
    "savedSearchesAllowed": 25,
    "resetDate": "2024-02-01T00:00:00.000Z"
  }
}
```

### POST `/api/usage/[action]`
Track usage actions (searches, exports, etc.).

## Health and Monitoring Routes

### GET `/api/health`
**Public endpoint** - Basic health check.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### GET `/api/health-check`
**Public endpoint** - Detailed health check including database.

## Error Handling

### Standard Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request parameters",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Valid email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Please log in to access search features",
  "code": "UNAUTHORIZED",
  "message": "You must be signed in to access search and user features.",
  "actionUrl": "/auth/signin",
  "actionText": "Sign In"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "code": "FORBIDDEN",
  "message": "Your current plan doesn't include access to this feature.",
  "actionUrl": "/upgrade",
  "actionText": "Upgrade Plan"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found",
  "code": "NOT_FOUND"
}
```

#### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 3600
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "message": "Something went wrong. Please try again later."
}
```

## Rate Limiting

### Limits by User Tier
- **FREE**: 100 requests/hour
- **PRO**: 1000 requests/hour  
- **TEAM**: 5000 requests/hour
- **ADMIN**: Unlimited

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
```

## Request/Response Examples

### Authentication Flow
```bash
# 1. Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'

# 2. Sign in (through NextAuth.js)
# Use the signin page or NextAuth.js client

# 3. Make authenticated request
curl -X GET http://localhost:3000/api/users/profile \
  -H "Cookie: next-auth.session-token=your_session_token"
```

### Search Companies
```bash
curl -X GET "http://localhost:3000/api/companies?search=marketing&industry=Agency&page=1&limit=10" \
  -H "Cookie: next-auth.session-token=your_session_token"
```

### Create Forum Post
```bash
curl -X POST http://localhost:3000/api/forum/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your_session_token" \
  -d '{
    "title": "Looking for Creative Directors",
    "content": "Client needs experienced creative directors...",
    "categoryId": "hot-opportunities",
    "tags": ["creative", "director"],
    "urgency": "HIGH"
  }'
```

## API Versioning
Currently using v1 (implicit). Future versions will use URL versioning:
- `GET /api/v1/companies`
- `GET /api/v2/companies`

## SDK and Integration
Consider the official DealMecca SDK for easier integration:
```bash
npm install @dealmecca/api-client
```

This comprehensive API provides all functionality needed to build applications on top of the DealMecca platform, with robust authentication, comprehensive data access, and professional-grade error handling.