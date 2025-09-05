# DealMecca Org Chart Implementation Plan

## **🚀 Immediate Next Steps (This Week)**

### **Step 1: Schema Integration**

**Update the main Prisma schema** with our enhanced models:

```bash
# 1. Backup current schema
cp prisma/schema.prisma prisma/schema-backup.prisma

# 2. Merge enhanced schema with existing one
# Manual merge needed to preserve existing models
```

**Key Integration Points:**
- Keep existing User, Event, Forum models unchanged
- Replace Company model with enhanced version
- Replace Contact model with enhanced version  
- Add all new enums while preserving existing ones

### **Step 2: Create Migration Scripts**

**Generate Prisma migration:**
```bash
npx prisma migrate dev --name "enhance-org-chart-schema"
```

**Create data transformation script:**
```javascript
// scripts/transform-existing-data.js
async function transformExistingData() {
  // Transform company types
  await prisma.company.updateMany({
    where: { type: 'AGENCY' },
    data: { companyType: 'INDEPENDENT_AGENCY' }
  });
  
  // Split contact names
  const contacts = await prisma.contact.findMany();
  for (const contact of contacts) {
    const [firstName, ...lastNameParts] = contact.name.split(' ');
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        firstName,
        lastName: lastNameParts.join(' '),
        fullName: contact.name
      }
    });
  }
}
```

### **Step 3: Initial Data Seeding**

**Create seed data for major agencies:**
```javascript
// prisma/seeds/org-chart-data.ts
export const majorAgencies = [
  {
    name: "GroupM",
    slug: "groupm",
    companyType: "MEDIA_HOLDING_COMPANY",
    city: "New York",
    state: "NY", 
    region: "NORTHEAST",
    employeeCount: "MEGA_5000_PLUS",
    verified: true,
    dataQuality: "VERIFIED"
  },
  {
    name: "Mindshare",
    slug: "mindshare",
    companyType: "HOLDING_COMPANY_AGENCY",
    agencyType: "FULL_SERVICE",
    city: "New York",
    state: "NY",
    region: "NORTHEAST",
    employeeCount: "LARGE_201_1000",
    verified: true
  },
  // ... add 50+ major agencies initially
];

export const majorAdvertisers = [
  {
    name: "Procter & Gamble",
    slug: "procter-gamble",
    companyType: "NATIONAL_ADVERTISER",
    industry: "CPG_PERSONAL_CARE",
    city: "Cincinnati",
    state: "OH",
    region: "MIDWEST",
    verified: true
  }
  // ... add 100+ major brands initially
];
```

---

## **Week 1-2: Core API Development**

### **API Route Structure**

**Create the org chart API routes:**
```
app/api/orgs/
├── companies/
│   ├── route.ts              # GET /api/orgs/companies (search)
│   └── [id]/
│       ├── route.ts          # GET /api/orgs/companies/[id]
│       ├── contacts/
│       │   └── route.ts      # GET /api/orgs/companies/[id]/contacts
│       └── chart/
│           └── route.ts      # GET /api/orgs/companies/[id]/chart
├── contacts/
│   ├── route.ts              # GET /api/orgs/contacts (search)
│   └── [id]/
│       └── route.ts          # GET /api/orgs/contacts/[id]
├── search/
│   ├── suggestions/
│   │   └── route.ts          # GET /api/orgs/search/suggestions
│   └── facets/
│       └── route.ts          # GET /api/orgs/search/facets
└── admin/
    ├── verify/
    │   └── route.ts          # POST /api/orgs/admin/verify
    └── import/
        └── route.ts          # POST /api/orgs/admin/import
```

### **Company Search API Implementation**

```typescript
// app/api/orgs/companies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CompanySearchParams {
  q?: string;
  companyType?: string[];
  agencyType?: string[];
  industry?: string[];
  city?: string[];
  state?: string[];
  region?: string[];
  employeeCount?: string[];
  verified?: boolean;
  limit?: number;
  offset?: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Parse search parameters
  const params: CompanySearchParams = {
    q: searchParams.get('q') || undefined,
    companyType: searchParams.getAll('companyType'),
    agencyType: searchParams.getAll('agencyType'),
    industry: searchParams.getAll('industry'),
    city: searchParams.getAll('city'),
    state: searchParams.getAll('state'),
    region: searchParams.getAll('region'),
    employeeCount: searchParams.getAll('employeeCount'),
    verified: searchParams.get('verified') === 'true',
    limit: parseInt(searchParams.get('limit') || '20'),
    offset: parseInt(searchParams.get('offset') || '0')
  };

  try {
    // Build where clause
    const where: any = {
      AND: []
    };

    // Text search
    if (params.q) {
      where.AND.push({
        OR: [
          { name: { contains: params.q.toLowerCase() } },
          { description: { contains: params.q.toLowerCase() } },
          { city: { contains: params.q.toLowerCase() } }
        ]
      });
    }

    // Filter by company type
    if (params.companyType?.length) {
      where.AND.push({ companyType: { in: params.companyType } });
    }

    // Filter by agency type
    if (params.agencyType?.length) {
      where.AND.push({ agencyType: { in: params.agencyType } });
    }

    // Filter by location
    if (params.city?.length) {
      where.AND.push({ city: { in: params.city } });
    }
    if (params.state?.length) {
      where.AND.push({ state: { in: params.state } });
    }
    if (params.region?.length) {
      where.AND.push({ region: { in: params.region } });
    }

    // Filter by verification status
    if (params.verified !== undefined) {
      where.AND.push({ verified: params.verified });
    }

    // Execute search with counts
    const [companies, totalCount] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: { contacts: true }
          }
        },
        orderBy: [
          { verified: 'desc' },
          { name: 'asc' }
        ],
        take: params.limit,
        skip: params.offset
      }),
      prisma.company.count({ where })
    ]);

    // Generate facets for filtering
    const facets = await generateSearchFacets(where);

    return NextResponse.json({
      companies,
      totalCount,
      facets,
      pagination: {
        limit: params.limit,
        offset: params.offset,
        hasMore: totalCount > (params.offset! + params.limit!)
      }
    });

  } catch (error) {
    console.error('Company search error:', error);
    return NextResponse.json(
      { error: 'Failed to search companies' },
      { status: 500 }
    );
  }
}

async function generateSearchFacets(baseWhere: any) {
  // Generate facets for common filters
  const [companyTypes, locations, industries] = await Promise.all([
    prisma.company.groupBy({
      by: ['companyType'],
      where: baseWhere,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    }),
    prisma.company.groupBy({
      by: ['city', 'state'],
      where: baseWhere,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    }),
    prisma.company.groupBy({
      by: ['industry'],
      where: baseWhere,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    })
  ]);

  return {
    companyTypes: companyTypes.map(ct => ({
      type: ct.companyType,
      count: ct._count.id
    })),
    locations: locations.map(loc => ({
      location: `${loc.city}, ${loc.state}`,
      city: loc.city,
      state: loc.state,
      count: loc._count.id
    })),
    industries: industries.map(ind => ({
      industry: ind.industry,
      count: ind._count.id
    }))
  };
}
```

### **Contact Search API Implementation**

```typescript
// app/api/orgs/contacts/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const params = {
    q: searchParams.get('q'),
    companyId: searchParams.get('companyId'),
    department: searchParams.getAll('department'),
    seniority: searchParams.getAll('seniority'),
    roles: searchParams.getAll('roles'),
    territory: searchParams.getAll('territory'),
    verified: searchParams.get('verified') === 'true',
    limit: parseInt(searchParams.get('limit') || '20'),
    offset: parseInt(searchParams.get('offset') || '0')
  };

  const where: any = { AND: [] };

  // Text search across name and title
  if (params.q) {
    where.AND.push({
      OR: [
        { fullName: { contains: params.q.toLowerCase() } },
        { title: { contains: params.q.toLowerCase() } },
        { company: { name: { contains: params.q.toLowerCase() } } }
      ]
    });
  }

  // Filter by company
  if (params.companyId) {
    where.AND.push({ companyId: params.companyId });
  }

  // Filter by department
  if (params.department?.length) {
    where.AND.push({ department: { in: params.department } });
  }

  // Filter by seniority
  if (params.seniority?.length) {
    where.AND.push({ seniority: { in: params.seniority } });
  }

  // Only show active contacts
  where.AND.push({ isActive: true });

  const [contacts, totalCount] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            companyType: true,
            logoUrl: true
          }
        }
      },
      orderBy: [
        { verified: 'desc' },
        { seniority: 'desc' },
        { lastName: 'asc' }
      ],
      take: params.limit,
      skip: params.offset
    }),
    prisma.contact.count({ where })
  ]);

  return NextResponse.json({
    contacts,
    totalCount,
    pagination: {
      limit: params.limit,
      offset: params.offset,
      hasMore: totalCount > (params.offset + params.limit)
    }
  });
}
```

---

## **Week 3-4: Frontend Components**

### **Advanced Search Component**

```typescript
// components/orgs/OrgSearchFilters.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface SearchFilters {
  q: string;
  companyType: string[];
  agencyType: string[];
  industry: string[];
  location: string[];
  verified: boolean;
}

export function OrgSearchFilters({ onFiltersChange }: {
  onFiltersChange: (filters: SearchFilters) => void;
}) {
  const [filters, setFilters] = useState<SearchFilters>({
    q: '',
    companyType: [],
    agencyType: [],
    industry: [],
    location: [],
    verified: false
  });

  const updateFilters = (updates: Partial<SearchFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Search Filters</h3>
      
      {/* Text Search */}
      <div className="mb-4">
        <Input
          placeholder="Search companies, contacts, or locations..."
          value={filters.q}
          onChange={(e) => updateFilters({ q: e.target.value })}
          className="w-full"
        />
      </div>

      {/* Company Type Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Company Type</label>
        <div className="space-y-2">
          {[
            { value: 'INDEPENDENT_AGENCY', label: 'Independent Agency' },
            { value: 'HOLDING_COMPANY_AGENCY', label: 'Holding Company Agency' },
            { value: 'NATIONAL_ADVERTISER', label: 'National Advertiser' },
            { value: 'ADTECH_VENDOR', label: 'AdTech Vendor' }
          ].map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={filters.companyType.includes(option.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilters({
                      companyType: [...filters.companyType, option.value]
                    });
                  } else {
                    updateFilters({
                      companyType: filters.companyType.filter(t => t !== option.value)
                    });
                  }
                }}
              />
              <label htmlFor={option.value} className="text-sm">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Location</label>
        <Select
          multiple
          value={filters.location}
          onValueChange={(value) => updateFilters({ location: value })}
        >
          <option value="NY">New York</option>
          <option value="CA">California</option>
          <option value="IL">Illinois</option>
          <option value="TX">Texas</option>
        </Select>
      </div>

      {/* Verified Only */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={filters.verified}
            onCheckedChange={(checked) => updateFilters({ verified: !!checked })}
          />
          <label htmlFor="verified" className="text-sm">
            Verified contacts only
          </label>
        </div>
      </div>

      <Button 
        onClick={() => updateFilters({
          q: '',
          companyType: [],
          agencyType: [],
          industry: [],
          location: [],
          verified: false
        })}
        variant="outline"
        className="w-full"
      >
        Clear Filters
      </Button>
    </div>
  );
}
```

### **Company Card Component**

```typescript
// components/orgs/CompanyCard.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Building } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  companyType: string;
  city?: string;
  state?: string;
  verified: boolean;
  _count: { contacts: number };
}

export function CompanyCard({ company }: { company: Company }) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {company.logoUrl ? (
              <img 
                src={company.logoUrl} 
                alt={`${company.name} logo`}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{company.name}</h3>
              <p className="text-sm text-gray-600">
                {company.companyType.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          {company.verified && (
            <Badge variant="success">Verified</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{company.city}, {company.state}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{company._count.contacts} contacts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## **Week 5-6: Integration & Testing**

### **Search Page Implementation**

```typescript
// app/orgs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { OrgSearchFilters } from '@/components/orgs/OrgSearchFilters';
import { CompanyCard } from '@/components/orgs/CompanyCard';
import { ContactCard } from '@/components/orgs/ContactCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OrgsPage() {
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('companies');

  const handleSearch = async (filters: any) => {
    setLoading(true);
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else if (value) {
          queryParams.append(key, String(value));
        }
      });

      if (activeTab === 'companies') {
        const response = await fetch(`/api/orgs/companies?${queryParams}`);
        const data = await response.json();
        setCompanies(data.companies);
      } else {
        const response = await fetch(`/api/orgs/contacts?${queryParams}`);
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Organization Directory</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <OrgSearchFilters onFiltersChange={handleSearch} />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>

            <TabsContent value="companies">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contacts">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
```

---

## **Success Metrics & Monitoring**

### **Key Performance Indicators**

```typescript
// lib/analytics/org-chart-metrics.ts
export interface OrgChartMetrics {
  searchQueries: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  dataQuality: {
    verifiedCompanies: number;
    verifiedContacts: number;
    averageDataQuality: number;
  };
  userEngagement: {
    searchToDetailClickRate: number;
    exportUsage: number;
    savedSearches: number;
  };
  businessImpact: {
    proUpgradesFromOrgChart: number;
    leadGenerationValue: number;
    userRetentionBoost: number;
  };
}

export async function trackOrgChartUsage(
  userId: string, 
  action: string, 
  metadata?: any
) {
  await prisma.dashboardActivity.create({
    data: {
      userId,
      actionType: 'ORG_CHART_USAGE',
      title: action,
      description: `User ${action} in org chart`,
      metadata: JSON.stringify(metadata)
    }
  });
}
```

This implementation plan provides a clear roadmap to build DealMecca's competitive org chart system. The phased approach ensures we can launch an MVP quickly while building toward the comprehensive system that will outcompete SellerCrowd. 