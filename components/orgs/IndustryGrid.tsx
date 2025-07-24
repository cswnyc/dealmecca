'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Building2, 
  Users, 
  DollarSign,
  ArrowRight,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Industry } from '@/types/org-charts';
import { formatCount } from '@/lib/org-charts/tab-config';
import Link from 'next/link';

interface IndustryGridProps {
  industries: Industry[];
  loading?: boolean;
}

export function IndustryGrid({ industries, loading }: IndustryGridProps) {
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (industries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No industries found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Industry Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Industries</p>
                <p className="text-xl font-bold">{industries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Companies</p>
                <p className="text-xl font-bold">
                  {formatCount(industries.reduce((sum, industry) => sum + industry.companyCount, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-xl font-bold">
                  {formatCount(industries.reduce((sum, industry) => sum + industry.contactCount, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Growth</p>
                <p className="text-xl font-bold">+12.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Industry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {industries.map((industry) => (
          <Card 
            key={industry.id}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => setExpandedIndustry(
              expandedIndustry === industry.id ? null : industry.id
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {industry.name}
                  </CardTitle>
                  {industry.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {industry.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCount(industry.companyCount)}
                    </div>
                    <div className="text-xs text-gray-600">Companies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCount(industry.contactCount)}
                    </div>
                    <div className="text-xs text-gray-600">Contacts</div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Company Size:</span>
                  <span className="font-medium">
                    {industry.averageEmployeeCount ? formatCount(industry.averageEmployeeCount) : 'N/A'}
                  </span>
                </div>

                {industry.totalRevenue && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Revenue:</span>
                    <span className="font-medium text-green-600">
                      {industry.totalRevenue}
                    </span>
                  </div>
                )}

                {/* Expanded Content */}
                {expandedIndustry === industry.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <h4 className="font-medium text-gray-900">Major Companies</h4>
                    <div className="space-y-2">
                      {industry.majorCompanies.slice(0, 3).map((company) => (
                        <Link 
                          key={company.id}
                          href={`/orgs/companies/${company.id}`}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-50 group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center space-x-2">
                            {company.logoUrl ? (
                              <img 
                                src={company.logoUrl} 
                                alt={company.name}
                                className="w-6 h-6 rounded object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                                <Building2 className="w-3 h-3 text-gray-500" />
                              </div>
                            )}
                            <span className="text-sm group-hover:text-blue-600">
                              {company.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {company.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                          </div>
                        </Link>
                      ))}
                      
                      {industry.majorCompanies.length > 3 && (
                        <div className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navigate to industry companies view
                            }}
                          >
                            View all {industry.companyCount} companies
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Filter companies by this industry
                    }}
                  >
                    <Building2 className="w-3 h-3 mr-1" />
                    Companies
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Filter contacts by this industry
                    }}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Contacts
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button (if needed) */}
      {industries.length >= 20 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Industries
          </Button>
        </div>
      )}
    </div>
  );
} 