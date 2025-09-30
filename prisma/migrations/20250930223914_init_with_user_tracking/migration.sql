-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FREE', 'PRO', 'TEAM_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('NEWS', 'LEADERSHIP_CHANGE', 'FUNDING', 'ACQUISITION', 'PRODUCT_LAUNCH', 'MARKET_EXPANSION', 'FINANCIAL_RESULTS', 'HIRING_SURGE', 'MEDIA_SPEND_CHANGE', 'COMPETITIVE_INTEL', 'PARTNERSHIP', 'OFFICE_MOVE', 'REGULATORY_CHANGE', 'INDUSTRY_TREND', 'AI_SUMMARY');

-- CreateEnum
CREATE TYPE "ConnectionType" AS ENUM ('COLLEAGUE', 'FORMER_COLLEAGUE', 'CLIENT', 'VENDOR', 'EVENT_CONNECTION', 'REFERRAL', 'SOCIAL_MEDIA', 'MUTUAL_CONNECTION', 'INDUSTRY_CONTACT', 'PROSPECT');

-- CreateEnum
CREATE TYPE "ConnectionStrength" AS ENUM ('STRONG', 'MEDIUM', 'WEAK');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'TEAM');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY', 'MEDIA_HOLDING_COMPANY', 'NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER', 'ADTECH_VENDOR', 'MARTECH_VENDOR', 'MEDIA_OWNER', 'BROADCASTER', 'PUBLISHER', 'CONSULTANCY', 'PRODUCTION_COMPANY', 'ADVERTISER', 'AGENCY', 'MEDIA_COMPANY', 'TECH_VENDOR', 'INDUSTRY', 'DSP_SSP', 'ADTECH');

-- CreateEnum
CREATE TYPE "AgencyType" AS ENUM ('FULL_SERVICE', 'MEDIA_SPECIALIST', 'CREATIVE_SPECIALIST', 'DIGITAL_SPECIALIST', 'PROGRAMMATIC_SPECIALIST', 'SOCIAL_MEDIA_SPECIALIST', 'SEARCH_SPECIALIST', 'INFLUENCER_SPECIALIST', 'PERFORMANCE_MARKETING', 'BRAND_STRATEGY', 'MEDIA_PLANNING', 'MEDIA_BUYING', 'DATA_ANALYTICS', 'CONTENT_MARKETING');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('AUTOMOTIVE', 'CPG_FOOD_BEVERAGE', 'CPG_PERSONAL_CARE', 'CPG_HOUSEHOLD', 'FINANCIAL_SERVICES', 'HEALTHCARE_PHARMA', 'RETAIL_ECOMMERCE', 'TECHNOLOGY', 'ENTERTAINMENT_MEDIA', 'TRAVEL_HOSPITALITY', 'TELECOM', 'FASHION_BEAUTY', 'SPORTS_FITNESS', 'EDUCATION', 'REAL_ESTATE', 'ENERGY', 'GOVERNMENT_NONPROFIT', 'GAMING', 'CRYPTOCURRENCY', 'INSURANCE', 'B2B_SERVICES', 'STARTUPS', 'NONPROFIT', 'PROFESSIONAL_SERVICES', 'LOGISTICS');

-- CreateEnum
CREATE TYPE "PostCategory" AS ENUM ('ACCOUNT_MOVES', 'RFPS', 'INDUSTRY_NEWS', 'QA', 'NETWORKING', 'DEALS', 'EVENTS');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('CONFERENCE', 'TRADE_SHOW', 'SUMMIT', 'WORKSHOP', 'NETWORKING', 'AWARDS', 'WEBINAR', 'MASTERCLASS');

-- CreateEnum
CREATE TYPE "EventIndustry" AS ENUM ('DIGITAL_ADVERTISING', 'TV_BROADCASTING', 'RADIO', 'PRINT_MEDIA', 'OUT_OF_HOME', 'STREAMING', 'PODCASTING', 'ADTECH', 'MARTECH', 'PROGRAMMATIC', 'SOCIAL_MEDIA', 'INFLUENCER', 'EMAIL_MARKETING', 'MOBILE_ADVERTISING', 'VIDEO_ADVERTISING', 'DATA_ANALYTICS');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('INTERESTED', 'PLANNING_TO_ATTEND', 'REGISTERED', 'ATTENDING', 'ATTENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventBestFor" AS ENUM ('NEW_BUSINESS', 'LEARNING', 'NETWORKING', 'PRODUCT_DEMOS', 'PARTNERSHIPS', 'RECRUITING', 'BRAND_AWARENESS', 'THOUGHT_LEADERSHIP');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('SEARCH', 'EVENT_ATTENDED', 'EVENT_REGISTERED', 'FORUM_POST', 'CONNECTION_MADE', 'GOAL_ACHIEVED', 'MILESTONE_REACHED', 'UPGRADE_PROMPT_SHOWN', 'UPGRADE_COMPLETED', 'ACHIEVEMENT_UNLOCKED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'PAST_DUE', 'UNPAID', 'TRIALING');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SUCCEEDED', 'PENDING', 'FAILED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DealSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('DIGITAL_DISPLAY', 'SEARCH_SEM', 'SOCIAL_MEDIA', 'VIDEO_STREAMING', 'CONNECTED_TV', 'TRADITIONAL_TV', 'RADIO', 'PODCAST', 'PRINT_NEWSPAPER', 'PRINT_MAGAZINE', 'OUT_OF_HOME', 'BILLBOARD', 'TRANSIT', 'CINEMA', 'DIRECT_MAIL', 'EMAIL_MARKETING', 'INFLUENCER', 'PROGRAMMATIC', 'NATIVE_ADVERTISING', 'AFFILIATE', 'MOBILE_APP', 'AUDIO_STREAMING', 'GAMING_ADVERTISING', 'VIRTUAL_REALITY');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('NORTHEAST', 'SOUTHEAST', 'MIDWEST', 'SOUTHWEST', 'WEST', 'NORTHWEST', 'NATIONAL', 'INTERNATIONAL', 'CANADA', 'GLOBAL');

-- CreateEnum
CREATE TYPE "EmployeeRange" AS ENUM ('STARTUP_1_10', 'SMALL_11_50', 'MEDIUM_51_200', 'LARGE_201_1000', 'ENTERPRISE_1001_5000', 'MEGA_5000_PLUS');

-- CreateEnum
CREATE TYPE "RevenueRange" AS ENUM ('UNDER_1M', 'RANGE_1M_5M', 'RANGE_5M_25M', 'RANGE_25M_100M', 'RANGE_100M_500M', 'RANGE_500M_1B', 'OVER_1B', 'UNDISCLOSED');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('MEDIA_PLANNING', 'MEDIA_BUYING', 'DIGITAL_MARKETING', 'PROGRAMMATIC', 'SOCIAL_MEDIA', 'SEARCH_MARKETING', 'STRATEGY_PLANNING', 'ANALYTICS_INSIGHTS', 'CREATIVE_SERVICES', 'ACCOUNT_MANAGEMENT', 'BUSINESS_DEVELOPMENT', 'OPERATIONS', 'TECHNOLOGY', 'FINANCE', 'LEADERSHIP', 'HUMAN_RESOURCES', 'SALES', 'MARKETING', 'PRODUCT', 'DATA_SCIENCE');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('INTERN', 'COORDINATOR', 'SPECIALIST', 'SENIOR_SPECIALIST', 'MANAGER', 'SENIOR_MANAGER', 'DIRECTOR', 'SENIOR_DIRECTOR', 'VP', 'SVP', 'EVP', 'C_LEVEL', 'FOUNDER_OWNER');

-- CreateEnum
CREATE TYPE "ContactRole" AS ENUM ('MEDIA_BUYER', 'MEDIA_PLANNER', 'STRATEGIST', 'ANALYST', 'CREATIVE', 'ACCOUNT_MANAGER', 'PROJECT_MANAGER', 'BUSINESS_DEVELOPER', 'DECISION_MAKER', 'INFLUENCER', 'GATEKEEPER', 'IMPLEMENTER', 'ADVISOR', 'BUDGET_HOLDER', 'PROCUREMENT');

-- CreateEnum
CREATE TYPE "DataQuality" AS ENUM ('BASIC', 'VERIFIED', 'PREMIUM', 'EXPERT_VERIFIED');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('EMAIL', 'PHONE', 'LINKEDIN', 'DIRECT_MESSAGE', 'NO_CONTACT');

-- CreateEnum
CREATE TYPE "BudgetRange" AS ENUM ('UNDER_10K', 'RANGE_10K_25K', 'RANGE_25K_50K', 'RANGE_50K_100K', 'RANGE_100K_250K', 'RANGE_250K_500K', 'RANGE_500K_1M', 'RANGE_1M_5M', 'RANGE_5M_25M', 'OVER_25M', 'CONFIDENTIAL');

-- CreateEnum
CREATE TYPE "NetworkingActivityType" AS ENUM ('FORUM_POST_CREATED', 'FORUM_COMMENT_POSTED', 'COMPANY_MENTIONED', 'CONTACT_MENTIONED', 'POST_BOOKMARKED', 'USER_FOLLOWED', 'PROFILE_VIEWED', 'COMPANY_PROFILE_VIEWED', 'CONTACT_PROFILE_VIEWED', 'NETWORKING_EVENT_JOINED', 'DISCUSSION_PARTICIPATED', 'EXPERTISE_SHARED', 'QUESTION_ANSWERED', 'OPPORTUNITY_SHARED', 'INTRODUCTION_MADE', 'CONNECTION_REQUESTED', 'MESSAGE_SENT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('COMPANY_MENTIONED', 'CONTACT_MENTIONED', 'FORUM_POST_REPLY', 'EVENT_REMINDER', 'CONNECTION_REQUEST', 'ACHIEVEMENT_UNLOCKED', 'SYSTEM_ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('EMAIL', 'PHONE_CALL', 'LINKEDIN_MESSAGE', 'LINKEDIN_CONNECTION', 'MEETING', 'CONFERENCE_CALL', 'TEXT_MESSAGE', 'IN_PERSON', 'SOCIAL_MEDIA', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST', 'NOT_INTERESTED', 'NURTURING', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "IntroductionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DRAFT');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('PENDING', 'INVITED', 'REGISTERED', 'DECLINED');

-- CreateEnum
CREATE TYPE "PartnershipType" AS ENUM ('AGENCY_CLIENT', 'MEDIA_PARTNERSHIP', 'STRATEGIC_ALLIANCE', 'PREFERRED_VENDOR', 'HOLDING_COMPANY_SUBSIDIARY', 'SISTER_AGENCY', 'JOINT_VENTURE', 'SUBCONTRACTOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "firebaseUid" TEXT,
    "name" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'FREE',
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "anonymousUsername" TEXT,
    "avatarSeed" TEXT,
    "anonymousHandle" TEXT,
    "searchesUsed" INTEGER NOT NULL DEFAULT 0,
    "searchesResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastDashboardVisit" TIMESTAMP(3),
    "dashboardVisits" INTEGER NOT NULL DEFAULT 0,
    "searchesThisMonth" INTEGER NOT NULL DEFAULT 0,
    "searchResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "annualEventGoal" INTEGER DEFAULT 6,
    "annualNetworkingGoal" INTEGER DEFAULT 100,
    "annualRevenueGoal" DOUBLE PRECISION,
    "achievements" TEXT,
    "achievementPoints" INTEGER NOT NULL DEFAULT 0,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "lastSearchLimitCheck" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT,
    "logoUrl" TEXT,
    "description" TEXT,
    "companyType" "CompanyType" NOT NULL,
    "agencyType" "AgencyType",
    "industry" "Industry",
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "region" "Region",
    "country" TEXT NOT NULL DEFAULT 'US',
    "zipCode" TEXT,
    "employeeCount" "EmployeeRange",
    "revenueRange" "RevenueRange",
    "teamCount" INTEGER,
    "foundedYear" INTEGER,
    "stockSymbol" TEXT,
    "linkedinUrl" TEXT,
    "twitterHandle" TEXT,
    "headquarters" TEXT,
    "revenue" TEXT,
    "parentCompanyId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "dataQuality" "DataQuality" NOT NULL DEFAULT 'BASIC',
    "lastVerified" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "aiSummary" TEXT,
    "lastInsightUpdate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "normalizedName" TEXT,
    "normalizedWebsite" TEXT,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPartnership" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "relationshipType" "PartnershipType" NOT NULL DEFAULT 'AGENCY_CLIENT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "contractValue" DOUBLE PRECISION,
    "primaryContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyPartnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "linkedinUrl" TEXT,
    "logoUrl" TEXT,
    "personalEmail" TEXT,
    "department" "Department",
    "seniority" "SeniorityLevel" NOT NULL,
    "primaryRole" "ContactRole",
    "companyId" TEXT NOT NULL,
    "territories" TEXT,
    "accounts" TEXT,
    "budgetRange" "BudgetRange",
    "name" TEXT,
    "isDecisionMaker" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "dataQuality" "DataQuality" NOT NULL DEFAULT 'BASIC',
    "lastVerified" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "preferredContact" "ContactMethod",
    "communityScore" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "PostCategory" NOT NULL,
    "anonymousName" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "extractedCompanies" TEXT NOT NULL DEFAULT '',
    "aiTags" TEXT NOT NULL DEFAULT '',
    "aiSummary" TEXT,
    "aiProcessed" BOOLEAN NOT NULL DEFAULT false,
    "aiProcessedAt" TIMESTAMP(3),
    "aiVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "anonymousName" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Search" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL,
    "searchType" TEXT,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Search_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "query" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "alertEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRun" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInteraction" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "notes" TEXT,
    "outcome" TEXT,
    "followUpAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactNote" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewedContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,

    CONSTRAINT "ViewedContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactStatus" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "leadScore" INTEGER,
    "lastActivity" TIMESTAMP(3),
    "nextAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyInsight" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "InsightType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "relevanceScore" INTEGER NOT NULL DEFAULT 50,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "CompanyInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "relationship" "ConnectionType" NOT NULL,
    "strength" "ConnectionStrength" NOT NULL,
    "source" TEXT NOT NULL,
    "notes" TEXT,
    "lastContact" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchSuggestion" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "venue" TEXT,
    "category" "EventCategory" NOT NULL,
    "industry" TEXT NOT NULL,
    "estimatedCost" INTEGER,
    "attendeeCount" INTEGER,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "isHybrid" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "logoUrl" TEXT,
    "organizerName" TEXT,
    "organizerUrl" TEXT,
    "registrationUrl" TEXT,
    "callForSpeakers" BOOLEAN NOT NULL DEFAULT false,
    "sponsorshipAvailable" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "capacity" INTEGER,
    "registrationDeadline" TIMESTAMP(3),
    "eventType" TEXT,
    "avgOverallRating" DOUBLE PRECISION DEFAULT 0,
    "avgNetworkingRating" DOUBLE PRECISION DEFAULT 0,
    "avgContentRating" DOUBLE PRECISION DEFAULT 0,
    "avgROIRating" DOUBLE PRECISION DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAttendee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'INTERESTED',
    "isGoing" BOOLEAN NOT NULL DEFAULT false,
    "hasAttended" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT,
    "contactId" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectionsIntended" INTEGER NOT NULL DEFAULT 0,
    "connectionsMade" INTEGER NOT NULL DEFAULT 0,
    "leadsGenerated" INTEGER NOT NULL DEFAULT 0,
    "dealsFromEvent" INTEGER NOT NULL DEFAULT 0,
    "revenueFromEvent" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "networkingRating" INTEGER NOT NULL,
    "contentRating" INTEGER NOT NULL,
    "roiRating" INTEGER NOT NULL,
    "review" TEXT,
    "wouldRecommend" BOOLEAN NOT NULL,
    "wouldAttendAgain" BOOLEAN NOT NULL,
    "bestFor" TEXT NOT NULL,
    "worstAspect" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "PaymentStatus" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "anonymousHandle" TEXT,
    "categoryId" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "eventId" TEXT,
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'MEDIUM',
    "dealSize" "DealSize",
    "location" TEXT,
    "mediaType" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" "PostStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aiProcessed" BOOLEAN NOT NULL DEFAULT false,
    "aiProcessedAt" TIMESTAMP(3),
    "aiSummary" TEXT,
    "aiTags" JSONB,
    "aiVersion" TEXT,
    "extractedCompanies" TEXT NOT NULL DEFAULT '',
    "postType" TEXT NOT NULL DEFAULT 'post',
    "listItems" TEXT NOT NULL DEFAULT '',
    "pollChoices" TEXT NOT NULL DEFAULT '',
    "pollDuration" INTEGER,
    "pollEndsAt" TIMESTAMP(3),
    "codeLanguage" TEXT,
    "codeFramework" TEXT,
    "codeType" TEXT,
    "codeComplexity" TEXT,
    "generatedCode" TEXT,

    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "anonymousHandle" TEXT,
    "anonymousAvatarId" TEXT,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumCommentVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumCommentVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumBookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "context" TEXT,
    "color" TEXT DEFAULT '#3B82F6',
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicMention" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicCompany" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" TEXT,
    "context" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicContact" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "role" TEXT,
    "context" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMention" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "mentionedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMention" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "mentionedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNetworkingActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "interactionType" "NetworkingActivityType" NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserNetworkingActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostContactMention" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "context" TEXT,
    "confidence" DOUBLE PRECISION,
    "aiDetected" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostContactMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventCategory" TEXT NOT NULL,
    "eventAction" TEXT NOT NULL,
    "eventLabel" TEXT,
    "eventValue" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "introduction_requests" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "targetContactId" TEXT NOT NULL,
    "targetCompanyId" TEXT NOT NULL,
    "message" TEXT,
    "context" TEXT,
    "status" "IntroductionStatus" NOT NULL DEFAULT 'PENDING',
    "facilitatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "introduction_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostBookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFollow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeGeneration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "framework" TEXT,
    "codeType" TEXT NOT NULL,
    "complexity" TEXT NOT NULL,
    "generatedCode" TEXT NOT NULL,
    "explanation" TEXT,
    "dependencies" TEXT NOT NULL DEFAULT '',
    "suggestions" TEXT NOT NULL DEFAULT '',
    "executionTime" INTEGER,
    "tokensUsed" INTEGER,
    "qualityScore" DOUBLE PRECISION,
    "wasUseful" BOOLEAN,
    "forumPostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'invite-only',
    "status" "WaitlistStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitlistEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "User_anonymousUsername_key" ON "User"("anonymousUsername");

-- CreateIndex
CREATE UNIQUE INDEX "User_anonymousHandle_key" ON "User"("anonymousHandle");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "unique_company_name" ON "companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "unique_company_website" ON "companies"("website");

-- CreateIndex
CREATE INDEX "companies_name_idx" ON "companies"("name");

-- CreateIndex
CREATE INDEX "companies_companyType_idx" ON "companies"("companyType");

-- CreateIndex
CREATE INDEX "companies_industry_idx" ON "companies"("industry");

-- CreateIndex
CREATE INDEX "companies_city_state_idx" ON "companies"("city", "state");

-- CreateIndex
CREATE INDEX "companies_verified_idx" ON "companies"("verified");

-- CreateIndex
CREATE INDEX "companies_lastInsightUpdate_idx" ON "companies"("lastInsightUpdate");

-- CreateIndex
CREATE INDEX "companies_normalizedName_idx" ON "companies"("normalizedName");

-- CreateIndex
CREATE INDEX "companies_normalizedWebsite_idx" ON "companies"("normalizedWebsite");

-- CreateIndex
CREATE INDEX "CompanyPartnership_agencyId_idx" ON "CompanyPartnership"("agencyId");

-- CreateIndex
CREATE INDEX "CompanyPartnership_advertiserId_idx" ON "CompanyPartnership"("advertiserId");

-- CreateIndex
CREATE INDEX "CompanyPartnership_isActive_idx" ON "CompanyPartnership"("isActive");

-- CreateIndex
CREATE INDEX "CompanyPartnership_relationshipType_idx" ON "CompanyPartnership"("relationshipType");

-- CreateIndex
CREATE INDEX "CompanyPartnership_startDate_idx" ON "CompanyPartnership"("startDate");

-- CreateIndex
CREATE INDEX "CompanyPartnership_endDate_idx" ON "CompanyPartnership"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPartnership_agencyId_advertiserId_key" ON "CompanyPartnership"("agencyId", "advertiserId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_contact_email" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "contacts_companyId_idx" ON "contacts"("companyId");

-- CreateIndex
CREATE INDEX "contacts_firstName_lastName_idx" ON "contacts"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "contacts_title_idx" ON "contacts"("title");

-- CreateIndex
CREATE INDEX "contacts_department_idx" ON "contacts"("department");

-- CreateIndex
CREATE INDEX "contacts_seniority_idx" ON "contacts"("seniority");

-- CreateIndex
CREATE INDEX "contacts_verified_idx" ON "contacts"("verified");

-- CreateIndex
CREATE INDEX "contacts_email_idx" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "contacts_firstName_lastName_companyId_idx" ON "contacts"("firstName", "lastName", "companyId");

-- CreateIndex
CREATE INDEX "contacts_communityScore_idx" ON "contacts"("communityScore");

-- CreateIndex
CREATE UNIQUE INDEX "unique_contact_per_company" ON "contacts"("firstName", "lastName", "companyId");

-- CreateIndex
CREATE INDEX "Post_category_idx" ON "Post"("category");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_votes_idx" ON "Post"("votes");

-- CreateIndex
CREATE INDEX "Post_aiProcessedAt_idx" ON "Post"("aiProcessedAt");

-- CreateIndex
CREATE INDEX "Post_aiProcessed_idx" ON "Post"("aiProcessed");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE INDEX "Search_userId_idx" ON "Search"("userId");

-- CreateIndex
CREATE INDEX "Search_companyId_idx" ON "Search"("companyId");

-- CreateIndex
CREATE INDEX "Search_createdAt_idx" ON "Search"("createdAt");

-- CreateIndex
CREATE INDEX "SavedSearch_userId_idx" ON "SavedSearch"("userId");

-- CreateIndex
CREATE INDEX "SavedSearch_lastRun_idx" ON "SavedSearch"("lastRun");

-- CreateIndex
CREATE INDEX "SavedSearch_isActive_idx" ON "SavedSearch"("isActive");

-- CreateIndex
CREATE INDEX "ContactInteraction_contactId_idx" ON "ContactInteraction"("contactId");

-- CreateIndex
CREATE INDEX "ContactInteraction_userId_idx" ON "ContactInteraction"("userId");

-- CreateIndex
CREATE INDEX "ContactInteraction_followUpAt_idx" ON "ContactInteraction"("followUpAt");

-- CreateIndex
CREATE INDEX "ContactInteraction_type_idx" ON "ContactInteraction"("type");

-- CreateIndex
CREATE INDEX "ContactNote_contactId_idx" ON "ContactNote"("contactId");

-- CreateIndex
CREATE INDEX "ContactNote_userId_idx" ON "ContactNote"("userId");

-- CreateIndex
CREATE INDEX "ViewedContact_userId_idx" ON "ViewedContact"("userId");

-- CreateIndex
CREATE INDEX "ViewedContact_viewedAt_idx" ON "ViewedContact"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ViewedContact_userId_contactId_key" ON "ViewedContact"("userId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactStatus_contactId_key" ON "ContactStatus"("contactId");

-- CreateIndex
CREATE INDEX "ContactStatus_userId_idx" ON "ContactStatus"("userId");

-- CreateIndex
CREATE INDEX "ContactStatus_status_idx" ON "ContactStatus"("status");

-- CreateIndex
CREATE INDEX "ContactStatus_priority_idx" ON "ContactStatus"("priority");

-- CreateIndex
CREATE INDEX "ContactStatus_leadScore_idx" ON "ContactStatus"("leadScore");

-- CreateIndex
CREATE INDEX "CompanyInsight_companyId_type_idx" ON "CompanyInsight"("companyId", "type");

-- CreateIndex
CREATE INDEX "CompanyInsight_createdAt_idx" ON "CompanyInsight"("createdAt");

-- CreateIndex
CREATE INDEX "CompanyInsight_relevanceScore_idx" ON "CompanyInsight"("relevanceScore");

-- CreateIndex
CREATE INDEX "UserConnection_userId_idx" ON "UserConnection"("userId");

-- CreateIndex
CREATE INDEX "UserConnection_contactId_idx" ON "UserConnection"("contactId");

-- CreateIndex
CREATE INDEX "UserConnection_strength_idx" ON "UserConnection"("strength");

-- CreateIndex
CREATE UNIQUE INDEX "UserConnection_userId_contactId_key" ON "UserConnection"("userId", "contactId");

-- CreateIndex
CREATE INDEX "SearchSuggestion_type_idx" ON "SearchSuggestion"("type");

-- CreateIndex
CREATE INDEX "SearchSuggestion_popularity_idx" ON "SearchSuggestion"("popularity");

-- CreateIndex
CREATE INDEX "SearchSuggestion_category_idx" ON "SearchSuggestion"("category");

-- CreateIndex
CREATE INDEX "DashboardActivity_userId_createdAt_idx" ON "DashboardActivity"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE INDEX "Event_location_idx" ON "Event"("location");

-- CreateIndex
CREATE INDEX "Event_avgOverallRating_idx" ON "Event"("avgOverallRating");

-- CreateIndex
CREATE INDEX "Event_createdBy_idx" ON "Event"("createdBy");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_capacity_idx" ON "Event"("capacity");

-- CreateIndex
CREATE INDEX "Event_registrationDeadline_idx" ON "Event"("registrationDeadline");

-- CreateIndex
CREATE INDEX "EventAttendee_userId_idx" ON "EventAttendee"("userId");

-- CreateIndex
CREATE INDEX "EventAttendee_eventId_idx" ON "EventAttendee"("eventId");

-- CreateIndex
CREATE INDEX "EventAttendee_companyId_idx" ON "EventAttendee"("companyId");

-- CreateIndex
CREATE INDEX "EventAttendee_contactId_idx" ON "EventAttendee"("contactId");

-- CreateIndex
CREATE INDEX "EventAttendee_registeredAt_idx" ON "EventAttendee"("registeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventAttendee_userId_eventId_key" ON "EventAttendee"("userId", "eventId");

-- CreateIndex
CREATE INDEX "EventRating_eventId_idx" ON "EventRating"("eventId");

-- CreateIndex
CREATE INDEX "EventRating_overallRating_idx" ON "EventRating"("overallRating");

-- CreateIndex
CREATE UNIQUE INDEX "EventRating_userId_eventId_key" ON "EventRating"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumCategory_slug_key" ON "ForumCategory"("slug");

-- CreateIndex
CREATE INDEX "ForumCategory_slug_idx" ON "ForumCategory"("slug");

-- CreateIndex
CREATE INDEX "ForumCategory_order_idx" ON "ForumCategory"("order");

-- CreateIndex
CREATE UNIQUE INDEX "ForumPost_slug_key" ON "ForumPost"("slug");

-- CreateIndex
CREATE INDEX "ForumPost_categoryId_idx" ON "ForumPost"("categoryId");

-- CreateIndex
CREATE INDEX "ForumPost_authorId_idx" ON "ForumPost"("authorId");

-- CreateIndex
CREATE INDEX "ForumPost_eventId_idx" ON "ForumPost"("eventId");

-- CreateIndex
CREATE INDEX "ForumPost_createdAt_idx" ON "ForumPost"("createdAt");

-- CreateIndex
CREATE INDEX "ForumPost_lastActivityAt_idx" ON "ForumPost"("lastActivityAt");

-- CreateIndex
CREATE INDEX "ForumPost_urgency_idx" ON "ForumPost"("urgency");

-- CreateIndex
CREATE INDEX "ForumPost_location_idx" ON "ForumPost"("location");

-- CreateIndex
CREATE INDEX "ForumComment_postId_idx" ON "ForumComment"("postId");

-- CreateIndex
CREATE INDEX "ForumComment_authorId_idx" ON "ForumComment"("authorId");

-- CreateIndex
CREATE INDEX "ForumComment_parentId_idx" ON "ForumComment"("parentId");

-- CreateIndex
CREATE INDEX "ForumComment_createdAt_idx" ON "ForumComment"("createdAt");

-- CreateIndex
CREATE INDEX "ForumVote_postId_idx" ON "ForumVote"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumVote_userId_postId_key" ON "ForumVote"("userId", "postId");

-- CreateIndex
CREATE INDEX "ForumCommentVote_commentId_idx" ON "ForumCommentVote"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumCommentVote_userId_commentId_key" ON "ForumCommentVote"("userId", "commentId");

-- CreateIndex
CREATE INDEX "ForumBookmark_userId_idx" ON "ForumBookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumBookmark_userId_postId_key" ON "ForumBookmark"("userId", "postId");

-- CreateIndex
CREATE INDEX "Topic_categoryId_idx" ON "Topic"("categoryId");

-- CreateIndex
CREATE INDEX "Topic_name_idx" ON "Topic"("name");

-- CreateIndex
CREATE INDEX "Topic_isActive_idx" ON "Topic"("isActive");

-- CreateIndex
CREATE INDEX "TopicMention_postId_idx" ON "TopicMention"("postId");

-- CreateIndex
CREATE INDEX "TopicMention_topicId_idx" ON "TopicMention"("topicId");

-- CreateIndex
CREATE INDEX "TopicMention_order_idx" ON "TopicMention"("order");

-- CreateIndex
CREATE UNIQUE INDEX "TopicMention_postId_topicId_key" ON "TopicMention"("postId", "topicId");

-- CreateIndex
CREATE INDEX "TopicCompany_topicId_idx" ON "TopicCompany"("topicId");

-- CreateIndex
CREATE INDEX "TopicCompany_companyId_idx" ON "TopicCompany"("companyId");

-- CreateIndex
CREATE INDEX "TopicCompany_order_idx" ON "TopicCompany"("order");

-- CreateIndex
CREATE UNIQUE INDEX "TopicCompany_topicId_companyId_key" ON "TopicCompany"("topicId", "companyId");

-- CreateIndex
CREATE INDEX "TopicContact_topicId_idx" ON "TopicContact"("topicId");

-- CreateIndex
CREATE INDEX "TopicContact_contactId_idx" ON "TopicContact"("contactId");

-- CreateIndex
CREATE INDEX "TopicContact_order_idx" ON "TopicContact"("order");

-- CreateIndex
CREATE UNIQUE INDEX "TopicContact_topicId_contactId_key" ON "TopicContact"("topicId", "contactId");

-- CreateIndex
CREATE INDEX "CompanyMention_postId_idx" ON "CompanyMention"("postId");

-- CreateIndex
CREATE INDEX "CompanyMention_companyId_idx" ON "CompanyMention"("companyId");

-- CreateIndex
CREATE INDEX "CompanyMention_mentionedBy_idx" ON "CompanyMention"("mentionedBy");

-- CreateIndex
CREATE INDEX "CompanyMention_createdAt_idx" ON "CompanyMention"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMention_postId_companyId_mentionedBy_key" ON "CompanyMention"("postId", "companyId", "mentionedBy");

-- CreateIndex
CREATE INDEX "ContactMention_postId_idx" ON "ContactMention"("postId");

-- CreateIndex
CREATE INDEX "ContactMention_contactId_idx" ON "ContactMention"("contactId");

-- CreateIndex
CREATE INDEX "ContactMention_mentionedBy_idx" ON "ContactMention"("mentionedBy");

-- CreateIndex
CREATE INDEX "ContactMention_createdAt_idx" ON "ContactMention"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContactMention_postId_contactId_mentionedBy_key" ON "ContactMention"("postId", "contactId", "mentionedBy");

-- CreateIndex
CREATE INDEX "UserNetworkingActivity_userId_idx" ON "UserNetworkingActivity"("userId");

-- CreateIndex
CREATE INDEX "UserNetworkingActivity_companyId_idx" ON "UserNetworkingActivity"("companyId");

-- CreateIndex
CREATE INDEX "UserNetworkingActivity_interactionType_idx" ON "UserNetworkingActivity"("interactionType");

-- CreateIndex
CREATE INDEX "UserNetworkingActivity_createdAt_idx" ON "UserNetworkingActivity"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "PostContactMention_aiDetected_idx" ON "PostContactMention"("aiDetected");

-- CreateIndex
CREATE INDEX "PostContactMention_confidence_idx" ON "PostContactMention"("confidence");

-- CreateIndex
CREATE INDEX "PostContactMention_contactId_idx" ON "PostContactMention"("contactId");

-- CreateIndex
CREATE INDEX "PostContactMention_createdAt_idx" ON "PostContactMention"("createdAt");

-- CreateIndex
CREATE INDEX "PostContactMention_postId_idx" ON "PostContactMention"("postId");

-- CreateIndex
CREATE INDEX "PostContactMention_verified_idx" ON "PostContactMention"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "PostContactMention_postId_contactId_key" ON "PostContactMention"("postId", "contactId");

-- CreateIndex
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_eventCategory_idx" ON "analytics_events"("eventCategory");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_idx" ON "analytics_events"("eventType");

-- CreateIndex
CREATE INDEX "analytics_events_sessionId_idx" ON "analytics_events"("sessionId");

-- CreateIndex
CREATE INDEX "analytics_events_userId_idx" ON "analytics_events"("userId");

-- CreateIndex
CREATE INDEX "introduction_requests_createdAt_idx" ON "introduction_requests"("createdAt");

-- CreateIndex
CREATE INDEX "introduction_requests_facilitatorId_idx" ON "introduction_requests"("facilitatorId");

-- CreateIndex
CREATE INDEX "introduction_requests_requesterId_idx" ON "introduction_requests"("requesterId");

-- CreateIndex
CREATE INDEX "introduction_requests_status_idx" ON "introduction_requests"("status");

-- CreateIndex
CREATE INDEX "introduction_requests_targetCompanyId_idx" ON "introduction_requests"("targetCompanyId");

-- CreateIndex
CREATE INDEX "introduction_requests_targetContactId_idx" ON "introduction_requests"("targetContactId");

-- CreateIndex
CREATE INDEX "PostFollow_userId_idx" ON "PostFollow"("userId");

-- CreateIndex
CREATE INDEX "PostFollow_postId_idx" ON "PostFollow"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostFollow_userId_postId_key" ON "PostFollow"("userId", "postId");

-- CreateIndex
CREATE INDEX "PostBookmark_userId_idx" ON "PostBookmark"("userId");

-- CreateIndex
CREATE INDEX "PostBookmark_postId_idx" ON "PostBookmark"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostBookmark_userId_postId_key" ON "PostBookmark"("userId", "postId");

-- CreateIndex
CREATE INDEX "CompanyFollow_userId_idx" ON "CompanyFollow"("userId");

-- CreateIndex
CREATE INDEX "CompanyFollow_companyId_idx" ON "CompanyFollow"("companyId");

-- CreateIndex
CREATE INDEX "CompanyFollow_createdAt_idx" ON "CompanyFollow"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyFollow_userId_companyId_key" ON "CompanyFollow"("userId", "companyId");

-- CreateIndex
CREATE INDEX "UserFollow_followerId_idx" ON "UserFollow"("followerId");

-- CreateIndex
CREATE INDEX "UserFollow_followingId_idx" ON "UserFollow"("followingId");

-- CreateIndex
CREATE INDEX "UserFollow_createdAt_idx" ON "UserFollow"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserFollow_followerId_followingId_key" ON "UserFollow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "CodeGeneration_userId_idx" ON "CodeGeneration"("userId");

-- CreateIndex
CREATE INDEX "CodeGeneration_language_idx" ON "CodeGeneration"("language");

-- CreateIndex
CREATE INDEX "CodeGeneration_codeType_idx" ON "CodeGeneration"("codeType");

-- CreateIndex
CREATE INDEX "CodeGeneration_createdAt_idx" ON "CodeGeneration"("createdAt");

-- CreateIndex
CREATE INDEX "CodeGeneration_forumPostId_idx" ON "CodeGeneration"("forumPostId");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEmail_email_key" ON "WaitlistEmail"("email");

-- CreateIndex
CREATE INDEX "WaitlistEmail_email_idx" ON "WaitlistEmail"("email");

-- CreateIndex
CREATE INDEX "WaitlistEmail_status_idx" ON "WaitlistEmail"("status");

-- CreateIndex
CREATE INDEX "WaitlistEmail_createdAt_idx" ON "WaitlistEmail"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_parentCompanyId_fkey" FOREIGN KEY ("parentCompanyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPartnership" ADD CONSTRAINT "CompanyPartnership_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPartnership" ADD CONSTRAINT "CompanyPartnership_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Search" ADD CONSTRAINT "Search_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Search" ADD CONSTRAINT "Search_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInteraction" ADD CONSTRAINT "ContactInteraction_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInteraction" ADD CONSTRAINT "ContactInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactNote" ADD CONSTRAINT "ContactNote_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactNote" ADD CONSTRAINT "ContactNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewedContact" ADD CONSTRAINT "ViewedContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewedContact" ADD CONSTRAINT "ViewedContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactStatus" ADD CONSTRAINT "ContactStatus_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactStatus" ADD CONSTRAINT "ContactStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInsight" ADD CONSTRAINT "CompanyInsight_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConnection" ADD CONSTRAINT "UserConnection_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConnection" ADD CONSTRAINT "UserConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardActivity" ADD CONSTRAINT "DashboardActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRating" ADD CONSTRAINT "EventRating_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRating" ADD CONSTRAINT "EventRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ForumCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ForumComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumVote" ADD CONSTRAINT "ForumVote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumVote" ADD CONSTRAINT "ForumVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumCommentVote" ADD CONSTRAINT "ForumCommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "ForumComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumCommentVote" ADD CONSTRAINT "ForumCommentVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumBookmark" ADD CONSTRAINT "ForumBookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumBookmark" ADD CONSTRAINT "ForumBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ForumCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicMention" ADD CONSTRAINT "TopicMention_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicMention" ADD CONSTRAINT "TopicMention_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicCompany" ADD CONSTRAINT "TopicCompany_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicCompany" ADD CONSTRAINT "TopicCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicContact" ADD CONSTRAINT "TopicContact_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicContact" ADD CONSTRAINT "TopicContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMention" ADD CONSTRAINT "CompanyMention_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMention" ADD CONSTRAINT "CompanyMention_mentionedBy_fkey" FOREIGN KEY ("mentionedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMention" ADD CONSTRAINT "CompanyMention_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMention" ADD CONSTRAINT "ContactMention_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMention" ADD CONSTRAINT "ContactMention_mentionedBy_fkey" FOREIGN KEY ("mentionedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMention" ADD CONSTRAINT "ContactMention_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNetworkingActivity" ADD CONSTRAINT "UserNetworkingActivity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNetworkingActivity" ADD CONSTRAINT "UserNetworkingActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostContactMention" ADD CONSTRAINT "PostContactMention_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostContactMention" ADD CONSTRAINT "PostContactMention_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "introduction_requests" ADD CONSTRAINT "introduction_requests_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "introduction_requests" ADD CONSTRAINT "introduction_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "introduction_requests" ADD CONSTRAINT "introduction_requests_targetCompanyId_fkey" FOREIGN KEY ("targetCompanyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "introduction_requests" ADD CONSTRAINT "introduction_requests_targetContactId_fkey" FOREIGN KEY ("targetContactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostFollow" ADD CONSTRAINT "PostFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostFollow" ADD CONSTRAINT "PostFollow_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostBookmark" ADD CONSTRAINT "PostBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostBookmark" ADD CONSTRAINT "PostBookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFollow" ADD CONSTRAINT "CompanyFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFollow" ADD CONSTRAINT "CompanyFollow_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeGeneration" ADD CONSTRAINT "CodeGeneration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
