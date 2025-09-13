import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CompanyDetailTabs } from '@/components/org-charts/CompanyDetailTabs';
import { OrgChartVisualizer } from '@/components/org-charts/OrgChartVisualizer';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ForumLayout } from '@/components/layout/ForumLayout';
import { prisma } from '@/lib/prisma';
import { 
  Building2, 
  Users, 
  MapPin, 
  ExternalLink, 
  Mail, 
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Crown,
  Shield,
  User,
  Briefcase,
  TrendingUp,
  Users as UsersIcon,
  Network
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  email?: string;
  department?: string;
  seniority?: string;
  primaryRole?: string;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  companyType: string;
  agencyType?: string;
  industry: string;
  description?: string;
  website?: string;
  city?: string;
  state?: string;
  employeeCount: string;
  revenueRange: string;
  parentCompany?: {
    id: string;
    name: string;
    slug: string;
  };
  subsidiaries: {
    id: string;
    name: string;
    slug: string;
    companyType: string;
    _count: {
      contacts: number;
    };
  }[];
  contacts: Contact[];
}

async function getCompanyWithOrgChart(slug: string): Promise<Company | null> {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      parentCompany: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      subsidiaries: {
        select: {
          id: true,
          name: true,
          slug: true,
          companyType: true,
          _count: {
            select: {
              contacts: true,
            },
          },
        },
      },
      contacts: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          title: true,
          email: true,
          department: true,
          seniority: true,
          primaryRole: true,
        },
        orderBy: [
          { seniority: 'asc' },
          { department: 'asc' },
          { lastName: 'asc' },
        ],
      },
    },
  });

  return company;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyWithOrgChart(slug);
  
  if (!company) {
    return {
      title: 'Company Not Found',
    };
  }

  return {
    title: `${company.name} - Organization Chart`,
    description: company.description || `Organizational hierarchy and leadership structure for ${company.name}`,
  };
}


async function OrgChartContent({ slug }: { slug: string }) {
  const company = await getCompanyWithOrgChart(slug);

  if (!company) {
    notFound();
  }


  return (
    <ForumLayout>
      <div className="container mx-auto py-6 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/org-charts" className="hover:text-foreground transition-colors">
          Organization Charts
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{company.name}</span>
      </div>

      {/* Company Header */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
                {company.city && company.state && (
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {company.city}, {company.state}
                  </div>
                )}
              </div>
            </div>
            
            {company.description && (
              <p className="text-lg text-muted-foreground max-w-2xl">{company.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {company.companyType.replace('_', ' ')}
              </Badge>
              {company.agencyType && (
                <Badge variant="outline">
                  {company.agencyType.replace('_', ' ')}
                </Badge>
              )}
              <Badge variant="outline">
                {company.contacts.length} contacts
              </Badge>
              {company.subsidiaries.length > 0 && (
                <Badge variant="outline">
                  {company.subsidiaries.length} subsidiaries
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {company.website && (
              <Button variant="outline" asChild>
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Website
                </a>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/org-charts">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Link>
            </Button>
          </div>
        </div>

        {/* Parent/Subsidiary Navigation */}
        {(company.parentCompany || company.subsidiaries.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {company.parentCompany && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                    Parent Company
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link 
                    href={`/org-charts/${company.parentCompany.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{company.parentCompany.name}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {company.subsidiaries.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Portfolio Companies ({company.subsidiaries.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {company.subsidiaries.map((sub) => (
                    <Link 
                      key={sub.id}
                      href={`/org-charts/${sub.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{sub.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {sub._count.contacts} contacts
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Separator />
      
      {/* Organization Chart Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Network className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Organization Chart</h2>
              <p className="text-gray-600">Explore the organizational hierarchy</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <UsersIcon className="w-4 h-4" />
            <span>{company.contacts.length} employees</span>
          </div>
        </div>
        
        <OrgChartVisualizer 
          companyId={company.id}
          companyName={company.name}
          className="min-h-96"
        />
      </div>

      <Separator />

      {/* Tabbed Company Details */}
      <CompanyDetailTabs company={company} />
      </div>
    </ForumLayout>
  );
}

export default async function CompanyOrgChartPage({ params }: PageProps) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={
      <ForumLayout>
        <div className="container mx-auto py-6 space-y-8">
          <Skeleton className="h-4 w-48" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-6 w-128" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
          </div>
          
          {/* Org Chart Loading Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-1 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex space-x-4 p-4 border rounded-lg">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ForumLayout>
    }>
      <OrgChartContent slug={slug} />
    </Suspense>
  );
}