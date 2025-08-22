'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Phone,
  Mail,
  ExternalLink,
  Heart,
  MoreVertical,
  Building2,
  Bookmark,
  Share2,
  ChevronRight,
  Star,
  TrendingUp
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
  tier?: 'enterprise' | 'growth' | 'startup';
  verified?: boolean;
  recentActivity?: string;
  _count?: {
    contacts: number;
  };
}

interface MobileCompanyBrowserProps {
  companies?: Company[];
  loading?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: (filter: string) => void;
}

export function MobileCompanyBrowser({ 
  companies = [], 
  loading = false, 
  onSearch, 
  onFilter 
}: MobileCompanyBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [savedCompanies, setSavedCompanies] = useState<Set<string>>(new Set());

  const filters = ['All', 'Enterprise', 'Growth', 'Startup', 'Agencies', 'Brands', 'Tech', 'Marketing'];

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    onFilter?.(filter);
  };

  const toggleSaved = (companyId: string) => {
    setSavedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
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

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'growth': return 'bg-green-100 text-green-700 border-green-200';
      case 'startup': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Mock data for demo purposes
  const mockCompanies: Company[] = [
    {
      id: '1',
      name: 'Nike',
      logoUrl: '/logos/nike.png',
      location: 'Beaverton, OR',
      teamCount: 156,
      industry: 'Sportswear',
      tier: 'enterprise',
      verified: true,
      recentActivity: 'Updated 2 hours ago'
    },
    {
      id: '2',
      name: 'Spotify',
      logoUrl: '/logos/spotify.png',
      location: 'Stockholm, Sweden',
      teamCount: 89,
      industry: 'Technology',
      tier: 'growth',
      verified: true,
      recentActivity: 'Updated 5 hours ago'
    },
    {
      id: '3',
      name: 'Airbnb',
      logoUrl: '/logos/airbnb.png',
      location: 'San Francisco, CA',
      teamCount: 234,
      industry: 'Travel',
      tier: 'enterprise',
      verified: false,
      recentActivity: 'Updated 1 day ago'
    }
  ];

  const displayCompanies = companies.length > 0 ? companies : mockCompanies;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Loading Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 bg-gray-200 rounded-full flex-1 animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Loading Cards */}
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <CardContent className="p-0">
                <div className="p-4 bg-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="p-4 space-y-3">
          {/* Search Bar */}
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 rounded-full border-gray-200 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full px-3 shrink-0"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <Badge
                key={filter}
                variant={selectedFilter === filter ? "default" : "secondary"}
                className={`whitespace-nowrap cursor-pointer transition-all ${
                  selectedFilter === filter 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-blue-100 hover:text-blue-700'
                }`}
                onClick={() => handleFilterSelect(filter)}
              >
                {filter}
              </Badge>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-xs text-gray-500 text-center">
            {displayCompanies.length} companies found
          </div>
        </div>
      </div>

      {/* Company List */}
      <div className="p-4 space-y-3">
        {displayCompanies.map((company) => (
          <Card key={company.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              {/* Company Header */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
                      <AvatarImage src={company.logoUrl} alt={company.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {company.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
                        {company.verified && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-3 h-3 mr-1 shrink-0" />
                        <span className="truncate">{getDisplayLocation(company)}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="p-2 shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                {/* Company Stats Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="font-medium">{getTeamCount(company)}</span>
                      <span className="ml-1">contacts</span>
                    </div>
                    {company.tier && (
                      <Badge className={getTierColor(company.tier)} variant="outline">
                        {company.tier}
                      </Badge>
                    )}
                  </div>
                  {company.industry && (
                    <Badge variant="outline" className="text-xs">
                      {company.industry}
                    </Badge>
                  )}
                </div>

                {/* Recent Activity */}
                {company.recentActivity && (
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {company.recentActivity}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-white flex space-x-2">
                <Button size="sm" className="flex-1 rounded-full" asChild>
                  <Link href={`/orgs/companies/${company.id}`}>
                    <Building2 className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="rounded-full px-3">
                  <Mail className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="rounded-full px-3">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={`rounded-full px-3 ${
                    savedCompanies.has(company.id) 
                      ? 'bg-red-50 text-red-600 border-red-200' 
                      : ''
                  }`}
                  onClick={() => toggleSaved(company.id)}
                >
                  <Heart className={`w-4 h-4 ${savedCompanies.has(company.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around py-3 px-2">
          {[
            { icon: Search, label: 'Browse', active: true },
            { icon: Heart, label: 'Saved', count: savedCompanies.size },
            { icon: Users, label: 'Contacts' },
            { icon: Building2, label: 'Companies' },
            { icon: MoreVertical, label: 'More' }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 ${
                  item.active ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.count && item.count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.count}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Custom CSS for scrollbar hide */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
