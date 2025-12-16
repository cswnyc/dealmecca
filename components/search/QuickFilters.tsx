'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles, Building2, Users, MapPin, Star, TrendingUp, CheckCircle } from 'lucide-react';

interface QuickFilter {
  id: string;
  label: string;
  icon?: React.ReactNode;
  query?: string;
  filters: any;
  description?: string;
  color?: string;
}

interface QuickFiltersProps {
  activeTab: 'agencies' | 'advertisers' | 'people' | 'industries' | 'publisher' | 'dsp-ssp' | 'adtech';
  onApplyFilter: (filter: QuickFilter) => void;
}

export function QuickFilters({ activeTab, onApplyFilter }: QuickFiltersProps) {
  // Define quick filters for each tab
  const quickFilters: Record<string, QuickFilter[]> = {
    agencies: [
      {
        id: 'verified-agencies',
        label: 'Verified Only',
        icon: <CheckCircle className="h-3 w-3" />,
        filters: { verified: true },
        description: 'Show only verified agencies',
        color: 'bg-green-50 text-green-700 border-green-200'
      },
      {
        id: 'holding-companies',
        label: 'Holding Companies',
        icon: <Building2 className="h-3 w-3" />,
        filters: { agencyType: ['HOLDING_COMPANY_AGENCY', 'MEDIA_HOLDING_COMPANY'] },
        description: 'Major agency holding companies',
        color: 'bg-blue-50 text-blue-700 border-blue-200'
      },
      {
        id: 'independent-agencies',
        label: 'Independent',
        icon: <Star className="h-3 w-3" />,
        filters: { agencyType: ['INDEPENDENT_AGENCY'] },
        description: 'Independent agencies',
        color: 'bg-purple-50 text-purple-700 border-purple-200'
      },
      {
        id: 'ny-agencies',
        label: 'New York',
        icon: <MapPin className="h-3 w-3" />,
        filters: { states: ['NY'] },
        description: 'Agencies in New York',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
      },
      {
        id: 'ca-agencies',
        label: 'California',
        icon: <MapPin className="h-3 w-3" />,
        filters: { states: ['CA'] },
        description: 'Agencies in California',
        color: 'bg-orange-50 text-orange-700 border-orange-200'
      },
      {
        id: 'large-teams',
        label: 'Large Teams (50+)',
        icon: <Users className="h-3 w-3" />,
        filters: { minTeamSize: 50 },
        description: 'Agencies with 50+ employees',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      }
    ],
    advertisers: [
      {
        id: 'verified-advertisers',
        label: 'Verified Only',
        icon: <CheckCircle className="h-3 w-3" />,
        filters: { verified: true },
        description: 'Show only verified advertisers',
        color: 'bg-green-50 text-green-700 border-green-200'
      },
      {
        id: 'tech-advertisers',
        label: 'Technology',
        icon: <TrendingUp className="h-3 w-3" />,
        filters: { industry: ['TECHNOLOGY'] },
        description: 'Tech companies',
        color: 'bg-blue-50 text-blue-700 border-blue-200'
      },
      {
        id: 'retail-advertisers',
        label: 'Retail',
        icon: <Building2 className="h-3 w-3" />,
        filters: { industry: ['RETAIL'] },
        description: 'Retail & eCommerce',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      },
      {
        id: 'finance-advertisers',
        label: 'Financial Services',
        filters: { industry: ['FINANCIAL_SERVICES'] },
        description: 'Banks, insurance, fintech',
        color: 'bg-teal-50 text-teal-700 border-teal-200'
      },
      {
        id: 'healthcare-advertisers',
        label: 'Healthcare',
        filters: { industry: ['HEALTHCARE'] },
        description: 'Healthcare & pharma',
        color: 'bg-pink-50 text-pink-700 border-pink-200'
      },
      {
        id: 'fortune-500',
        label: 'Enterprise',
        icon: <Star className="h-3 w-3" />,
        filters: { minTeamSize: 100 },
        description: 'Large enterprises',
        color: 'bg-purple-50 text-purple-700 border-purple-200'
      }
    ],
    people: [
      {
        id: 'decision-makers',
        label: 'Decision Makers',
        icon: <Star className="h-3 w-3" />,
        filters: { isDecisionMaker: true },
        description: 'Key decision makers',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
      },
      {
        id: 'executives',
        label: 'C-Level',
        icon: <TrendingUp className="h-3 w-3" />,
        filters: { seniority: ['C_LEVEL', 'VP'] },
        description: 'C-level executives',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      },
      {
        id: 'digital-marketing',
        label: 'Digital Marketing',
        filters: { department: ['DIGITAL_MARKETING'] },
        description: 'Digital marketing professionals',
        color: 'bg-blue-50 text-blue-700 border-blue-200'
      },
      {
        id: 'media-buying',
        label: 'Media Buying',
        filters: { department: ['MEDIA_BUYING'] },
        description: 'Media buying & planning',
        color: 'bg-purple-50 text-purple-700 border-purple-200'
      },
      {
        id: 'creative',
        label: 'Creative',
        filters: { department: ['CREATIVE_SERVICES'] },
        description: 'Creative directors & designers',
        color: 'bg-pink-50 text-pink-700 border-pink-200'
      },
      {
        id: 'strategy',
        label: 'Strategy',
        filters: { department: ['STRATEGY_PLANNING'] },
        description: 'Strategic planning',
        color: 'bg-teal-50 text-teal-700 border-teal-200'
      }
    ]
  };

  const filters = quickFilters[activeTab] || [];

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
          Quick Filters
        </h3>
        <span className="text-xs text-muted-foreground">Popular searches</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onApplyFilter(filter)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:shadow-md hover:scale-105 ${
              filter.color || 'bg-muted text-foreground border-border'
            }`}
            title={filter.description}
          >
            {filter.icon}
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Click a quick filter to instantly apply common search criteria
      </p>
    </div>
  );
}
