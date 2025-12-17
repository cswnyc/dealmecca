'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building2, 
  Users, 
  MapPin, 
  Sparkles, 
  TrendingUp,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  location?: string;
  city?: string;
  state?: string;
  teamCount?: number;
  industry?: string;
  companyType?: string;
  recentActivity?: string;
  verified?: boolean;
  tier?: 'enterprise' | 'growth' | 'startup';
  // Add compatibility with existing Company interface
  _count?: {
    contacts: number;
  };
}

interface EnhancedCompanyGridProps {
  companies: Company[];
  loading?: boolean;
  variant?: 'companies' | 'agencies' | 'advertisers';
}

export function EnhancedCompanyGrid({ companies, loading = false, variant = 'companies' }: EnhancedCompanyGridProps) {
  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-gradient-to-r from-purple-500 to-blue-600';
      case 'growth': return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'startup': return 'bg-gradient-to-r from-orange-500 to-red-600';
      default: return 'bg-gradient-to-r from-muted-foreground to-muted-foreground/80';
    }
  };

  const getDisplayLocation = (company: Company) => {
    if (company.location) return company.location;
    if (company.city && company.state) return `${company.city}, ${company.state}`;
    if (company.city) return company.city;
    return 'Location not specified';
  };

  const getTeamCount = (company: Company) => {
    return company.teamCount || company._count?.contacts || 0;
  };

  const getIndustry = (company: Company) => {
    return company.industry || company.companyType || variant;
  };

  const getRecentActivity = (company: Company) => {
    return company.recentActivity || 'Recently updated';
  };

  const getTierFromType = (company: Company): 'enterprise' | 'growth' | 'startup' => {
    if (company.tier) return company.tier;
    // Infer tier from team size or company type
    const teamCount = getTeamCount(company);
    if (teamCount > 500) return 'enterprise';
    if (teamCount > 50) return 'growth';
    return 'startup';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-1 w-full bg-muted rounded-t-lg" />
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-muted rounded flex-1"></div>
                  <div className="h-8 bg-muted rounded w-10"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium text-foreground">No companies found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or filters to find the right companies.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => {
        const tier = getTierFromType(company);
        const teamCount = getTeamCount(company);
        const location = getDisplayLocation(company);
        const industry = getIndustry(company);
        const recentActivity = getRecentActivity(company);

        return (
          <Card 
            key={company.id} 
            className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80"
          >
            {/* Tier Indicator Bar */}
            <div className={`h-1 w-full ${getTierColor(tier)} rounded-t-lg`} />
            
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg">
                    <AvatarImage src={company.logoUrl} alt={company.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {company.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {company.name}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {location}
                    </div>
                  </div>
                </div>
                {company.verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Company Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-1 text-primary" />
                  <span className="font-medium">{teamCount}</span>
                  <span className="ml-1">contacts</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {industry}
                </Badge>
              </div>

              {/* Recent Activity */}
              <div className="flex items-center text-xs text-muted-foreground mb-4">
                <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                {recentActivity}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  asChild
                >
                  <Link href={`/orgs/companies/${company.id}`}>
                    <Building2 className="w-3 h-3 mr-1" />
                    View Company
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="px-3">
                  <Mail className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" className="px-3">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
