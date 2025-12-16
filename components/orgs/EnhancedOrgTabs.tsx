'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  BarChart3, 
  ArrowUpDown, 
  Filter,
  Crown,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { 
  createTabConfigurations, 
  formatCount, 
  getTabDescription,
  getSortOptions,
  getTabSpecificFilters,
  TAB_RESULT_MAPPING
} from '@/lib/org-charts/tab-config';
import { TabConfig, SearchState, OrgAnalytics, Company, Contact, Industry } from '@/types/org-charts';
import { CompanyGrid } from './CompanyGrid';
import { ContactGrid } from './ContactGrid';
import { IndustryGrid } from './IndustryGrid';

interface EnhancedOrgTabsProps {
  searchState: SearchState;
  analytics: OrgAnalytics | null;
  onTabChange: (tabKey: string) => void;
  onSortChange: (sortBy: string, direction: 'asc' | 'desc') => void;
  onSearch: (query: string, filters: any) => void;
  loading: boolean;
}

const IconComponents = {
  Building2,
  TrendingUp,
  Users,
  BarChart3
};

export function EnhancedOrgTabs({
  searchState,
  analytics,
  onTabChange,
  onSortChange,
  onSearch,
  loading
}: EnhancedOrgTabsProps) {
  const [tabs, setTabs] = useState<TabConfig[]>([]);
  const [showAdvancedSort, setShowAdvancedSort] = useState(false);

  useEffect(() => {
    const tabConfigs = createTabConfigurations(analytics);
    setTabs(tabConfigs);
  }, [analytics]);

  const activeTab = tabs.find(tab => tab.key === searchState.activeTab);
  const sortOptions = getSortOptions(searchState.activeTab);
  const currentSort = sortOptions.find(option => option.key === searchState.sortBy);

  const handleSortChange = (sortKey: string) => {
    const sortOption = sortOptions.find(option => option.key === sortKey);
    if (sortOption) {
      onSortChange(sortKey, sortOption.direction);
    }
  };

  const toggleSortDirection = () => {
    const newDirection = searchState.sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(searchState.sortBy, newDirection);
  };

  const renderTabResults = () => {
    switch (searchState.activeTab) {
      case 'agencies':
        const agencyResults = (searchState.results.agencies || []) as Company[];
        return (
          <CompanyGrid
            companies={agencyResults}
            loading={loading}
            variant="agencies"
          />
        );
      case 'advertisers':
        const advertiserResults = (searchState.results.advertisers || []) as Company[];
        return (
          <CompanyGrid
            companies={advertiserResults}
            loading={loading}
            variant="advertisers"
          />
        );
      case 'contacts':
        const contactResults = (searchState.results.contacts || []) as any[];
        return (
          <ContactGrid
            contacts={contactResults}
            loading={loading}
          />
        );
      case 'industries':
        const industryResults = (searchState.results.industries || []) as Industry[];
        return (
          <IndustryGrid
            industries={industryResults}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Tab Navigation */}
      <Tabs value={searchState.activeTab} onValueChange={onTabChange}>
        <div className="space-y-4">
          {/* Tab Headers with Counts */}
          <div className="flex flex-col space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 h-auto">
              {tabs.map((tab) => {
                const IconComponent = IconComponents[tab.icon as keyof typeof IconComponents];
                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 px-3 py-3 relative group min-h-[60px] md:min-h-[48px]"
                    disabled={tab.premium && !analytics?.overview} // Premium feature check
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-xs md:text-sm font-medium">{tab.label}</span>
                    {tab.count > 0 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5 md:ml-2 mt-1 md:mt-0">
                        {formatCount(tab.count)}
                      </Badge>
                    )}
                    {tab.premium && (
                      <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Sort Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Sort by:</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={`${searchState.sortBy}:${searchState.sortDirection}`}
                  onValueChange={(value) => {
                    const [sortBy, direction] = value.split(':') as [string, 'asc' | 'desc'];
                    onSortChange(sortBy, direction);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
                    <SelectValue placeholder="Choose sort option" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSortOptions(searchState.activeTab).map((option) => (
                      <SelectItem key={`${option.key}:${option.direction}`} value={`${option.key}:${option.direction}`}>
                        <div className="flex items-center space-x-2">
                          {option.direction === 'asc' ? (
                            <SortAsc className="w-4 h-4" />
                          ) : (
                            <SortDesc className="w-4 h-4" />
                          )}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSearch(searchState.query, searchState.filters)}
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Description */}
          {activeTab && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-sm text-muted-foreground">
                  {getTabDescription(activeTab, searchState.query)}
                </div>
                {searchState.query && (
                  <Badge variant="outline" className="text-xs">
                    Searching: "{searchState.query}"
                  </Badge>
                )}
              </div>
              
              {analytics && (
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>Updated {new Date().toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{formatCount(searchState.results.totalCount)} total records</span>
                </div>
              )}
            </div>
          )}

          {/* Advanced Filters - Simplified version without problematic mapping */}
          {showAdvancedSort && activeTab && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Additional filtering options will be available here for {activeTab.label.toLowerCase()}.
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tab Content */}
        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-6">
            <div className="space-y-6">
              {/* Tab-specific content */}
              {renderTabResults()}
              
              {/* Show advanced filters toggle */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedSort(!showAdvancedSort)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showAdvancedSort ? 'Hide' : 'Show'} Advanced Filters
                </Button>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 