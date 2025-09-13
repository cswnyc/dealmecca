'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Shield, 
  DollarSign, 
  Calendar,
  MapPin,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Mail,
  Phone,
  Users,
  TrendingUp,
  Clock,
  Target,
  Award
} from 'lucide-react';
import Link from 'next/link';

interface Partner {
  id: string;
  name: string;
  logoUrl?: string;
  verified: boolean;
  companyType: string;
  city?: string;
  state?: string;
}

interface Partnership {
  id: string;
  relationshipType: string;
  isActive: boolean;
  contractValue?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  currentCompanyRole: 'agency' | 'advertiser';
  partner: Partner;
}

interface EnhancedPartnershipCardsProps {
  partnerships: Partnership[];
  companyName: string;
  companyType: string;
  className?: string;
  maxVisible?: number;
  showExpandButton?: boolean;
}

export function EnhancedPartnershipCards({ 
  partnerships, 
  companyName,
  companyType,
  className = '',
  maxVisible = 3,
  showExpandButton = true
}: EnhancedPartnershipCardsProps) {
  const [showAll, setShowAll] = useState(false);
  const [selectedPartnership, setSelectedPartnership] = useState<string | null>(null);

  if (partnerships.length === 0) {
    return (
      <Card className={`border-dashed ${className}`}>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Partnerships Yet</h3>
          <p className="text-gray-500 mb-4">
            Start building {companyName}'s partnership network
          </p>
          <Button variant="outline">
            <Target className="w-4 h-4 mr-2" />
            Suggest Partners
          </Button>
        </CardContent>
      </Card>
    );
  }

  const visiblePartnerships = showAll ? partnerships : partnerships.slice(0, maxVisible);
  const remainingCount = partnerships.length - maxVisible;

  const formatCurrency = (value?: number) => {
    if (!value) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRelationshipColor = (type: string) => {
    const colors = {
      'AGENCY_CLIENT': 'bg-blue-100 text-blue-800 border-blue-200',
      'MEDIA_PARTNERSHIP': 'bg-purple-100 text-purple-800 border-purple-200',
      'STRATEGIC_ALLIANCE': 'bg-green-100 text-green-800 border-green-200',
      'PREFERRED_VENDOR': 'bg-orange-100 text-orange-800 border-orange-200',
      'HOLDING_COMPANY_SUBSIDIARY': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'SISTER_AGENCY': 'bg-pink-100 text-pink-800 border-pink-200',
      'JOINT_VENTURE': 'bg-teal-100 text-teal-800 border-teal-200',
      'SUBCONTRACTOR': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type as keyof typeof colors] || colors['SUBCONTRACTOR'];
  };

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'AGENCY_CLIENT': return <Target className="w-3 h-3" />;
      case 'MEDIA_PARTNERSHIP': return <TrendingUp className="w-3 h-3" />;
      case 'STRATEGIC_ALLIANCE': return <Award className="w-3 h-3" />;
      case 'PREFERRED_VENDOR': return <Shield className="w-3 h-3" />;
      case 'HOLDING_COMPANY_SUBSIDIARY': return <Building2 className="w-3 h-3" />;
      case 'SISTER_AGENCY': return <Users className="w-3 h-3" />;
      case 'JOINT_VENTURE': return <Award className="w-3 h-3" />;
      case 'SUBCONTRACTOR': return <Clock className="w-3 h-3" />;
      default: return <Target className="w-3 h-3" />;
    }
  };

  const CompanyLogo = ({ partner }: { partner: Partner }) => {
    if (partner.logoUrl) {
      return (
        <img 
          src={partner.logoUrl} 
          alt={`${partner.name} logo`}
          className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm"
        />
      );
    }
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
        <Building2 className="w-6 h-6 text-white" />
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Partnership Portfolio
        </h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {partnerships.length} {partnerships.length === 1 ? 'Partner' : 'Partners'}
        </Badge>
      </div>

      {/* Partnership Cards */}
      <div className="space-y-3">
        {visiblePartnerships.map((partnership, index) => {
          const isExpanded = selectedPartnership === partnership.id;
          const partner = partnership.partner;
          
          return (
            <Card 
              key={partnership.id}
              className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                isExpanded ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedPartnership(isExpanded ? null : partnership.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Company Logo */}
                  <CompanyLogo partner={partner} />
                  
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {partner.name}
                          </h4>
                          {partner.verified && (
                            <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                          <Badge 
                            variant={partnership.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {partnership.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge 
                            className={`text-xs flex items-center space-x-1 ${getRelationshipColor(partnership.relationshipType)}`}
                          >
                            {getRelationshipIcon(partnership.relationshipType)}
                            <span>{partnership.relationshipType.replace(/_/g, ' ')}</span>
                          </Badge>
                          
                          <Badge variant="outline" className="text-xs">
                            {partner.companyType.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {partner.city && partner.state && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{partner.city}, {partner.state}</span>
                            </div>
                          )}
                          
                          {partnership.contractValue && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{formatCurrency(partnership.contractValue)}</span>
                            </div>
                          )}
                          
                          {partnership.startDate && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Since {formatDate(partnership.startDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expand Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </Button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t pt-3 mt-3 space-y-3">
                        {/* Partnership Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Partnership Details</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Role:</span>
                                <Badge variant="outline" className="text-xs">
                                  {partnership.currentCompanyRole === 'agency' ? 'We are the Agency' : 'We are the Advertiser'}
                                </Badge>
                              </div>
                              
                              {partnership.startDate && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Start Date:</span>
                                  <span>{formatDate(partnership.startDate)}</span>
                                </div>
                              )}
                              
                              {partnership.endDate && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">End Date:</span>
                                  <span>{formatDate(partnership.endDate)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Company Info</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Type:</span>
                                <span>{partner.companyType.replace(/_/g, ' ')}</span>
                              </div>
                              
                              {partner.city && partner.state && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Location:</span>
                                  <span>{partner.city}, {partner.state}</span>
                                </div>
                              )}
                              
                              <div className="flex justify-between">
                                <span className="text-gray-600">Verified:</span>
                                <span className="flex items-center space-x-1">
                                  {partner.verified ? (
                                    <>
                                      <Shield className="w-3 h-3 text-green-600" />
                                      <span className="text-green-600">Yes</span>
                                    </>
                                  ) : (
                                    <span className="text-gray-500">No</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {partnership.notes && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {partnership.notes}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 pt-2">
                          <Link href={`/orgs/companies/${partner.id}`}>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Profile
                            </Button>
                          </Link>
                          
                          <Button variant="outline" size="sm">
                            <Mail className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                          
                          <Button variant="outline" size="sm">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Analytics
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Expand/Collapse Button */}
        {showExpandButton && remainingCount > 0 && (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full h-auto p-4 justify-center hover:bg-blue-50"
                onClick={() => setShowAll(!showAll)}
              >
                <div className="flex items-center space-x-2">
                  {showAll ? (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Show Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      <span>Show {remainingCount} More {remainingCount === 1 ? 'Partner' : 'Partners'}</span>
                    </>
                  )}
                </div>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Partnership Summary */}
      {partnerships.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-blue-900">
                  {partnerships.filter(p => p.isActive).length}
                </div>
                <div className="text-xs text-blue-600">Active Partnerships</div>
              </div>
              
              <div>
                <div className="text-xl font-bold text-green-900">
                  {formatCurrency(partnerships.reduce((sum, p) => sum + (p.contractValue || 0), 0)) || '—'}
                </div>
                <div className="text-xs text-green-600">Total Value</div>
              </div>
              
              <div>
                <div className="text-xl font-bold text-purple-900">
                  {partnerships.filter(p => p.currentCompanyRole === 'agency').length}
                </div>
                <div className="text-xs text-purple-600">Agency Relationships</div>
              </div>
              
              <div>
                <div className="text-xl font-bold text-orange-900">
                  {partnerships.filter(p => p.currentCompanyRole === 'advertiser').length}
                </div>
                <div className="text-xs text-orange-600">Advertiser Relationships</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}