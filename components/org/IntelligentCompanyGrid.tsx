'use client';

import { useState } from 'react';
import { EnhancedCompanyCard } from './EnhancedCompanyCard';
import { Building2, Filter, SortAsc, Grid3X3, List, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EnhancedCompany {
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
  website?: string;
  
  // Intelligence data
  dealPotential?: 'HIGH' | 'MEDIUM' | 'LOW';
  budgetRange?: string;
  lastEngagement?: string;
  relationshipStrength?: number;
  competitorIntel?: {
    currentVendors: string[];
    contractExpiry?: string;
    satisfaction?: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  keyContacts?: {
    decisionMakers: number;
    influencers: number;
    champions: number;
  };
  recentNews?: string[];
  financialHealth?: 'STRONG' | 'STABLE' | 'CONCERNING';
  growthTrend?: 'GROWING' | 'STABLE' | 'DECLINING';
  
  // Social proof
  followedBy?: number;
  views?: number;
  isFollowing?: boolean;
  isFavorite?: boolean;
  
  // Compatibility
  _count?: {
    contacts: number;
  };
}

interface IntelligentCompanyGridProps {
  companies: EnhancedCompany[];
  loading?: boolean;
  variant?: 'companies' | 'agencies' | 'advertisers' | 'prospects';
  showIntelligence?: boolean;
  onFollow?: (companyId: string) => void;
  onFavorite?: (companyId: string) => void;
  onShare?: (company: EnhancedCompany) => void;
}

export function IntelligentCompanyGrid({ 
  companies, 
  loading = false, 
  variant = 'companies',
  showIntelligence = true,
  onFollow,
  onFavorite,
  onShare
}: IntelligentCompanyGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'potential' | 'relationship' | 'lastContact'>('name');

  // Intelligence summary stats
  const intelligenceStats = {
    highPotential: companies.filter(c => c.dealPotential === 'HIGH').length,
    strongRelationships: companies.filter(c => (c.relationshipStrength || 0) >= 70).length,
    recentEngagement: companies.filter(c => c.lastEngagement && 
      new Date(c.lastEngagement) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length,
    totalFollowing: companies.filter(c => c.isFollowing).length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        {showIntelligence && (
          <div className="flex space-x-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 flex-1 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}
        
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border animate-pulse">
              <div className="h-1 w-full bg-gray-200 rounded-t-lg" />
              <div className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex space-x-2 mt-4">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded w-10"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filters to find the right companies.
        </p>
      </div>
    );
  }

  const sortedCompanies = [...companies].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'potential':
        const potentialOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return (potentialOrder[b.dealPotential || 'LOW'] || 0) - (potentialOrder[a.dealPotential || 'LOW'] || 0);
      case 'relationship':
        return (b.relationshipStrength || 0) - (a.relationshipStrength || 0);
      case 'lastContact':
        const aDate = a.lastEngagement ? new Date(a.lastEngagement).getTime() : 0;
        const bDate = b.lastEngagement ? new Date(b.lastEngagement).getTime() : 0;
        return bDate - aDate;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Intelligence Summary */}
      {showIntelligence && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white">
            <div className="text-2xl font-bold">{intelligenceStats.highPotential}</div>
            <div className="text-sm opacity-90">High Potential</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white">
            <div className="text-2xl font-bold">{intelligenceStats.strongRelationships}</div>
            <div className="text-sm opacity-90">Strong Relationships</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg p-4 text-white">
            <div className="text-2xl font-bold">{intelligenceStats.recentEngagement}</div>
            <div className="text-sm opacity-90">Recent Engagement</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-4 text-white">
            <div className="text-2xl font-bold">{intelligenceStats.totalFollowing}</div>
            <div className="text-sm opacity-90">Following</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={sortBy === 'potential' ? 'default' : 'outline'}
            onClick={() => setSortBy('potential')}
          >
            <SortAsc className="w-4 h-4 mr-1" />
            By Potential
          </Button>
          <Button
            size="sm"
            variant={sortBy === 'relationship' ? 'default' : 'outline'}
            onClick={() => setSortBy('relationship')}
          >
            <SortAsc className="w-4 h-4 mr-1" />
            By Relationship
          </Button>
          <Button
            size="sm"
            variant={sortBy === 'lastContact' ? 'default' : 'outline'}
            onClick={() => setSortBy('lastContact')}
          >
            <SortAsc className="w-4 h-4 mr-1" />
            By Last Contact
          </Button>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {sortedCompanies.map((company) => (
          <EnhancedCompanyCard
            key={company.id}
            company={company}
            variant={variant}
            showIntelligence={showIntelligence}
            onFollow={onFollow}
            onFavorite={onFavorite}
            onShare={onShare}
          />
        ))}
      </div>
    </div>
  );
}