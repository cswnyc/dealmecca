'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Shield,
  Calendar,
  MapPin,
  ChevronRight,
  ChevronDown,
  Users,
  Mail,
  Phone,
  Linkedin,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

interface Partner {
  id: string;
  name: string;
  logoUrl?: string;
  companyType?: string;
  industry?: string;
  verified: boolean;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  email?: string;
  phone?: string;
  verified?: boolean;
  seniority?: string;
  department?: string;
}

interface PartnershipCardProps {
  partnership: {
    id: string;
    relationshipType?: string;
    isAOR?: boolean;
    services?: string;
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;
    contractValue?: number;
    notes?: string;
    partner: Partner;
    partnerRole: 'agency' | 'advertiser';
  };
  companyName: string;
  defaultExpanded?: boolean;
}

export function PartnershipCard({
  partnership,
  companyName,
  defaultExpanded = false
}: PartnershipCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [teamMembers, setTeamMembers] = useState<Contact[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const { partner, partnerRole } = partnership;

  // Fetch team members when card is expanded
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!isExpanded || teamMembers.length > 0) return;

      setLoadingTeam(true);
      try {
        const response = await fetch(`/api/orgs/companies/${partner.id}/contacts?limit=5`);
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data.contacts || []);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoadingTeam(false);
      }
    };

    fetchTeamMembers();
  }, [isExpanded, partner.id, teamMembers.length]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRelationshipColor = (type?: string) => {
    const colors = {
      'AGENCY_CLIENT': 'bg-primary/10 text-primary border-primary/20',
      'MEDIA_PARTNERSHIP': 'bg-purple-100 text-purple-800 border-purple-200',
      'STRATEGIC_ALLIANCE': 'bg-green-100 text-green-800 border-green-200',
      'PREFERRED_VENDOR': 'bg-orange-100 text-orange-800 border-orange-200',
      'HOLDING_COMPANY_SUBSIDIARY': 'bg-accent/10 text-accent-foreground border-accent/20',
      'SISTER_AGENCY': 'bg-pink-100 text-pink-800 border-pink-200',
      'JOINT_VENTURE': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'SUBCONTRACTOR': 'bg-muted text-foreground border-border'
    };
    return colors[type as keyof typeof colors] || 'bg-muted text-foreground border-border';
  };

  const CompanyLogo = ({ logoUrl, name }: { logoUrl?: string; name: string }) => {
    if (logoUrl) {
      return (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="w-14 h-14 rounded-xl object-cover border border-border shadow-sm"
        />
      );
    }
    return (
      <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-sm">
        <Building2 className="w-7 h-7 text-white" />
      </div>
    );
  };

  const ContactAvatar = ({ contact }: { contact: Contact }) => {
    const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-muted-foreground to-foreground rounded-full flex items-center justify-center text-white font-semibold text-sm">
        {initials}
      </div>
    );
  };

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
        isExpanded ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-5">
        <div className="flex items-start space-x-4">
          {/* Company Logo */}
          <CompanyLogo logoUrl={partner.logoUrl} name={partner.name} />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1 flex-wrap">
                  <Link
                    href={`/companies/${partner.id}`}
                    className="font-semibold text-foreground hover:text-primary truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {partner.name}
                  </Link>
                  {partner.verified && (
                    <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                  )}
                  {partnership.isAOR && (
                    <Badge variant="secondary" className="text-xs">
                      AOR
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                  {partnership.relationshipType && (
                    <Badge
                      className={`text-xs ${getRelationshipColor(partnership.relationshipType)}`}
                    >
                      {partnership.relationshipType.replace(/_/g, ' ')}
                    </Badge>
                  )}

                  <Badge variant="outline" className="text-xs">
                    {partnerRole === 'agency' ? 'Agency Partner' : 'Client'}
                  </Badge>

                  {partnership.isActive !== undefined && (
                    <Badge
                      variant={partnership.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {partnership.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground flex-wrap gap-y-1">
                  {partner.companyType && (
                    <div className="flex items-center space-x-1">
                      <Briefcase className="w-3 h-3" />
                      <span>{partner.companyType.replace(/_/g, ' ')}</span>
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
                className="p-1 h-7 w-7 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t pt-4 mt-3 space-y-4">
                {/* Partnership Details */}
                {partnership.services && (
                  <div>
                    <h5 className="font-medium text-foreground mb-2 text-sm">Services</h5>
                    <p className="text-sm text-muted-foreground">{partnership.services}</p>
                  </div>
                )}

                {partnership.notes && (
                  <div>
                    <h5 className="font-medium text-foreground mb-2 text-sm">Notes</h5>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {partnership.notes}
                    </p>
                  </div>
                )}

                {/* Team Members */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-foreground text-sm flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Key Team Members
                    </h5>
                    {teamMembers.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {teamMembers.length} contacts
                      </Badge>
                    )}
                  </div>

                  {loadingTeam ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    </div>
                  ) : teamMembers.length > 0 ? (
                    <div className="space-y-2">
                      {teamMembers.map((contact) => (
                        <Link
                          key={contact.id}
                          href={`/people/${contact.id}`}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors border border-border group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ContactAvatar contact={contact} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-foreground group-hover:text-primary text-sm truncate">
                                {contact.fullName}
                              </h4>
                              {contact.verified && (
                                <Shield className="w-3 h-3 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{contact.title}</p>
                            {contact.department && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {contact.department.replace(/_/g, ' ')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            {contact.email && (
                              <Mail className="w-3 h-3 text-muted-foreground" />
                            )}
                            {contact.phone && (
                              <Phone className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={`/companies/${partner.id}?tab=team`}
                        className="block text-center py-2 text-sm text-primary hover:text-primary/80 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View all team members →
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-border rounded-lg">
                      <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No team members listed yet</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <Link
                    href={`/companies/${partner.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="outline" size="sm" className="text-xs">
                      <Building2 className="w-3 h-3 mr-1" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
