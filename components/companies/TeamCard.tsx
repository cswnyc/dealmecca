'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Shield,
  ChevronRight,
  ChevronDown,
  Users,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

interface ClientCompany {
  id: string;
  name: string;
  logoUrl?: string | null;
  companyType?: string;
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

interface Duty {
  id: string;
  name: string;
  category: string;
}

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    type: string;
    description?: string | null;
    isActive: boolean;
    clientCompany?: ClientCompany | null;
    agencyCompany?: ClientCompany | null;
    _count: {
      ContactTeam: number;
      PartnershipTeam: number;
    };
  };
  defaultExpanded?: boolean;
}

export function TeamCard({
  team,
  defaultExpanded = false
}: TeamCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [teamMembers, setTeamMembers] = useState<Contact[]>([]);
  const [teamDuties, setTeamDuties] = useState<Duty[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingDuties, setLoadingDuties] = useState(false);

  // Determine which company to display based on perspective
  // If this team has a clientCompany, we're viewing from agency perspective (show client)
  // If this team has an agencyCompany, we're viewing from advertiser perspective (show agency)
  const isClientTeam = team.type === 'ADVERTISER_TEAM' && team.clientCompany;
  const isAgencyTeam = team.type === 'ADVERTISER_TEAM' && team.agencyCompany;
  const displayCompany = team.clientCompany || team.agencyCompany;

  // Fetch team members and duties when card is expanded
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!isExpanded) return;
      if (teamMembers.length > 0 && teamDuties.length > 0) return;

      // Fetch team members
      if (teamMembers.length === 0 && team._count.ContactTeam > 0) {
        setLoadingMembers(true);
        try {
          const response = await fetch(`/api/orgs/teams/${team.id}/contacts`);
          if (response.ok) {
            const data = await response.json();
            setTeamMembers(data || []);
          }
        } catch (error) {
          console.error('Error fetching team members:', error);
        } finally {
          setLoadingMembers(false);
        }
      }

      // Fetch team duties
      if (teamDuties.length === 0) {
        setLoadingDuties(true);
        try {
          const response = await fetch(`/api/orgs/teams/${team.id}/duties`);
          if (response.ok) {
            const data = await response.json();
            setTeamDuties(data || []);
          }
        } catch (error) {
          console.error('Error fetching team duties:', error);
        } finally {
          setLoadingDuties(false);
        }
      }
    };

    fetchTeamData();
  }, [isExpanded, team.id, team._count.ContactTeam, teamMembers.length, teamDuties.length]);

  const getTeamTypeColor = (type: string) => {
    const colors = {
      'AGENCY_TEAM': 'bg-blue-100 text-blue-800 border-blue-200',
      'ADVERTISER_TEAM': 'bg-purple-100 text-purple-800 border-purple-200',
      'INTERNAL_TEAM': 'bg-green-100 text-green-800 border-green-200',
      'PROJECT_TEAM': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const CompanyLogo = ({ logoUrl, name }: { logoUrl?: string | null; name: string }) => {
    if (logoUrl) {
      return (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-sm"
        />
      );
    }
    return (
      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
        <Building2 className="w-7 h-7 text-white" />
      </div>
    );
  };

  const ContactAvatar = ({ contact }: { contact: Contact }) => {
    const getInitials = () => {
      const firstName = contact.firstName || '';
      const lastName = contact.lastName || '';
      if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
      } else if (firstName) {
        return firstName.substring(0, 2).toUpperCase();
      } else if (lastName) {
        return lastName.substring(0, 2).toUpperCase();
      }
      return '??';
    };

    return (
      <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
        {getInitials()}
      </div>
    );
  };

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
        isExpanded ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-5">
        <div className="flex items-start space-x-4">
          {/* Company Logo (for client/agency teams) or Team Icon */}
          {(isClientTeam || isAgencyTeam) && displayCompany ? (
            <CompanyLogo logoUrl={displayCompany.logoUrl} name={displayCompany.name} />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Users className="w-7 h-7 text-white" />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1 flex-wrap">
                  {(isClientTeam || isAgencyTeam) && displayCompany ? (
                    <Link
                      href={`/companies/${displayCompany.id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {displayCompany.name}
                    </Link>
                  ) : (
                    <h3 className="font-semibold text-gray-900 truncate">
                      {team.name}
                    </h3>
                  )}
                  {(isClientTeam || isAgencyTeam) && displayCompany?.verified && (
                    <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                  <Badge
                    className={`text-xs ${getTeamTypeColor(team.type)}`}
                  >
                    {team.type.replace(/_/g, ' ')}
                  </Badge>

                  {isClientTeam && (
                    <Badge variant="outline" className="text-xs">
                      Agency Client
                    </Badge>
                  )}

                  {isAgencyTeam && (
                    <Badge variant="outline" className="text-xs">
                      Partner Agency
                    </Badge>
                  )}

                  {!team.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {team.description && !isExpanded && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {team.description}
                  </p>
                )}

                {/* Team Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{team._count.ContactTeam} {team._count.ContactTeam === 1 ? 'member' : 'members'}</span>
                  </div>
                  {teamDuties.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{teamDuties.length} {teamDuties.length === 1 ? 'duty' : 'duties'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Expand/Collapse Icon */}
              <div className="flex-shrink-0 ml-2">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {/* Full Description */}
                {team.description && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">About</h4>
                    <p className="text-sm text-gray-600">
                      {team.description}
                    </p>
                  </div>
                )}

                {/* Team Duties/Handles */}
                {loadingDuties ? (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Loading duties...</p>
                  </div>
                ) : teamDuties.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Handles</h4>
                    <div className="flex flex-wrap gap-2">
                      {teamDuties.map((duty) => (
                        <Badge key={duty.id} variant="outline" className="text-xs">
                          {duty.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Members */}
                {loadingMembers ? (
                  <div>
                    <p className="text-sm text-gray-500">Loading team members...</p>
                  </div>
                ) : teamMembers.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Team Members</h4>
                    <div className="space-y-3">
                      {teamMembers.map((contact) => (
                        <div key={contact.id} className="flex items-start space-x-3">
                          <ContactAvatar contact={contact} />
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/people/${contact.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {contact.fullName}
                              {contact.verified && (
                                <Shield className="w-3 h-3 text-green-600 inline-block ml-1" />
                              )}
                            </Link>
                            <p className="text-xs text-gray-600">{contact.title}</p>
                            {contact.department && (
                              <p className="text-xs text-gray-500">{contact.department}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : team._count.ContactTeam === 0 ? (
                  <div className="text-sm text-gray-500">
                    No team members yet
                  </div>
                ) : null}

                {/* View Profile Button for Client/Agency Teams */}
                {(isClientTeam || isAgencyTeam) && displayCompany && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      href={`/companies/${displayCompany.id}`}
                      className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>View {displayCompany.name} Profile</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
