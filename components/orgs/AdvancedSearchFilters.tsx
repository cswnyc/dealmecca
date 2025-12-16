'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, X, Filter, Shield } from 'lucide-react';

interface FilterSection {
  key: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
    count?: number;
  }>;
  expanded: boolean;
}

interface AdvancedSearchFiltersProps {
  activeTab: 'agencies' | 'advertisers' | 'contacts' | 'industries' | 'companies';
  facets: any;
  currentFilters: any;
  onFiltersChange: (filters: any) => void;
}

export function AdvancedSearchFilters({ 
  activeTab, 
  facets, 
  currentFilters, 
  onFiltersChange 
}: AdvancedSearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    companyType: true,
    location: true,
    verification: true
  });

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const getFilterSections = (): FilterSection[] => {
    if (activeTab === 'companies') {
      return [
        {
          key: 'companyType',
          label: 'Company Type',
          expanded: true,
          options: facets.companyTypes?.map((type: any) => ({
            value: type.type,
            label: type.label,
            count: type.count
          })) || []
        },
        {
          key: 'industry',
          label: 'Industry',
          expanded: false,
          options: facets.industries?.map((industry: any) => ({
            value: industry.industry,
            label: industry.label,
            count: industry.count
          })) || []
        },
        {
          key: 'location',
          label: 'Location',
          expanded: true,
          options: facets.locations?.map((loc: any) => ({
            value: `${loc.city},${loc.state}`,
            label: loc.location,
            count: loc.count
          })) || []
        },
        {
          key: 'employeeCount',
          label: 'Company Size',
          expanded: false,
          options: facets.sizes?.map((size: any) => ({
            value: size.size,
            label: size.label,
            count: size.count
          })) || []
        }
      ];
    } else {
      return [
        {
          key: 'department',
          label: 'Department',
          expanded: true,
          options: facets.departments?.map((dept: any) => ({
            value: dept.department,
            label: dept.label,
            count: dept.count
          })) || []
        },
        {
          key: 'seniority',
          label: 'Seniority Level',
          expanded: true,
          options: facets.seniorities?.map((sen: any) => ({
            value: sen.seniority,
            label: sen.label,
            count: sen.count
          })) || []
        },
        {
          key: 'company',
          label: 'Top Companies',
          expanded: false,
          options: facets.companies?.map((company: any) => ({
            value: company.companyId,
            label: company.name,
            count: company.count
          })) || []
        }
      ];
    }
  };

  const handleFilterChange = (filterKey: string, value: string, checked: boolean) => {
    const newFilters = { ...localFilters };
    
    if (!newFilters[filterKey]) {
      newFilters[filterKey] = [];
    }

    if (checked) {
      newFilters[filterKey] = [...newFilters[filterKey], value];
    } else {
      newFilters[filterKey] = newFilters[filterKey].filter((v: string) => v !== value);
    }

    // Clean up empty arrays
    if (newFilters[filterKey].length === 0) {
      delete newFilters[filterKey];
    }

    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleVerificationToggle = (checked: boolean) => {
    const newFilters = { ...localFilters };
    if (checked) {
      newFilters.verified = true;
    } else {
      delete newFilters.verified;
    }
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).reduce((count: number, filter) => {
      if (Array.isArray(filter)) {
        return count + filter.length;
      } else if (filter) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const filterSections = getFilterSections();
  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </CardTitle>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Verification Filter */}
        <div className="flex items-center space-x-2 p-3 bg-primary/10 rounded-lg">
          <Checkbox
            id="verified"
            checked={localFilters.verified || false}
            onCheckedChange={handleVerificationToggle}
          />
          <Shield className="w-4 h-4 text-primary" />
          <label htmlFor="verified" className="text-sm font-medium">
            Verified only
          </label>
        </div>

        {/* Dynamic Filter Sections */}
        {filterSections.map((section) => (
          <div key={section.key} className="border-b pb-4 last:border-b-0">
            <Collapsible 
              open={expandedSections[section.key]} 
              onOpenChange={() => toggleSection(section.key)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded">
                <span className="font-medium text-sm">{section.label}</span>
                <div className="flex items-center space-x-2">
                  {localFilters[section.key]?.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {localFilters[section.key].length}
                    </Badge>
                  )}
                  {expandedSections[section.key] ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="pt-2">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {section.options.slice(0, 10).map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${section.key}-${option.value}`}
                        checked={localFilters[section.key]?.includes(option.value) || false}
                        onCheckedChange={(checked) => 
                          handleFilterChange(section.key, option.value, !!checked)
                        }
                      />
                      <label 
                        htmlFor={`${section.key}-${option.value}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {option.label}
                        {option.count && (
                          <span className="text-muted-foreground ml-1">({option.count})</span>
                        )}
                      </label>
                    </div>
                  ))}
                  
                  {section.options.length > 10 && (
                    <Button variant="ghost" size="sm" className="w-full">
                      Show {section.options.length - 10} more
                    </Button>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}

        {/* Quick Filters */}
        <div className="pt-4 border-t">
          <div className="text-sm font-medium mb-2">Quick Filters</div>
          <div className="flex flex-wrap gap-2">
            {activeTab === 'companies' ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onFiltersChange({ companyType: ['INDEPENDENT_AGENCY'] })}
                >
                  Independent Agencies
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onFiltersChange({ companyType: ['NATIONAL_ADVERTISER'] })}
                >
                  National Advertisers
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onFiltersChange({ seniority: ['C_LEVEL', 'VP', 'SVP'] })}
                >
                  Senior Level
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onFiltersChange({ department: ['MEDIA_BUYING', 'MEDIA_PLANNING'] })}
                >
                  Media Professionals
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 