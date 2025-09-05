# DealMecca Authentication System

## Overview
DealMecca uses NextAuth.js v4 with custom JWT handling and role-based access control. The system supports multiple authentication strategies and provides comprehensive session management.

## Authentication Flow

### 1. NextAuth.js Configuration
**Location**: `app/api/auth/[...nextauth]/route.ts`

```typescript
// Core authentication providers and configuration
providers: [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      // Custom authentication logic
      // Password verification with bcrypt
      // User lookup and validation
    }
  })
]
```

**Key Features**:
- Email/password authentication
- Secure password hashing with bcrypt
- JWT token generation and management
- Custom session handling

### 2. Middleware Authentication
**Location**: `middleware.ts`

The middleware provides route-level authentication and authorization:

#### Public Routes (No Authentication Required)
- `/` - Homepage
- `/auth/signin`, `/auth/signup` - Authentication pages
- `/forum` - Public forum access
- `/search`, `/orgs` - Public search and organization pages

#### Public API Routes
- `/api/health`, `/api/health-check` - System health endpoints
- `/api/companies-public` - Public company data
- `/api/forum/categories` - Forum category listings
- `/api/forum/posts` (GET only) - Public forum post access

#### Protected Routes
All other routes require authentication and proper role-based access.

### 3. Role-Based Access Control

#### User Roles
```typescript
enum Role {
  FREE = 'FREE',           // Basic access, limited features
  PRO = 'PRO',            // Enhanced access, more features
  ADMIN = 'ADMIN',        // Administrative access
  TEAM = 'TEAM'           // Team-based access
}
```

#### Subscription Tiers
```typescript
enum SubscriptionTier {
  FREE = 'FREE',          // 10 searches/month, 1 export, 3 saved searches
  PRO = 'PRO',           // 1000 searches/month, 50 exports, 25 saved searches
  TEAM = 'TEAM'          // 5000 searches/month, 200 exports, 100 saved searches
}
```

### 4. JWT Token Structure

#### JWT Callbacks
```typescript
jwt: async ({ token, user, account }) => {
  // Token creation and refresh logic
  // User data embedding
  // Role and subscription management
}

session: async ({ session, token }) => {
  // Session creation from JWT token
  // User data population
  // Role-based session customization
}
```

#### Token Contents
- `sub`: User ID
- `email`: User email address
- `role`: User role (FREE, PRO, ADMIN, TEAM)
- `subscriptionTier`: Current subscription level
- `iat`, `exp`: Token issued at and expiration times

### 5. Authentication Utilities

#### Session Management
**Location**: `lib/auth.ts`

```typescript
export async function getServerSession(req: NextRequest) {
  // Server-side session retrieval
  // Token validation and parsing
  // User data extraction
}

export function requireAuth(handler: Function) {
  // Higher-order function for route protection
  // Automatic session validation
  // Role-based access enforcement
}
```

#### Password Security
- **Hashing**: bcrypt with salt rounds (12)
- **Validation**: Email format and password strength checks
- **Security**: Rate limiting on authentication endpoints

### 6. Client-Side Authentication

#### React Context
```typescript
// Session provider wrapping
<SessionProvider session={session}>
  <App />
</SessionProvider>
```

#### Hooks
```typescript
const { data: session, status } = useSession()

// Authentication status checking
if (status === "authenticated") {
  // User is logged in
  console.log(session.user)
}
```

### 7. Protected API Routes

#### Header-Based Authentication
Protected API routes receive user information via middleware-injected headers:
- `x-user-id`: Authenticated user ID
- `x-user-email`: User email address
- `x-user-role`: User role
- `x-user-tier`: Subscription tier

#### Example Protected Route
```typescript
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Route logic with authenticated user context
}
```

### 8. Authentication Errors and Handling

#### Common Error Scenarios
- **Invalid Credentials**: Wrong email/password combination
- **Expired Token**: JWT token has expired
- **Missing Token**: No authentication token provided
- **Invalid Token**: Malformed or tampered JWT token
- **Insufficient Permissions**: User role doesn't have required access

#### Error Response Format
```typescript
{
  success: false,
  error: "Error message",
  code: "ERROR_CODE",
  message: "User-friendly message",
  helpText: "Additional guidance",
  actionUrl: "/auth/signin",
  actionText: "Sign In"
}
```

### 9. Security Best Practices

#### Implemented Security Measures
- **Secure Cookies**: HttpOnly, Secure, SameSite attributes
- **CSRF Protection**: Built-in NextAuth.js CSRF protection
- **Token Expiration**: Automatic token refresh and expiration
- **Password Hashing**: bcrypt with appropriate salt rounds
- **Rate Limiting**: Protection against brute force attacks

#### Environment Variables
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=your-database-connection-string
```

### 10. Development and Testing

#### Test User Creation
```bash
# Create test users for development
node tests/create-test-user.js
node tests/create-pro-user.js
```

#### Default Test Accounts
- **Admin**: admin@dealmecca.pro / password123
- **Pro User**: pro@dealmecca.pro / test123

### 11. Troubleshooting Common Issues

#### JWT Session Errors
- Check `NEXTAUTH_SECRET` environment variable
- Verify token format and structure
- Clear browser cookies and restart session

#### Middleware Issues
- Ensure proper route configuration
- Check middleware order and execution
- Verify header injection for protected routes

#### Database Connection
- Confirm database connectivity
- Check user table structure and relationships
- Verify Prisma client configuration

This authentication system provides a robust, secure foundation for the DealMecca platform with comprehensive role-based access control and session management.