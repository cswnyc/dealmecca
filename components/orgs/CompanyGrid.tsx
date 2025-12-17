'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Users, 
  ExternalLink, 
  Shield, 
  Star,
  Link as LinkIcon,
  TrendingUp,
  Award,
  Globe,
  Calendar,
  Eye
} from 'lucide-react';
import { Company } from '@/types/org-charts';
import { formatCount } from '@/lib/org-charts/tab-config';

interface CompanyGridProps {
  companies: Company[];
  loading: boolean;
  variant?: 'agencies' | 'advertisers' | 'companies';
}

export function CompanyGrid({ companies, loading, variant = 'companies' }: CompanyGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Add null safety check
  const safeCompanies = companies || [];

  if (loading && safeCompanies.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (safeCompanies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium text-foreground">
          No {variant} found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle with Enhanced Info */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 p-3 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          Showing {formatCount(safeCompanies.length)} {variant}
          {variant === 'agencies' && (
            <span className="block sm:inline sm:ml-2 text-xs text-muted-foreground">
              • {safeCompanies.filter(c => c.verified).length} verified
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="flex-1 sm:flex-none min-h-[44px]"
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex-1 sm:flex-none min-h-[44px]"
          >
            List
          </Button>
        </div>
      </div>

      {/* Company Grid */}
      <div className={`${viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
        : "space-y-4"
      } mobile-scroll-optimize`}
      >
        {safeCompanies.map((company) => (
          <CompanyCard 
            key={company.id} 
            company={company} 
            viewMode={viewMode}
            variant={variant}
          />
        ))}
      </div>

      {/* Mobile scroll optimization styles */}
      <style jsx>{`
        .mobile-scroll-optimize {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        
        /* Improve touch responsiveness */
        @media (max-width: 768px) {
          .mobile-scroll-optimize > * {
            touch-action: manipulation;
          }
        }
      `}</style>
    </div>
  );
}

function CompanyCard({ 
  company, 
  viewMode, 
  variant 
}: { 
  company: Company; 
  viewMode: 'grid' | 'list';
  variant: 'agencies' | 'advertisers' | 'companies';
}) {
  const getCompanyTypeColor = (type: string) => {
    switch (type) {
      case 'INDEPENDENT_AGENCY': return 'bg-blue-100 text-blue-800';
      case 'HOLDING_COMPANY_AGENCY': return 'bg-purple-100 text-purple-800';
      case 'NATIONAL_ADVERTISER': return 'bg-green-100 text-green-800';
      case 'MEDIA_HOLDING_COMPANY': return 'bg-indigo-100 text-indigo-800';
      case 'BOUTIQUE_AGENCY': return 'bg-emerald-100 text-emerald-800';
      case 'DIGITAL_AGENCY': return 'bg-blue-100 text-blue-800';
      case 'CREATIVE_AGENCY': return 'bg-pink-100 text-pink-800';
      case 'REGIONAL_ADVERTISER': return 'bg-emerald-100 text-emerald-800';
      case 'ECOMMERCE_BRAND': return 'bg-orange-100 text-orange-800';
      default: return 'bg-muted text-foreground';
    }
  };

  const getVariantSpecificInfo = () => {
    switch (variant) {
      case 'agencies':
        return {
          primaryMetric: company._count?.clients || 0,
          primaryLabel: 'clients',
          secondaryMetric: company._count?.contacts || 0,
          secondaryLabel: 'contacts',
          icon: LinkIcon,
          color: 'text-blue-600'
        };
      case 'advertisers':
        return {
          primaryMetric: company._count?.agencies || 0,
          primaryLabel: 'agency partners',
          secondaryMetric: company._count?.contacts || 0,
          secondaryLabel: 'contacts',
          icon: TrendingUp,
          color: 'text-green-600'
        };
      default:
        return {
          primaryMetric: company._count?.contacts || 0,
          primaryLabel: 'contacts',
          secondaryMetric: company._count?.subsidiaries || 0,
          secondaryLabel: 'subsidiaries',
          icon: Users,
          color: 'text-muted-foreground'
        };
    }
  };

  const variantInfo = getVariantSpecificInfo();

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
              {/* Logo */}
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                  <Link href={`/orgs/companies/${company.id}`} className="group">
                    <h3 className="font-semibold text-lg hover:text-primary cursor-pointer truncate group-hover:underline">
                      {company.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    {company.verified && (
                      <Shield className="w-4 h-4 text-green-600" />
                    )}
                    {company.dataQuality === 'VERIFIED' && (
                      <Award className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground mb-3">
                  <Badge className={getCompanyTypeColor(company.companyType)}>
                    {company.companyType.replace(/_/g, ' ')}
                  </Badge>
                  
                  {company.agencyType && variant === 'agencies' && (
                    <Badge variant="outline" className="text-xs">
                      {company.agencyType.replace(/_/g, ' ')}
                    </Badge>
                  )}

                  {company.industry && variant === 'advertisers' && (
                    <Badge variant="outline" className="text-xs">
                      {company.industry.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground">
                  {company.city && company.state && (
                    <div className="flex items-center justify-center sm:justify-start space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{company.city}, {company.state}</span>
                    </div>
                  )}
                  
                  {/* Enhanced Metrics Row */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <variantInfo.icon className={`w-3 h-3 ${variantInfo.color}`} />
                      <span>{formatCount(variantInfo.primaryMetric)} {variantInfo.primaryLabel}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span>{formatCount(variantInfo.secondaryMetric)} {variantInfo.secondaryLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto min-h-[44px]"
                asChild
              >
                <Link href={`/orgs/companies/${company.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Link>
              </Button>
              
              {company.website && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto min-h-[44px]"
                  asChild
                >
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <Link href={`/orgs/companies/${company.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {/* Logo */}
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
              )}
              
              {/* Company Name & Type */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                  {company.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {company.companyType.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* Enhanced Badge Section */}
            <div className="flex flex-col items-end space-y-1">
              {company.verified && (
                <Badge className="flex items-center space-x-1 bg-green-100 text-green-800">
                  <Shield className="w-3 h-3" />
                  <span>Verified</span>
                </Badge>
              )}
              {company.dataQuality === 'VERIFIED' && (
                <Badge className="flex items-center space-x-1 bg-yellow-100 text-yellow-800">
                  <Award className="w-3 h-3" />
                  <span>Premium</span>
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Parent Company or Key Relationship */}
          {company.parentCompany ? (
            <div className="mb-3 p-2 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground">Part of</div>
              <div className="text-sm font-medium">{company.parentCompany.name}</div>
            </div>
          ) : variant === 'agencies' && company.clients && company.clients.length > 0 ? (
            <div className="mb-3 p-2 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-600">Key Client</div>
              <div className="text-sm font-medium">{company.clients[0].name}</div>
            </div>
          ) : variant === 'advertisers' && company.agencies && company.agencies.length > 0 ? (
            <div className="mb-3 p-2 bg-green-50 rounded-lg">
              <div className="text-xs text-green-600">Primary Agency</div>
              <div className="text-sm font-medium">{company.agencies[0].name}</div>
            </div>
          ) : null}

          {/* Location & Enhanced Stats */}
          <div className="space-y-2 text-sm text-muted-foreground">
            {company.city && company.state && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{company.city}, {company.state}</span>
                {company.region && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {company.region.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Enhanced Metrics Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-1">
                <variantInfo.icon className={`w-4 h-4 ${variantInfo.color}`} />
                <span>{formatCount(variantInfo.primaryMetric)} {variantInfo.primaryLabel}</span>
              </div>
              
              {variantInfo.secondaryMetric > 0 && (
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{formatCount(variantInfo.secondaryMetric)} {variantInfo.secondaryLabel}</span>
                </div>
              )}
            </div>

            {/* Company Size & Revenue */}
            {(company.employeeCount || company.revenueRange) && (
              <div className="flex items-center justify-between text-xs">
                {company.employeeCount && (
                  <span className="bg-muted px-2 py-1 rounded">
                    {company.employeeCount.replace(/_/g, ' ')}
                  </span>
                )}
                {company.revenueRange && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    {company.revenueRange.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {company.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {company.description}
            </p>
          )}

          {/* Agency Type or Industry */}
          <div className="mt-3 flex flex-wrap gap-1">
            {company.agencyType && variant === 'agencies' && (
              <Badge variant="outline" className="text-xs">
                {company.agencyType.replace(/_/g, ' ')}
              </Badge>
            )}
            {company.industry && variant === 'advertisers' && (
              <Badge variant="outline" className="text-xs">
                {company.industry.replace(/_/g, ' ')}
              </Badge>
            )}
            {company.lastActivity && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Updated {new Date(company.lastActivity).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
} 