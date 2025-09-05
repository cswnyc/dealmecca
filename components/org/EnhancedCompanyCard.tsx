'use client';

import { useState } from 'react';
import { 
  Building2, 
  Users, 
  MapPin, 
  Sparkles, 
  TrendingUp,
  Mail,
  Phone,
  ExternalLink,
  Star,
  Crown,
  Target,
  Calendar,
  DollarSign,
  Eye,
  Share,
  Follow,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Zap,
  Heart,
  MessageCircle,
  FileText,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

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
  relationshipStrength?: number; // 0-100
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
  
  // Compatibility with existing interface
  _count?: {
    contacts: number;
  };
}

interface EnhancedCompanyCardProps {
  company: EnhancedCompany;
  variant?: 'companies' | 'agencies' | 'advertisers' | 'prospects';
  onFollow?: (companyId: string) => void;
  onFavorite?: (companyId: string) => void;
  onShare?: (company: EnhancedCompany) => void;
  showIntelligence?: boolean;
}

export function EnhancedCompanyCard({ 
  company, 
  variant = 'companies',
  onFollow,
  onFavorite,
  onShare,
  showIntelligence = true
}: EnhancedCompanyCardProps) {
  const [isFollowing, setIsFollowing] = useState(company.isFollowing || false);
  const [isFavorite, setIsFavorite] = useState(company.isFavorite || false);

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'enterprise': return 'from-purple-500 to-blue-600';
      case 'growth': return 'from-green-500 to-teal-600';  
      case 'startup': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDealPotentialColor = (potential?: string) => {
    switch (potential) {
      case 'HIGH': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFinancialHealthColor = (health?: string) => {
    switch (health) {
      case 'STRONG': return 'text-green-600';
      case 'STABLE': return 'text-blue-600';
      case 'CONCERNING': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDisplayLocation = (company: EnhancedCompany) => {
    if (company.location) return company.location;
    if (company.city && company.state) return `${company.city}, ${company.state}`;
    if (company.city) return company.city;
    return 'Location not specified';
  };

  const getTeamCount = (company: EnhancedCompany) => {
    return company.teamCount || company._count?.contacts || 0;
  };

  const getTierFromType = (company: EnhancedCompany): 'enterprise' | 'growth' | 'startup' => {
    if (company.tier) return company.tier;
    const teamCount = getTeamCount(company);
    if (teamCount > 500) return 'enterprise';
    if (teamCount > 50) return 'growth';
    return 'startup';
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollow?.(company.id);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    onFavorite?.(company.id);
  };

  const tier = getTierFromType(company);
  const teamCount = getTeamCount(company);
  const location = getDisplayLocation(company);
  const relationshipStrength = company.relationshipStrength || 0;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 overflow-hidden">
      {/* Tier Indicator Bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${getTierColor(tier)}`} />
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg">
              <AvatarImage src={company.logoUrl} alt={company.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {company.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {company.name}
                </h3>
                {company.verified && (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
                {company.tier === 'enterprise' && (
                  <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-1 ml-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFavorite}
              className={`p-2 ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button size="sm" variant="ghost" className="p-2">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Deal Intelligence (if enabled) */}
        {showIntelligence && company.dealPotential && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Deal Potential</span>
              </div>
              <Badge className={getDealPotentialColor(company.dealPotential)}>
                {company.dealPotential}
              </Badge>
            </div>
            {company.budgetRange && (
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="w-3 h-3 mr-1" />
                <span>Budget: {company.budgetRange}</span>
              </div>
            )}
          </div>
        )}

        {/* Company Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1 text-blue-500" />
            <span className="font-medium">{teamCount}</span>
            <span className="ml-1">contacts</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {company.industry || company.companyType || variant}
          </Badge>
        </div>

        {/* Relationship Strength */}
        {showIntelligence && relationshipStrength > 0 && (
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Relationship Strength</span>
              <span className="font-medium text-gray-800">{relationshipStrength}%</span>
            </div>
            <Progress value={relationshipStrength} className="h-2" />
          </div>
        )}

        {/* Key Contacts Summary */}
        {showIntelligence && company.keyContacts && (
          <div className="flex items-center justify-between text-xs bg-gray-50 rounded p-2">
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <div className="font-semibold text-purple-600">{company.keyContacts.decisionMakers}</div>
                <div className="text-gray-500">Decision</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{company.keyContacts.influencers}</div>
                <div className="text-gray-500">Influence</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{company.keyContacts.champions}</div>
                <div className="text-gray-500">Champions</div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Health & Growth */}
        {showIntelligence && (company.financialHealth || company.growthTrend) && (
          <div className="flex items-center justify-between text-xs">
            {company.financialHealth && (
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  company.financialHealth === 'STRONG' ? 'bg-green-500' : 
                  company.financialHealth === 'STABLE' ? 'bg-blue-500' : 'bg-red-500'
                }`} />
                <span className={getFinancialHealthColor(company.financialHealth)}>
                  {company.financialHealth}
                </span>
              </div>
            )}
            {company.growthTrend && (
              <div className="flex items-center space-x-1">
                <TrendingUp className={`w-3 h-3 ${
                  company.growthTrend === 'GROWING' ? 'text-green-500' : 
                  company.growthTrend === 'STABLE' ? 'text-blue-500' : 'text-red-500'
                }`} />
                <span className="text-gray-600">{company.growthTrend}</span>
              </div>
            )}
          </div>
        )}

        {/* Recent Activity */}
        {company.lastEngagement && (
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1 text-green-500" />
            Last contact: {company.lastEngagement}
          </div>
        )}

        {/* Social Proof */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            {company.views && (
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{company.views}</span>
              </div>
            )}
            {company.followedBy && (
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{company.followedBy}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onShare?.(company)}
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
            >
              <Share className="w-3 h-3" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            asChild
          >
            <Link href={`/orgs/companies/${company.id}`}>
              <Building2 className="w-3 h-3 mr-1" />
              View Details
            </Link>
          </Button>
          <Button 
            size="sm" 
            variant={isFollowing ? "default" : "outline"}
            onClick={handleFollow}
            className="px-3"
          >
            <Follow className="w-3 h-3" />
          </Button>
          {company.website && (
            <Button size="sm" variant="outline" className="px-3" asChild>
              <a href={company.website} target="_blank" rel="noopener noreferrer">
                <Globe className="w-3 h-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}