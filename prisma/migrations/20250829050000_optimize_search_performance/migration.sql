-- Performance optimization migration for 1000+ companies
-- This migration adds composite indexes for common search patterns and full-text search capabilities

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Companies table optimization
-- Composite index for location-based searches (most common filter combination)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_companies_location_verified" 
ON "companies" ("city", "state", "verified") 
WHERE "city" IS NOT NULL AND "state" IS NOT NULL;

-- Composite index for company type and industry filtering (frequent search combination)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_companies_type_industry_verified" 
ON "companies" ("companyType", "industry", "verified")
WHERE "industry" IS NOT NULL;

-- Composite index for employee size and revenue filtering  
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_companies_size_revenue_verified" 
ON "companies" ("employeeCount", "revenueRange", "verified")
WHERE "employeeCount" IS NOT NULL;

-- Full-text search index for company names and descriptions using GIN
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_companies_fulltext_search" 
ON "companies" USING GIN (to_tsvector('english', 
  COALESCE("name", '') || ' ' || 
  COALESCE("description", '') || ' ' ||
  COALESCE("city", '') || ' ' ||
  COALESCE("state", '')
));

-- Trigram index for fuzzy name matching
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_companies_name_trigram"
ON "companies" USING GIN ("name" gin_trgm_ops);

-- Index for normalized website lookups (duplicate detection)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_companies_normalized_website"
ON "companies" ("normalizedWebsite") 
WHERE "normalizedWebsite" IS NOT NULL;

-- Contacts table optimization
-- Composite index for contact search by seniority and department (most common filters)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contacts_seniority_dept_active" 
ON "contacts" ("seniority", "department", "verified", "isActive") 
WHERE "isActive" = true AND "department" IS NOT NULL;

-- Composite index for decision makers by company (high-value searches)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contacts_decision_makers_company" 
ON "contacts" ("companyId", "isDecisionMaker", "seniority", "verified") 
WHERE "isDecisionMaker" = true AND "isActive" = true;

-- Full-text search index for contact names and titles
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contacts_fulltext_search" 
ON "contacts" USING GIN (to_tsvector('english', 
  COALESCE("firstName", '') || ' ' || 
  COALESCE("lastName", '') || ' ' || 
  COALESCE("title", '') || ' ' || 
  COALESCE("fullName", '') || ' ' ||
  COALESCE("email", '')
)) WHERE "isActive" = true;

-- Trigram index for fuzzy contact name matching
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contacts_name_trigram"
ON "contacts" USING GIN (("firstName" || ' ' || "lastName") gin_trgm_ops)
WHERE "isActive" = true;

-- Index for email domain searches (company research)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contacts_email_domain" 
ON "contacts" (split_part("email", '@', 2)) 
WHERE "email" IS NOT NULL AND "isActive" = true;

-- Composite index for contact role and company filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contacts_role_company_active" 
ON "contacts" ("primaryRole", "companyId", "verified", "isActive")
WHERE "isActive" = true AND "primaryRole" IS NOT NULL;

-- Search analytics and usage tracking indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_searches_user_recent" 
ON "Search" ("userId", "createdAt" DESC, "searchType") 
WHERE "createdAt" >= NOW() - INTERVAL '30 days';

-- Index for search query analysis and suggestions
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_searches_query_fulltext" 
ON "Search" USING GIN (to_tsvector('english', "query"))
WHERE LENGTH("query") >= 3;

-- Index for search popularity analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_searches_query_popularity"
ON "Search" ("query", "createdAt" DESC)
WHERE "resultsCount" > 0;

-- Forum performance indexes (related to company/contact mentions)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_forum_posts_activity_featured" 
ON "ForumPost" ("lastActivityAt" DESC, "isPinned", "isFeatured") 
WHERE "isPinned" = true OR "isFeatured" = true;

-- Company mentions optimization (for trending analysis)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_company_mentions_recent" 
ON "CompanyMention" ("companyId", "createdAt" DESC, "postId");

-- Contact mentions optimization  
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contact_mentions_recent" 
ON "ContactMention" ("contactId", "createdAt" DESC, "postId");

-- Performance analytics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_users_analytics" 
ON "User" ("role", "subscriptionTier", "createdAt", "searchesUsed")
WHERE "searchesUsed" > 0;

-- Events location and date optimization (for event-based searches)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_events_location_upcoming" 
ON "Event" ("location", "startDate", "status") 
WHERE "status" = 'PUBLISHED' AND "startDate" >= NOW();

-- User networking activity (for engagement analytics)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_networking_activity_recent" 
ON "UserNetworkingActivity" ("userId", "createdAt" DESC, "interactionType")
WHERE "createdAt" >= NOW() - INTERVAL '90 days';

-- Saved searches optimization (for user experience)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_saved_searches_active_user" 
ON "SavedSearch" ("userId", "isActive", "lastRun" DESC) 
WHERE "isActive" = true;

-- Notifications performance (for real-time features)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_user_unread_recent" 
ON "Notification" ("userId", "read", "createdAt" DESC) 
WHERE "read" = false AND "createdAt" >= NOW() - INTERVAL '7 days';

-- Contact interactions (for CRM features)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contact_interactions_recent"
ON "ContactInteraction" ("contactId", "createdAt" DESC, "type", "userId");

-- Company insights (for intelligence features)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_company_insights_relevant"
ON "CompanyInsight" ("companyId", "type", "relevanceScore" DESC, "createdAt" DESC)
WHERE "relevanceScore" >= 50;

-- Connection tracking (for networking features)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_connections_active"
ON "UserConnection" ("userId", "strength", "lastContact" DESC)
WHERE "lastContact" >= NOW() - INTERVAL '6 months';

-- View tracking (for popular content)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_viewed_contacts_popular"
ON "ViewedContact" ("contactId", "viewedAt" DESC)
WHERE "viewedAt" >= NOW() - INTERVAL '30 days';

-- Performance monitoring table (for query analysis)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'query_performance_log') THEN
        CREATE TABLE query_performance_log (
            id SERIAL PRIMARY KEY,
            query_type VARCHAR(255) NOT NULL,
            execution_time_ms INTEGER NOT NULL,
            result_count INTEGER,
            user_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT NOW(),
            query_params JSONB,
            error_message TEXT
        );
        
        CREATE INDEX idx_query_performance_type_time ON query_performance_log (query_type, created_at DESC);
        CREATE INDEX idx_query_performance_slow ON query_performance_log (execution_time_ms DESC) WHERE execution_time_ms > 1000;
    END IF;
END $$;

-- Update table statistics to help query planner
ANALYZE "companies";
ANALYZE "contacts";
ANALYZE "Search";
ANALYZE "ForumPost";
ANALYZE "User";