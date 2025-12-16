'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Edit, 
  Shield, 
  MapPin, 
  Users, 
  ChevronDown, 
  ChevronUp,
  Plus
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  companyType: string;
  city?: string;
  state?: string;
  logoUrl?: string;
  verified: boolean;
}

interface Partnership {
  id: string;
  relationshipType: string;
  partner: Company;
  currentCompanyRole: 'agency' | 'advertiser';
}

interface EnhancedCompanyCardProps {
  company: Company & {
    _count: { 
      contacts: number;
      agencyPartnerships?: number;
      advertiserPartnerships?: number;
    };
    agencyPartnerships?: Partnership[];
    advertiserPartnerships?: Partnership[];
  };
  createdAt: string;
  onToggleVerification?: (companyId: string, verified: boolean) => void;
}

export function EnhancedCompanyCard({ 
  company, 
  createdAt, 
  onToggleVerification 
}: EnhancedCompanyCardProps) {
  const [showAllPartners, setShowAllPartners] = useState(false);
  
  // Combine all partnerships
  const allPartnerships = [
    ...(company.agencyPartnerships || []),
    ...(company.advertiserPartnerships || [])
  ];
  
  const totalPartners = (company._count.agencyPartnerships || 0) + (company._count.advertiserPartnerships || 0);
  const visiblePartners = showAllPartners ? allPartnerships : allPartnerships.slice(0, 3);
  const remainingCount = Math.max(0, totalPartners - 3);

  const formatCompanyType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPartnershipIcon = (partnership: Partnership) => {
    const role = partnership.currentCompanyRole;
    if (role === 'agency') return '🏢'; // Agency icon
    if (role === 'advertiser') return '📢'; // Advertiser icon
    return '🤝'; // Default partnership icon
  };

  const CompanyLogo = ({ company: comp, size = 'sm' }: { company: Company; size?: 'xs' | 'sm' | 'md' }) => {
    const sizeClasses = {
      xs: 'w-4 h-4',
      sm: 'w-6 h-6', 
      md: 'w-8 h-8'
    };
    
    if (comp.logoUrl) {
      return (
        <img
          src={comp.logoUrl}
          alt={`${comp.name} logo`}
          className={`${sizeClasses[size]} rounded object-cover border border-border`}
        />
      );
    }

    return <Building2 className={`${sizeClasses[size]} text-primary`} />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <CompanyLogo company={company} size="md" />
            <div>
              <CardTitle className="text-lg">{company.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatCompanyType(company.companyType)}
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <Badge variant={company.verified ? "default" : "secondary"}>
              {company.verified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Company Info */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{company.city}, {company.state}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{company._count.contacts} contacts</span>
            </div>
            <p>📅 Added {new Date(createdAt).toLocaleDateString()}</p>
          </div>

          {/* Partnerships Section */}
          {allPartnerships.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-foreground">Partners</h4>
                {totalPartners > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllPartners(!showAllPartners)}
                    className="text-xs"
                  >
                    {showAllPartners ? (
                      <>
                        <ChevronUp className="w-3 h-3 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3 mr-1" />
                        +{remainingCount} more
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                {visiblePartners.map((partnership) => (
                  <div key={partnership.id} className="flex items-center space-x-2 text-sm">
                    <span className="text-xs">{getPartnershipIcon(partnership)}</span>
                    <CompanyLogo company={partnership.partner} size="xs" />
                    <span className="text-foreground font-medium">{partnership.partner.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {partnership.partner.city}
                    </Badge>
                    {partnership.partner.verified && (
                      <Shield className="w-3 h-3 text-green-600" />
                    )}
                  </div>
                ))}
                
                {!showAllPartners && remainingCount > 0 && (
                  <div className="text-xs text-primary font-medium">
                    +{remainingCount} teams
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4 border-t">
            <Link href={`/admin/orgs/companies/${company.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            </Link>
            {onToggleVerification && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleVerification(company.id, company.verified)}
              >
                <Shield className="w-3 h-3 mr-1" />
                {company.verified ? 'Unverify' : 'Verify'}
              </Button>
            )}
            <Link href={`/admin/orgs/companies/${company.id}/edit?tab=partnerships`}>
              <Button variant="outline" size="sm">
                <Plus className="w-3 h-3 mr-1" />
                Add Partner
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}