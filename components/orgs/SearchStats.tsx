'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Search, Download, Filter, RefreshCw } from 'lucide-react';

interface SearchStatsProps {
  query: string;
  totalResults: number;
  loading: boolean;
  activeTab: 'agencies' | 'advertisers' | 'contacts' | 'industries';
  searchTime?: number; // Search execution time in ms
  activeFilters?: number; // Number of active filters
  onRefresh?: () => void; // Refresh callback
  onExport?: () => void; // Export callback
}

export function SearchStats({ 
  query, 
  totalResults, 
  loading, 
  activeTab, 
  searchTime,
  activeFilters = 0,
  onRefresh,
  onExport 
}: SearchStatsProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getResultQuality = (count: number) => {
    if (count === 0) return { text: 'No results', color: 'text-gray-500' };
    if (count < 10) return { text: 'Limited results', color: 'text-yellow-600' };
    if (count < 50) return { text: 'Good results', color: 'text-blue-600' };
    return { text: 'Excellent results', color: 'text-green-600' };
  };

  const resultQuality = getResultQuality(totalResults);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Main Search Info */}
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">
                  {query ? (
                    <>
                      <span className="font-medium">{totalResults.toLocaleString()}</span> {activeTab} found for 
                      <span className="font-medium mx-1">&quot;{query}&quot;</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{totalResults.toLocaleString()}</span> total {activeTab}
                    </>
                  )}
                </span>
                
                {/* Search Performance & Quality */}
                <div className="flex items-center space-x-3 mt-1">
                  {searchTime && (
                    <span className="text-xs text-gray-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {searchTime}ms
                    </span>
                  )}
                  
                  <span className={`text-xs ${resultQuality.color}`}>
                    {resultQuality.text}
                  </span>
                  
                  {activeFilters > 0 && (
                    <Badge variant="secondary" className="text-xs h-5">
                      <Filter className="w-3 h-3 mr-1" />
                      {activeFilters} filters
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="flex items-center space-x-2">
              {totalResults > 0 && (
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRefresh}
                className="h-8 w-8 p-0"
                title="Refresh results"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
            
            {onExport && totalResults > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onExport}
                className="h-8 w-8 p-0"
                title="Export results"
              >
                <Download className="w-3 h-3" />
              </Button>
            )}
            
            <div className="flex items-center text-xs text-gray-500 ml-2">
              <Clock className="w-3 h-3 mr-1" />
              <span>Real-time</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 