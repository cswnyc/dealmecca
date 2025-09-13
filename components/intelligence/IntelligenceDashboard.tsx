'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp,
  Target,
  Users,
  Calendar,
  Award,
  AlertCircle,
  ExternalLink,
  Clock,
  BarChart3,
  Globe,
  Briefcase,
  Zap,
  Building2,
  Shield
} from 'lucide-react';
import Link from 'next/link';

interface CompetitiveIntel {
  id: string;
  type: 'partnership_win' | 'partnership_loss' | 'team_change' | 'market_move' | 'industry_news';
  title: string;
  description: string;
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  impact: 'low' | 'medium' | 'high';
  timestamp: string;
  source?: string;
  tags: string[];
}

interface MarketInsight {
  id: string;
  category: 'holding_company' | 'industry' | 'competitive' | 'opportunity';
  title: string;
  description: string;
  metric?: {
    value: string;
    change?: number;
    timeframe?: string;
  };
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface IntelligenceDashboardProps {
  companyId: string;
  companyName: string;
  companyType: string;
  className?: string;
}

export function IntelligenceDashboard({ 
  companyId, 
  companyName, 
  companyType,
  className = '' 
}: IntelligenceDashboardProps) {
  const [competitiveIntel, setCompetitiveIntel] = useState<CompetitiveIntel[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high_impact' | 'recent'>('all');

  useEffect(() => {
    // Generate mock intelligence data for now
    // In production, this would fetch real data from APIs and external sources
    generateMockIntelligence();
  }, [companyId]);

  const generateMockIntelligence = () => {
    // Mock competitive intelligence data
    const mockCompetitiveIntel: CompetitiveIntel[] = [
      {
        id: '1',
        type: 'partnership_win',
        title: 'Major Automotive Account Win',
        description: 'Rival agency secured Ford\'s $50M media planning account after 3-way pitch',
        company: {
          id: 'comp1',
          name: 'Publicis Media',
          logoUrl: undefined
        },
        impact: 'high',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'AdAge',
        tags: ['automotive', 'media planning', 'competitive threat']
      },
      {
        id: '2',
        type: 'team_change',
        title: 'Key Executive Departure',
        description: 'GroupM\'s Chief Strategy Officer announced move to independent agency',
        company: {
          id: 'comp2',
          name: 'GroupM',
          logoUrl: undefined
        },
        impact: 'medium',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Campaign',
        tags: ['talent acquisition', 'leadership change', 'opportunity']
      },
      {
        id: '3',
        type: 'market_move',
        title: 'New Data Partnership Announced',
        description: 'Omnicom partners with Amazon DSP for enhanced programmatic capabilities',
        company: {
          id: 'comp3',
          name: 'Omnicom',
          logoUrl: undefined
        },
        impact: 'medium',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Digiday',
        tags: ['programmatic', 'data partnership', 'technology']
      },
      {
        id: '4',
        type: 'industry_news',
        title: 'Cookieless Future Acceleration',
        description: 'Chrome delays third-party cookie phase-out to Q4 2024, creating opportunity window',
        impact: 'high',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Marketing Land',
        tags: ['privacy', 'cookies', 'opportunity', 'technology']
      }
    ];

    // Mock market insights
    const mockMarketInsights: MarketInsight[] = [
      {
        id: '1',
        category: 'opportunity',
        title: 'Underserved Retail Vertical',
        description: 'Analysis shows 40% growth in retail media spend with limited agency competition in mid-market segment',
        metric: {
          value: '40%',
          change: 15,
          timeframe: 'YoY Growth'
        },
        actionable: true,
        priority: 'high'
      },
      {
        id: '2',
        category: 'competitive',
        title: 'Market Share Analysis',
        description: 'Your holding company network has opportunity to capture 15% more programmatic spend',
        metric: {
          value: '$2.3M',
          change: 23,
          timeframe: 'Potential Revenue'
        },
        actionable: true,
        priority: 'high'
      },
      {
        id: '3',
        category: 'industry',
        title: 'CTV Investment Trend',
        description: 'Connected TV ad spending expected to reach $25B by 2024, up 39% from previous year',
        metric: {
          value: '$25B',
          change: 39,
          timeframe: '2024 Projection'
        },
        actionable: false,
        priority: 'medium'
      },
      {
        id: '4',
        category: 'holding_company',
        title: 'Cross-Selling Opportunity',
        description: 'Sister agencies have 12 shared clients with expansion potential for integrated campaigns',
        metric: {
          value: '12',
          change: 0,
          timeframe: 'Shared Clients'
        },
        actionable: true,
        priority: 'medium'
      }
    ];

    setCompetitiveIntel(mockCompetitiveIntel);
    setMarketInsights(mockMarketInsights);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIntelIcon = (type: string) => {
    switch (type) {
      case 'partnership_win': return <Award className="w-4 h-4" />;
      case 'partnership_loss': return <AlertCircle className="w-4 h-4" />;
      case 'team_change': return <Users className="w-4 h-4" />;
      case 'market_move': return <TrendingUp className="w-4 h-4" />;
      case 'industry_news': return <Globe className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'opportunity': return <Target className="w-4 h-4" />;
      case 'competitive': return <BarChart3 className="w-4 h-4" />;
      case 'industry': return <Globe className="w-4 h-4" />;
      case 'holding_company': return <Building2 className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const filteredIntel = competitiveIntel.filter(intel => {
    switch (activeFilter) {
      case 'high_impact': return intel.impact === 'high';
      case 'recent': return new Date(intel.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      default: return true;
    }
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-purple-900">
                <Zap className="w-6 h-6 mr-3" />
                Market Intelligence
              </CardTitle>
              <p className="text-purple-700 mt-1">
                Real-time competitive insights and market opportunities for {companyName}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
              >
                All
              </Button>
              <Button
                variant={activeFilter === 'high_impact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('high_impact')}
              >
                High Impact
              </Button>
              <Button
                variant={activeFilter === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('recent')}
              >
                Recent
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitive Intelligence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-red-600" />
              Competitive Intelligence
            </CardTitle>
            <p className="text-sm text-gray-600">
              Market moves, wins/losses, and competitive threats
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIntel.length > 0 ? (
                filteredIntel.map(intel => (
                  <div key={intel.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getImpactColor(intel.impact)}`}>
                        {getIntelIcon(intel.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 truncate">
                            {intel.title}
                          </h4>
                          <Badge className={`text-xs ${getImpactColor(intel.impact)}`}>
                            {intel.impact.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {intel.description}
                        </p>
                        
                        {intel.company && (
                          <div className="flex items-center space-x-2 mb-2">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {intel.company.name}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(intel.timestamp)}</span>
                            {intel.source && (
                              <>
                                <span>•</span>
                                <span>{intel.source}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex space-x-1">
                            {intel.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No intelligence data matches your current filter</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Market Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Market Insights
            </CardTitle>
            <p className="text-sm text-gray-600">
              Opportunities and strategic recommendations
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketInsights.map(insight => (
                <div key={insight.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(insight.priority)}`}>
                      {getCategoryIcon(insight.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <div className="flex items-center space-x-2">
                          {insight.actionable && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Actionable
                            </Badge>
                          )}
                          <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                            {insight.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {insight.description}
                      </p>
                      
                      {insight.metric && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-gray-900">
                                {insight.metric.value}
                              </div>
                              <div className="text-xs text-gray-500">
                                {insight.metric.timeframe}
                              </div>
                            </div>
                            {insight.metric.change !== undefined && (
                              <div className={`flex items-center space-x-1 ${
                                insight.metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {insight.metric.change >= 0 ? '+' : ''}{insight.metric.change}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {insight.actionable && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="w-full">
                            <Target className="w-3 h-3 mr-1" />
                            Take Action
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2 text-green-600" />
            Intelligence Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm font-medium">Industry News</div>
              <Badge variant="outline" className="text-xs">Live</Badge>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-sm font-medium">Team Changes</div>
              <Badge variant="outline" className="text-xs">Daily</Badge>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm font-medium">Market Data</div>
              <Badge variant="outline" className="text-xs">Weekly</Badge>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-sm font-medium">Win/Loss</div>
              <Badge variant="outline" className="text-xs">Real-time</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}