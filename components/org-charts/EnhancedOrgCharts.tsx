'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Building2,
  Users,
  UserPlus,
  Search,
  Filter,
  ChevronDown,
  MapPin,
  Clock,
  Plus,
  Edit,
  Bookmark,
  ExternalLink,
  Building,
  Briefcase,
  Globe,
  TrendingUp,
  Star,
  Eye,
  Grid3X3,
  List,
  LayoutGrid
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AddEntityModal } from './AddEntityModal';
import { OrgChartNode, type OrgChartNodeData } from './OrgChartNode';

type TabType = 'companies' | 'agencies' | 'advertisers' | 'people' | 'industries' | 'archived';

interface FilterState {
  companyType?: string;
  geography?: string;
  size?: string;
  industry?: string;
  activity?: string;
}

interface OrgChartEntity {
  id: string;
  name: string;
  type: 'company' | 'agency' | 'advertiser' | 'person';
  logoUrl?: string;
  avatarUrl?: string;
  location?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  lastActivity?: string;
  teamCount?: number;
  clientCount?: number;
  agencyCount?: number;
  verified?: boolean;
  tier?: string;
  relationships?: {
    agencies?: string[];
    advertisers?: string[];
    people?: string[];
  };
  contactInfo?: {
    title?: string;
    department?: string;
    linkedin?: string;
    email?: string;
    handles?: string[];
  };
}

interface EnhancedOrgChartsProps {
  initialTab?: TabType;
}

export function EnhancedOrgCharts({ initialTab = 'companies' }: EnhancedOrgChartsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [entities, setEntities] = useState<OrgChartEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('latest_activity');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchEntities();
  }, [activeTab, searchQuery, filters, sortBy]);

  const fetchEntities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: activeTab,
        search: searchQuery,
        sort: sortBy,
        ...filters
      });

      const response = await fetch(`/api/org-charts/entities?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setEntities(data.entities || []);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch entities:', error);
      // Use mock data for now
      setEntities(getMockEntities(activeTab));
      setTotalCount(getMockEntities(activeTab).length);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery('');
    setFilters({});
    // Update URL without page reload
    const url = `/org-charts?tab=${tab}`;
    window.history.pushState({}, '', url);
  };

  const handleEntityClick = (entity: OrgChartEntity) => {
    // For now, redirect to the existing company detail pages using slugs
    // In a real implementation, you'd have proper slug mapping
    router.push(`/org-charts/${entity.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleEntityAdded = (newEntity: any) => {
    // Refresh the entities list
    fetchEntities();
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'agencies': return 'Add Agency';
      case 'advertisers': return 'Add Advertiser';  
      case 'people': return 'Add Person';
      case 'companies': return 'Add Company';
      default: return `Add ${activeTab.slice(0, -1)}`;
    }
  };

  const getEntityTypeForTab = (): 'agency' | 'advertiser' | 'person' => {
    switch (activeTab) {
      case 'agencies': return 'agency';
      case 'advertisers': return 'advertiser';
      case 'people': return 'person';
      default: return 'agency';
    }
  };

  const isAdmin = session?.user && ['ADMIN', 'TEAM'].includes(session.user.role as string);

  const tabs = [
    { id: 'companies' as TabType, label: 'Companies', count: totalCount },
    { id: 'agencies' as TabType, label: 'Agencies', count: totalCount },
    { id: 'advertisers' as TabType, label: 'Advertisers', count: totalCount },
    { id: 'people' as TabType, label: 'People', count: totalCount },
    { id: 'industries' as TabType, label: 'Industries', count: totalCount },
    { id: 'archived' as TabType, label: 'To be archived', count: 0 },
  ];

  const getEntityIcon = (entity: OrgChartEntity) => {
    switch (entity.type) {
      case 'agency': return <Building2 className="w-4 h-4" />;
      case 'advertiser': return <Briefcase className="w-4 h-4" />;
      case 'person': return <Users className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>;
      }
      return part;
    });
  };

  const renderEntityCard = (entity: OrgChartEntity) => {
    const isOrgChart = activeTab === 'companies' || activeTab === 'agencies';
    
    return (
    <Card 
      key={entity.id} 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50/30 hover:from-blue-50/50 hover:to-white relative overflow-hidden"
      onClick={() => handleEntityClick(entity)}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="relative">
              <Avatar className="w-14 h-14 ring-2 ring-white shadow-md">
                <AvatarImage src={entity.logoUrl || entity.avatarUrl} alt={entity.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                  {entity.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {entity.verified && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white fill-current" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-bold text-xl text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                  {highlightText(entity.name, searchQuery)}
                </h3>
                {entity.verified && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs font-medium">
                    ✓ Verified
                  </Badge>
                )}
                {isOrgChart && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    <Building2 className="w-3 h-3 mr-1" />
                    Org Chart
                  </Badge>
                )}
              </div>
              
              {entity.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                  {highlightText(entity.description, searchQuery)}
                </p>
              )}
              
              {/* Relationships */}
              {entity.relationships && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {entity.relationships.agencies?.slice(0, 2).map((agency, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      <Building2 className="w-3 h-3 mr-1" />
                      {highlightText(agency, searchQuery)}
                    </Badge>
                  ))}
                  {entity.relationships.advertisers?.slice(0, 2).map((advertiser, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {highlightText(advertiser, searchQuery)}
                    </Badge>
                  ))}
                  {((entity.relationships.agencies?.length || 0) + (entity.relationships.advertisers?.length || 0)) > 2 && (
                    <Badge variant="outline" className="text-xs text-blue-600 bg-blue-50 border-blue-200">
                      +{((entity.relationships.agencies?.length || 0) + (entity.relationships.advertisers?.length || 0)) - 2} more
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Location and Activity */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {entity.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{highlightText(entity.location, searchQuery)}</span>
                  </div>
                )}
                {entity.lastActivity && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Active {entity.lastActivity} ago</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button size="sm" variant="ghost" className="p-2 hover:bg-blue-100 hover:text-blue-700">
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="p-2 hover:bg-yellow-100 hover:text-yellow-700">
              <Bookmark className="w-4 h-4" />
            </Button>
            {isAdmin && (
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-100">
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Stats */}
        {(entity.teamCount || entity.clientCount || entity.agencyCount) && (
          <div className="flex items-center space-x-8 mt-4 pt-4 border-t border-gray-100">
            {entity.teamCount && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-bold text-gray-900 text-lg">{entity.teamCount.toLocaleString()}</span>
                  <span className="text-gray-600 ml-1 text-xs">team members</span>
                </div>
              </div>
            )}
            {entity.clientCount && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-bold text-gray-900 text-lg">{entity.clientCount.toLocaleString()}</span>
                  <span className="text-gray-600 ml-1 text-xs">clients</span>
                </div>
              </div>
            )}
            {entity.agencyCount && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="text-sm">
                  <span className="font-bold text-gray-900 text-lg">{entity.agencyCount.toLocaleString()}</span>
                  <span className="text-gray-600 ml-1 text-xs">agencies</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 border">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Organization Charts</h1>
              <p className="text-blue-100 text-lg">
                Explore organizational hierarchies across {totalCount.toLocaleString()} {activeTab}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 rounded-lg p-3">
                <TrendingUp className="w-8 h-8" />
              </div>
              {isAdmin && (
                <Button 
                  className="bg-white text-blue-700 hover:bg-blue-50 flex items-center space-x-2 font-semibold"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>{getAddButtonText()}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/5 rounded-full"></div>
      </div>

      {/* Enhanced Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex space-x-1 p-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count.toLocaleString()}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-12 bg-gray-50/50 border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-6 rounded-xl flex items-center space-x-2 font-medium"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {(filters.companyType || filters.geography || filters.size) && (
                <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
                  {Object.values(filters).filter(v => v).length}
                </Badge>
              )}
            </Button>
            
            <div className="hidden sm:flex items-center space-x-2 bg-gray-50 rounded-xl p-1">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results Highlighting */}
        {searchQuery && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <span>Search terms highlighted in results</span>
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mt-4">
            <CardContent className="p-6">
              {/* Agency Type Filter */}
              {activeTab === 'agencies' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    By Agency Type
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="any-type"
                        name="agencyType"
                        value=""
                        checked={!filters.companyType}
                        onChange={(e) => setFilters(prev => ({ ...prev, companyType: e.target.value }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="any-type" className="text-sm text-gray-700">Any type</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="independent-agency"
                        name="agencyType"
                        value="independent"
                        checked={filters.companyType === 'independent'}
                        onChange={(e) => setFilters(prev => ({ ...prev, companyType: e.target.value }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="independent-agency" className="text-sm text-gray-700">Independent Agency</label>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Holding/Parent Co.</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">Publicis Groupe</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">WPP</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">Omnicom Group</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">Interpublic Group</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">dentsu</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">Spark Foundry</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">GroupM</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">EssenceMediacom</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">Mindshare</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">Starcom Worldwide</Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Geographic Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  By Geography
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="any-geography"
                      name="geography"
                      value=""
                      checked={!filters.geography}
                      onChange={(e) => setFilters(prev => ({ ...prev, geography: e.target.value }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="any-geography" className="text-sm text-gray-700">Any geography</label>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="mt-3">
                  <Input
                    type="text"
                    placeholder="Find any region, state, or city..."
                    className="w-full"
                    value={filters.geography || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, geography: e.target.value }))}
                  />
                </div>
              </div>

              {/* Size/Scale Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  By Size
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="startup"
                      value="startup"
                      onChange={(e) => {
                        const size = filters.size || '';
                        const sizes = size.split(',').filter(s => s);
                        if (e.target.checked) {
                          sizes.push('startup');
                        } else {
                          const index = sizes.indexOf('startup');
                          if (index > -1) sizes.splice(index, 1);
                        }
                        setFilters(prev => ({ ...prev, size: sizes.join(',') }));
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="startup" className="text-sm text-gray-700">1-50</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mid"
                      value="mid"
                      onChange={(e) => {
                        const size = filters.size || '';
                        const sizes = size.split(',').filter(s => s);
                        if (e.target.checked) {
                          sizes.push('mid');
                        } else {
                          const index = sizes.indexOf('mid');
                          if (index > -1) sizes.splice(index, 1);
                        }
                        setFilters(prev => ({ ...prev, size: sizes.join(',') }));
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="mid" className="text-sm text-gray-700">51-500</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="large"
                      value="large"
                      onChange={(e) => {
                        const size = filters.size || '';
                        const sizes = size.split(',').filter(s => s);
                        if (e.target.checked) {
                          sizes.push('large');
                        } else {
                          const index = sizes.indexOf('large');
                          if (index > -1) sizes.splice(index, 1);
                        }
                        setFilters(prev => ({ ...prev, size: sizes.join(',') }));
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="large" className="text-sm text-gray-700">500+</label>
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by
                </label>
                <select
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="latest_activity">Latest activity</option>
                  <option value="name">Name A-Z</option>
                  <option value="size">Size</option>
                  <option value="location">Location</option>
                </select>
              </div>

              {/* Active Filters */}
              {(filters.companyType || filters.geography || filters.size) && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Active filters:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({})}
                      className="text-xs"
                    >
                      Clear all
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.companyType && (
                      <Badge variant="secondary" className="text-xs">
                        Type: {filters.companyType}
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, companyType: undefined }))}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {filters.geography && (
                      <Badge variant="secondary" className="text-xs">
                        Location: {filters.geography}
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, geography: undefined }))}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {filters.size && (
                      <Badge variant="secondary" className="text-xs">
                        Size: {filters.size.replace(',', ', ')}
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, size: undefined }))}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {totalCount.toLocaleString()} {activeTab}
        </p>
      </div>

      {/* Entity Cards */}
      <div className="grid grid-cols-1 gap-4">
        {entities.map(renderEntityCard)}
      </div>

      {entities.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No {activeTab} found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Add Entity Modal */}
      <AddEntityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        entityType={getEntityTypeForTab()}
        onEntityAdded={handleEntityAdded}
      />
    </div>
  );
}

// Mock data for development
function getMockEntities(type: TabType): OrgChartEntity[] {
  if (type === 'companies' || type === 'agencies') {
    return [
      {
        id: '1',
        name: 'Spark Foundry NY',
        type: 'agency',
        logoUrl: '/logos/spark-foundry.png',
        location: 'New York, NY',
        description: 'Data-driven media agency specializing in programmatic and performance marketing',
        lastActivity: '2 hrs',
        teamCount: 245,
        clientCount: 12,
        verified: true,
        relationships: {
          advertisers: ['Aflac', 'Johnson & Johnson', 'Meta'],
          agencies: ['Publicis Media', 'Spark Foundry Chicago']
        }
      },
      {
        id: '2',
        name: 'GroupM',
        type: 'agency',
        location: 'New York, NY',
        description: 'Global media investment company',
        lastActivity: '5 hrs',
        teamCount: 1200,
        clientCount: 45,
        verified: true,
        relationships: {
          advertisers: ['Google', 'Microsoft', 'Coca-Cola'],
        }
      }
    ];
  }

  if (type === 'advertisers') {
    return [
      {
        id: '1',
        name: 'Johnson & Johnson',
        type: 'advertiser',
        logoUrl: '/logos/jnj.png',
        location: 'New Brunswick, NJ',
        description: 'Global healthcare company',
        lastActivity: '5 hrs',
        agencyCount: 28,
        verified: true,
        relationships: {
          agencies: ['Critical Mass Chicago', 'Wavemaker NY', 'Wavemaker LA']
        }
      }
    ];
  }

  if (type === 'people') {
    return [
      {
        id: '1',
        name: 'Erin Beery',
        type: 'person',
        avatarUrl: '/avatars/erin.jpg',
        description: 'Senior Paid Search Specialist @ BarkleyOKRP Denver',
        lastActivity: '6 hrs',
        contactInfo: {
          title: 'Senior Paid Search Specialist',
          department: 'Digital Marketing',
          linkedin: 'https://linkedin.com/in/erinbeery',
          email: 'ebeery@barkleyokrp.com',
          handles: ['E-Z-GO']
        },
        relationships: {
          advertisers: ['Mariner Wealth', 'NCAA', 'Textron']
        }
      }
    ];
  }

  return [];
}