# DealMecca Premium Brand Environment Variables

## Required Environment Variables

### Brand Configuration
```bash
# DealMecca Premium Brand Configuration
NEXT_PUBLIC_APP_NAME="DealMecca"
NEXT_PUBLIC_BRAND_NAME="DealMecca"
NEXT_PUBLIC_SITE_URL="https://getmecca.com"
NEXT_PUBLIC_TAGLINE="Intelligence that closes."
NEXT_PUBLIC_DESCRIPTION="DealMecca is the intelligence hub for media-sales teams."
NEXT_PUBLIC_DOMAIN="getmecca.com"
```

### Database Configuration
```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/dealmecca?schema=public"
```

### NextAuth Configuration
```bash
# NextAuth Configuration
NEXTAUTH_URL="https://getmecca.com"
NEXTAUTH_SECRET="your-nextauth-secret-key-change-this-in-production"
```

### OAuth Providers
```bash
# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# LinkedIn OAuth (future implementation)
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
```

### Email Configuration
```bash
# Email Configuration (for future email verification)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@getmecca.com"
```

### Application Configuration
```bash
# Application Configuration
APP_NAME="DealMecca"
APP_URL="https://getmecca.com"
SUPPORT_EMAIL="support@getmecca.com"
DEMO_EMAIL="demo@getmecca.com"
SALES_EMAIL="sales@getmecca.com"
```

### Feature Flags
```bash
# Feature Flags
ENABLE_GOOGLE_OAUTH=true
ENABLE_EMAIL_VERIFICATION=false
ENABLE_COMMUNITY_FEATURES=false
ENABLE_PREMIUM_FEATURES=true
ENABLE_INTELLIGENCE_HUB=true
```

### Rate Limiting
```bash
# Rate Limiting (for future implementation)
REDIS_URL="redis://localhost:6379"
```

## Development vs Production

### Development (.env.local)
```bash
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
```

### Production (.env.production)
```bash
NEXT_PUBLIC_SITE_URL="https://getmecca.com"
NEXTAUTH_URL="https://getmecca.com"
APP_URL="https://getmecca.com"
```

## Brand Consistency Notes

1. **Domain**: All references should use `getmecca.com` as the primary domain
2. **Emails**: All email addresses should use `@getmecca.com` domain
3. **Branding**: App name is consistently "DealMecca" (no spaces, proper capitalization)
4. **Tagline**: Primary tagline is "Intelligence that closes."
5. **Description**: Use the elevator pitch from brand configuration

## Security Notes

- Never commit actual values for sensitive variables
- Use different secrets for development and production
- Rotate secrets regularly
- Use environment-specific configurations 