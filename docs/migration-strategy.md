# DealMecca Org Chart Migration Strategy

## **📊 Migration Overview**

This document outlines the step-by-step migration from the current DealMecca schema to the enhanced organization chart system that will compete with SellerCrowd.

---

## **Phase 1: Schema Enhancement (Week 1)**

### **1.1 Backup Current Database**
```bash
# Create backup of current database
cp prisma/dev.db prisma/dev-backup-$(date +%Y%m%d).db

# Export current data to JSON for safety
node scripts/export-current-data.js
```

### **1.2 Update Existing Models**

**Company Model Updates:**
- Add new enum fields (companyType → EnhancedCompanyType)
- Add geographic fields (city, state, region)
- Add structured size fields (employeeCount → EmployeeRange)
- Add verification system
- Add enhanced relationships

**Contact Model Updates:**
- Split name into firstName/lastName
- Add structured roles and responsibilities
- Add territory and decision-making fields
- Add verification system

### **1.3 Create Migration Scripts**

**Migration 1: Add Enhanced Company Fields**
```sql
-- Add new columns to Company table
ALTER TABLE Company ADD COLUMN city TEXT;
ALTER TABLE Company ADD COLUMN state TEXT;
ALTER TABLE Company ADD COLUMN region TEXT;
ALTER TABLE Company ADD COLUMN agencyType TEXT;
ALTER TABLE Company ADD COLUMN verified BOOLEAN DEFAULT false;
ALTER TABLE Company ADD COLUMN dataQuality TEXT DEFAULT 'BASIC';
-- ... additional fields
```

**Migration 2: Add Enhanced Contact Fields**
```sql
-- Add new columns to Contact table
ALTER TABLE Contact ADD COLUMN firstName TEXT;
ALTER TABLE Contact ADD COLUMN lastName TEXT;
ALTER TABLE Contact ADD COLUMN fullName TEXT;
ALTER TABLE Contact ADD COLUMN budgetRange TEXT;
ALTER TABLE Contact ADD COLUMN influenceLevel TEXT;
-- ... additional fields
```

**Migration 3: Data Transformation**
```sql
-- Split existing name field into firstName/lastName
UPDATE Contact SET 
  firstName = CASE 
    WHEN name LIKE '% %' THEN SUBSTR(name, 1, INSTR(name, ' ') - 1)
    ELSE name
  END,
  lastName = CASE 
    WHEN name LIKE '% %' THEN SUBSTR(name, INSTR(name, ' ') + 1)
    ELSE ''
  END,
  fullName = name;

-- Transform company types
UPDATE Company SET 
  companyType = CASE type
    WHEN 'AGENCY' THEN 'INDEPENDENT_AGENCY'
    WHEN 'ADVERTISER' THEN 'NATIONAL_ADVERTISER'
    WHEN 'MEDIA_COMPANY' THEN 'DIGITAL_PUBLISHER'
    WHEN 'TECH_VENDOR' THEN 'ADTECH_VENDOR'
    ELSE 'INDEPENDENT_AGENCY'
  END;
```

---

## **Phase 2: Data Population (Week 2-3)**

### **2.1 Industry Data Seeding**

**Major Agency Networks:**
```javascript
const majorAgencies = [
  {
    name: "GroupM",
    companyType: "MEDIA_HOLDING_COMPANY",
    city: "New York",
    state: "NY",
    region: "NORTHEAST",
    employeeCount: "MEGA_5000_PLUS",
    revenueRange: "FORTUNE_500_1B_PLUS",
    verified: true
  },
  {
    name: "Mindshare",
    companyType: "HOLDING_COMPANY_AGENCY", 
    parentCompany: "GroupM",
    agencyType: "FULL_SERVICE",
    // ... more details
  }
  // ... 200+ major agencies
];
```

**Fortune 500 Advertisers:**
```javascript
const majorAdvertisers = [
  {
    name: "Procter & Gamble",
    companyType: "NATIONAL_ADVERTISER",
    industry: "CPG_PERSONAL_CARE",
    city: "Cincinnati",
    state: "OH",
    region: "MIDWEST",
    verified: true
  }
  // ... 500+ major brands
];
```

### **2.2 Contact Data Import Strategy**

**Sources for Contact Data:**
1. **LinkedIn Sales Navigator exports** (with proper compliance)
2. **Industry conference attendee lists**
3. **Agency press releases and staff announcements**
4. **Industry publication bylines and quotes**
5. **User-contributed data with verification**

**Data Quality Levels:**
- **BASIC:** Name, company, title only
- **STANDARD:** + contact info, department
- **ENHANCED:** + responsibilities, territories  
- **PREMIUM:** + decision authority, full profile
- **VERIFIED:** Admin verified accuracy

---

## **Phase 3: API Development (Week 4-5)**

### **3.1 Core API Endpoints**

**Company Search & Filtering:**
```typescript
// GET /api/orgs/companies
interface CompanySearchParams {
  q?: string;                    // Text search
  companyType?: EnhancedCompanyType[];
  agencyType?: AgencyType[];
  industry?: Industry[];
  city?: string[];
  state?: USState[];
  region?: USRegion[];
  employeeCount?: EmployeeRange[];
  revenueRange?: RevenueRange[];
  verified?: boolean;
  limit?: number;
  offset?: number;
}

interface CompanySearchResponse {
  companies: Company[];
  totalCount: number;
  facets: {
    companyTypes: { type: string; count: number }[];
    locations: { location: string; count: number }[];
    industries: { industry: string; count: number }[];
  };
}
```

**Contact Search & Filtering:**
```typescript
// GET /api/orgs/contacts
interface ContactSearchParams {
  q?: string;                    // Text search
  companyId?: string;
  department?: Department[];
  seniority?: SeniorityLevel[];
  roles?: ContactRole[];
  territory?: Territory[];
  budgetRange?: BudgetRange[];
  decisionAreas?: DecisionArea[];
  verified?: boolean;
  limit?: number;
  offset?: number;
}
```

**Individual Company Org Chart:**
```typescript
// GET /api/orgs/companies/[id]
interface OrgChartResponse {
  company: Company;
  contacts: Contact[];
  hierarchy: {
    cLevel: Contact[];
    vpLevel: Contact[];
    directorLevel: Contact[];
    managerLevel: Contact[];
    specialists: Contact[];
  };
  departments: {
    [key: string]: Contact[];
  };
}
```

### **3.2 Advanced Search Features**

**AI-Powered Suggestions:**
```typescript
// GET /api/orgs/search/suggestions
interface SearchSuggestion {
  type: 'company' | 'contact' | 'industry' | 'location';
  value: string;
  description: string;
  count: number;
}
```

**Similar Companies:**
```typescript
// GET /api/orgs/companies/[id]/similar
interface SimilarCompaniesParams {
  basedOn: 'industry' | 'size' | 'location' | 'services';
  limit?: number;
}
```

---

## **Phase 4: Performance Optimization (Week 6)**

### **4.1 Database Indexing Strategy**

**High-Priority Indexes:**
```sql
-- Company search performance
CREATE INDEX idx_company_type_location ON Company(companyType, city, state);
CREATE INDEX idx_company_industry_size ON Company(industry, employeeCount, revenueRange);
CREATE INDEX idx_company_verified ON Company(verified, dataQuality);

-- Contact search performance  
CREATE INDEX idx_contact_role_seniority ON Contact(roles, seniority);
CREATE INDEX idx_contact_department_territory ON Contact(department, territories);
CREATE INDEX idx_contact_company_verified ON Contact(companyId, verified, isActive);

-- Full-text search
CREATE VIRTUAL TABLE company_fts USING fts5(name, description);
CREATE VIRTUAL TABLE contact_fts USING fts5(fullName, title);
```

### **4.2 Caching Strategy**

**Redis Caching Layers:**
```typescript
// Popular search results cached for 30 minutes
const cacheKey = `orgs:companies:${searchHash}`;
await redis.setex(cacheKey, 1800, JSON.stringify(results));

// Individual company org charts cached for 24 hours
const orgChartKey = `orgs:chart:${companyId}`;
await redis.setex(orgChartKey, 86400, JSON.stringify(orgChart));

// Search facets cached for 1 hour
const facetsKey = `orgs:facets:${filterHash}`;
await redis.setex(facetsKey, 3600, JSON.stringify(facets));
```

### **4.3 Query Optimization**

**Efficient Pagination:**
```typescript
// Use cursor-based pagination for large datasets
interface PaginationCursor {
  companyId: string;
  name: string;
  createdAt: Date;
}

// Optimized company search with faceted filters
const companies = await prisma.company.findMany({
  where: {
    AND: [
      textFilter,
      { companyType: { in: companyTypes } },
      { city: { in: cities } },
      { verified: true }
    ]
  },
  include: {
    _count: {
      select: { contacts: true }
    }
  },
  orderBy: [
    { verified: 'desc' },
    { name: 'asc' }
  ],
  take: limit + 1, // +1 to check if there are more results
  cursor: cursor ? { id: cursor.companyId } : undefined
});
```

---

## **Phase 5: User Interface Integration (Week 7-8)**

### **5.1 Search Interface Components**

**Advanced Filter Panel:**
- Company type multi-select with agency sub-types
- Geographic filters with region clustering
- Size filters with employee/revenue ranges
- Industry vertical filters
- Verification status toggle

**Results Display:**
- Company cards with logo, location, team count
- Contact cards with role, seniority, decision areas
- Org chart visualization for individual companies
- Export functionality for search results

### **5.2 Mobile Optimization**

**Responsive Design Features:**
- Touch-friendly filter controls
- Swipeable contact cards
- Collapsible org chart view
- Quick action buttons (email, LinkedIn, save)

---

## **Phase 6: Data Quality & Verification (Ongoing)**

### **6.1 User Contribution System**

**Crowd-sourced Updates:**
- Allow users to suggest contact updates
- Verification workflow for admin approval
- Reputation system for data contributors
- Incentives for high-quality submissions

### **6.2 Automated Data Refresh**

**LinkedIn Integration:**
- Monitor company pages for staff changes
- Track job posting trends for hiring insights
- Update contact titles and movements

**News & Press Release Monitoring:**
- Agency new business wins
- Leadership changes and promotions  
- Office openings and closures
- Merger & acquisition updates

---

## **Expected Results**

### **Competitive Advantages over SellerCrowd:**

1. **Modern, Mobile-First Interface** vs their dated desktop design
2. **AI-Powered Search Suggestions** vs basic keyword search
3. **Comprehensive Geographic Filtering** vs limited location options
4. **Advanced Role & Responsibility Tracking** vs basic title info
5. **Real-time Data Quality Verification** vs outdated information
6. **Integrated Forum & Networking Features** vs standalone directory

### **Key Performance Metrics:**

- **Search Speed:** <200ms average response time
- **Data Coverage:** 10,000+ companies, 100,000+ contacts
- **Data Accuracy:** >95% verification rate for premium data
- **User Engagement:** >80% monthly active user retention

### **Revenue Impact:**

- **PRO Subscription Driver:** Org chart access as premium feature
- **Lead Generation:** Contact export and CRM integration
- **Partnership Opportunities:** Data licensing to agencies
- **Event Integration:** Enhanced networking at conferences

This comprehensive org chart system will establish DealMecca as the definitive source for media industry relationships and organizational intelligence. 