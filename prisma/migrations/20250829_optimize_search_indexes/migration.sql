-- Performance optimization migration for 1000+ companies
-- This migration adds composite indexes for common search patterns

-- Companies table optimization
-- Composite index for location-based searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS "companies_location_idx" 
ON "companies" ("city", "state", "verified") 
WHERE "city" IS NOT NULL AND "state" IS NOT NULL;

-- Composite index for company type and industry filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS "companies_type_industry_idx" 
ON "companies" ("companyType", "industry", "verified");

-- Composite index for employee size and revenue filtering  
CREATE INDEX CONCURRENTLY IF NOT EXISTS "companies_size_revenue_idx" 
ON "companies" ("employeeCount", "revenueRange", "verified");

-- Full-text search index for company names and descriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS "companies_search_idx" 
ON "companies" USING GIN (to_tsvector('english', "name" || ' ' || COALESCE("description", '')));

-- Index for company slug lookups (frequently used in API routes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "companies_slug_verified_idx" 
ON "companies" ("slug", "verified");

-- Contacts table optimization
-- Composite index for contact search by seniority and department
CREATE INDEX CONCURRENTLY IF NOT EXISTS "contacts_seniority_dept_idx" 
ON "contacts" ("seniority", "department", "verified", "isActive") 
WHERE "isActive" = true;

-- Composite index for decision makers by company
CREATE INDEX CONCURRENTLY IF NOT EXISTS "contacts_decision_makers_idx" 
ON "contacts" ("companyId", "isDecisionMaker", "seniority", "verified") 
WHERE "isDecisionMaker" = true AND "isActive" = true;

-- Full-text search index for contact names and titles
CREATE INDEX CONCURRENTLY IF NOT EXISTS "contacts_search_idx" 
ON "contacts" USING GIN (
  to_tsvector('english', 
    "firstName" || ' ' || 
    "lastName" || ' ' || 
    "title" || ' ' || 
    COALESCE("fullName", '')
  )
);

-- Index for email domain searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS "contacts_email_domain_idx" 
ON "contacts" (split_part("email", '@', 2)) 
WHERE "email" IS NOT NULL;

-- Composite index for contact role and company filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS "contacts_role_company_idx" 
ON "contacts" ("primaryRole", "companyId", "verified", "isActive");

-- Search table optimization for analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS "searches_analytics_idx" 
ON "Search" ("userId", "createdAt", "searchType") 
WHERE "createdAt" >= NOW() - INTERVAL '30 days';

-- Index for search query analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS "searches_query_analysis_idx" 
ON "Search" USING GIN (to_tsvector('english', "query"));

-- Forum performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "forum_posts_activity_idx" 
ON "ForumPost" ("lastActivityAt", "isPinned", "isFeatured") 
WHERE "isPinned" = true OR "isFeatured" = true;

-- Company mentions optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS "company_mentions_post_idx" 
ON "CompanyMention" ("postId", "companyId", "createdAt");

-- Contact mentions optimization  
CREATE INDEX CONCURRENTLY IF NOT EXISTS "contact_mentions_post_idx" 
ON "ContactMention" ("postId", "contactId", "createdAt");

-- Performance analytics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "user_activity_analytics_idx" 
ON "User" ("role", "subscriptionTier", "createdAt", "lastDashboardVisit");

-- Events performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "events_location_date_idx" 
ON "Event" ("location", "startDate", "status") 
WHERE "status" = 'PUBLISHED';

-- User networking activity optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS "networking_activity_user_idx" 
ON "UserNetworkingActivity" ("userId", "createdAt", "interactionType");

-- Saved searches optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS "saved_searches_active_idx" 
ON "SavedSearch" ("userId", "isActive", "lastRun") 
WHERE "isActive" = true;

-- Notification performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS "notifications_user_unread_idx" 
ON "Notification" ("userId", "read", "createdAt") 
WHERE "read" = false;