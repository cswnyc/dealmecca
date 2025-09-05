# DealMecca Database Architecture

## Overview
DealMecca uses SQLite for development and PostgreSQL for production, managed through Prisma ORM. The database is designed for B2B media seller intelligence with comprehensive contact and company data management.

## Database Technology Stack

### Core Technologies
- **ORM**: Prisma 6.11.1
- **Development**: SQLite (`file:./dev.db`)
- **Production**: PostgreSQL (Neon Database)
- **Migration Management**: Prisma Migrate
- **Type Safety**: Generated Prisma Client

## Schema Overview

### Core Models

#### User Model
```prisma
model User {
  id                    String              @id @default(cuid())
  email                 String              @unique
  name                  String?
  password              String?
  role                  Role                @default(FREE)
  subscriptionTier      SubscriptionTier    @default(FREE)
  searchesUsed          Int                 @default(0)
  searchesResetAt       DateTime            @default(now())
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  // Subscription management
  stripeCustomerId      String?             @unique
  stripeSubscriptionId  String?             @unique
  subscriptionStatus    SubscriptionStatus  @default(ACTIVE)
  
  // Usage tracking
  searchesThisMonth     Int                 @default(0)
  lastDashboardVisit    DateTime?
  dashboardVisits       Int                 @default(0)
  
  // Relationships
  accounts              Account[]
  forumPosts           ForumPost[]
  forumComments        ForumComment[]
  eventAttendees       EventAttendee[]
  contactInteractions  ContactInteraction[]
}
```

#### Company Model
```prisma
model companies {
  id                   String    @id @default(cuid())
  name                 String
  website              String?
  description          String?
  industry             String?
  size                 String?
  location             String?
  city                 String?
  state                String?
  country              String?
  
  // Verification and quality
  verificationLevel    Int       @default(1)
  verificationScore    Int       @default(20)
  verified             Boolean   @default(false)
  companyType          String?
  
  // Metadata
  logoUrl              String?
  linkedinUrl          String?
  twitterUrl           String?
  facebookUrl          String?
  
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  
  // Relationships
  contacts             Contact[]
  users                User[]
  events               Event[]
}
```

#### Contact Model
```prisma
model Contact {
  id                  String     @id @default(cuid())
  firstName           String
  lastName            String
  email               String?
  phone               String?
  title               String?
  department          String?
  seniority           String?
  
  // Social and professional links
  linkedinUrl         String?
  twitterUrl          String?
  personalWebsite     String?
  
  // Data quality and scoring
  leadScore           Int        @default(0)
  verificationLevel   Int        @default(1)
  dataQualityScore    Int        @default(20)
  
  // Relationships
  companyId           String?
  company             companies? @relation(fields: [companyId], references: [id])
  
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt
  
  // Activity tracking
  interactions        ContactInteraction[]
  notes               ContactNote[]
  viewedBy            ViewedContact[]
}
```

### Forum System Models

#### ForumPost Model
```prisma
model ForumPost {
  id                  String         @id @default(cuid())
  title               String
  content             String
  slug                String         @unique
  
  // Author and attribution
  authorId            String
  author              User           @relation(fields: [authorId], references: [id])
  isAnonymous         Boolean        @default(false)
  anonymousHandle     String?
  
  // Categorization
  categoryId          String
  category            ForumCategory  @relation(fields: [categoryId], references: [id])
  tags                String         @default("[]")
  
  // Post metadata
  urgency             PostUrgency    @default(MEDIUM)
  postType            String         @default("post")
  dealSize            String?
  location            String?
  mediaType           String         @default("[]")
  
  // Engagement metrics
  views               Int            @default(0)
  upvotes             Int            @default(0)
  downvotes           Int            @default(0)
  bookmarks           Int            @default(0)
  
  // Status flags
  isPinned            Boolean        @default(false)
  isLocked            Boolean        @default(false)
  isFeatured          Boolean        @default(false)
  
  // AI processing
  aiProcessed         Boolean        @default(false)
  aiProcessedAt       DateTime?
  aiSummary           String?
  aiTags              String?
  extractedCompanies  String?
  
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
  lastActivityAt      DateTime       @default(now())
  
  // Relationships
  comments            ForumComment[]
  votes               ForumVote[]
  bookmarkedBy        ForumBookmark[]
  companyMentions     CompanyMention[]
  contactMentions     ContactMention[]
}
```

#### ForumCategory Model
```prisma
model ForumCategory {
  id          String      @id @default(cuid())
  name        String      @unique
  slug        String      @unique
  description String?
  color       String?
  icon        String?
  order       Int         @default(0)
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relationships
  posts       ForumPost[]
}
```

### Event Management Models

#### Event Model
```prisma
model Event {
  id             String          @id @default(cuid())
  title          String
  description    String?
  location       String?
  startDate      DateTime
  endDate        DateTime
  maxAttendees   Int?
  eventType      String
  
  // Event management
  creatorId      String
  creator        User            @relation("EventCreator", fields: [creatorId], references: [id])
  attendeeCount  Int             @default(0)
  
  // Company association
  companyId      String?
  company        companies?      @relation(fields: [companyId], references: [id])
  
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  // Relationships
  attendees      EventAttendee[]
  ratings        EventRating[]
  discussions    ForumPost[]
}
```

### Activity Tracking Models

#### ContactInteraction Model
```prisma
model ContactInteraction {
  id            String              @id @default(cuid())
  contactId     String
  contact       Contact             @relation(fields: [contactId], references: [id])
  userId        String
  user          User                @relation(fields: [userId], references: [id])
  
  interactionType ContactInteractionType
  notes         String?
  outcome       String?
  followUpDate  DateTime?
  
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
}

enum ContactInteractionType {
  EMAIL
  CALL
  MEETING
  LINKEDIN_MESSAGE
  OTHER
}
```

## Data Quality and Verification System

### Verification Levels
1. **Basic** (0-20 points): Minimal data verification
2. **Verified** (21-40 points): Email and basic info verified
3. **Premium Verified** (41-60 points): Enhanced data validation
4. **Expert Verified** (61-80 points): Manually reviewed and validated
5. **Platform Verified** (81-100 points): Highest quality, platform endorsed

### Scoring Algorithm
```typescript
// Example scoring logic
function calculateVerificationScore(contact: Contact): number {
  let score = 0;
  
  // Email verification
  if (contact.email && isValidEmail(contact.email)) score += 25;
  
  // LinkedIn profile
  if (contact.linkedinUrl) score += 20;
  
  // Company association
  if (contact.companyId) score += 15;
  
  // Professional title
  if (contact.title) score += 10;
  
  // Phone number
  if (contact.phone) score += 15;
  
  // Recent activity
  if (hasRecentActivity(contact)) score += 15;
  
  return Math.min(score, 100);
}
```

## Database Operations

### Prisma Client Usage

#### Basic Queries
```typescript
// Find users with pagination
const users = await prisma.user.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  include: {
    company: true,
    forumPosts: {
      take: 5,
      orderBy: { createdAt: 'desc' }
    }
  }
});

// Complex search with filters
const contacts = await prisma.contact.findMany({
  where: {
    AND: [
      { company: { industry: { in: industries } } },
      { seniority: { in: seniorityLevels } },
      { verificationLevel: { gte: minVerificationLevel } }
    ]
  },
  include: {
    company: {
      select: {
        name: true,
        industry: true,
        verified: true
      }
    }
  }
});
```

#### Aggregations and Analytics
```typescript
// User engagement metrics
const userStats = await prisma.user.aggregate({
  _count: { id: true },
  _avg: { searchesUsed: true },
  _sum: { dashboardVisits: true },
  where: {
    createdAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    }
  }
});

// Forum activity by category
const forumStats = await prisma.forumCategory.findMany({
  include: {
    _count: {
      select: { posts: true }
    },
    posts: {
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    }
  }
});
```

### Database Migrations

#### Migration Commands
```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Deploy to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

#### Schema Evolution
```prisma
// Example migration: Adding new field
model User {
  // ... existing fields
  lastLoginAt    DateTime?  // New field
  loginCount     Int        @default(0)  // New field with default
}
```

## Performance Optimization

### Indexing Strategy
```prisma
// Composite indexes for common queries
@@index([companyId, verificationLevel])  // Contact searches
@@index([createdAt, authorId])           // Forum post queries
@@index([email, role])                   // User lookups
@@index([categoryId, isPinned, createdAt]) // Forum browsing
```

### Query Optimization Patterns

#### 1. Selective Loading
```typescript
// Only load required fields
const contacts = await prisma.contact.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    company: {
      select: {
        name: true,
        industry: true
      }
    }
  }
});
```

#### 2. Batch Operations
```typescript
// Bulk insert for CSV imports
const contacts = await prisma.contact.createMany({
  data: contactsArray,
  skipDuplicates: true
});

// Bulk update operations
await prisma.contact.updateMany({
  where: { companyId: companyId },
  data: { verificationLevel: 2 }
});
```

#### 3. Connection Pooling
```typescript
// Prisma connection configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});
```

## Backup and Recovery

### Automated Backups
```bash
# Database backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

### Data Migration Scripts
**Location**: `scripts/` directory

- `bulk-import-companies.ts` - Import company data from CSV
- `backup-restore.ts` - Database backup and restore utilities
- `data-quality-improvement.ts` - Data cleaning and enhancement

## Environment Configuration

### Development Environment
```env
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"
```

### Production Environment
```env
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"
```

## Monitoring and Analytics

### Database Health Checks
```typescript
// Health check endpoint
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'healthy' });
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 500 });
  }
}
```

### Performance Metrics
- **Query Performance**: Monitor slow queries and optimization opportunities
- **Connection Usage**: Track database connection pool utilization
- **Data Growth**: Monitor table sizes and storage requirements
- **Index Usage**: Analyze index effectiveness and query patterns

This database architecture provides a solid foundation for DealMecca's B2B intelligence platform with robust data quality, comprehensive tracking, and scalable performance.