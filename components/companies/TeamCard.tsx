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
  logoUrl?: string | null;
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
      TeamDuty?: number;
    };
  };
  defaultExpanded?: boolean;
}

export function TeamCard({
  team,
  defaultExpanded = false
}: TeamCardProps) {
  const [showAllPeople, setShowAllPeople] = useState(false);
  const [showAllDuties, setShowAllDuties] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Contact[]>([]);
  const [teamDuties, setTeamDuties] = useState<Duty[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingDuties, setLoadingDuties] = useState(false);

  // Determine which company to display based on perspective
  const isClientTeam = team.type === 'ADVERTISER_TEAM' && team.clientCompany;
  const isAgencyTeam = team.type === 'ADVERTISER_TEAM' && team.agencyCompany;
  const displayCompany = team.clientCompany || team.agencyCompany;

  // Fetch team members and duties on mount
  useEffect(() => {
    const fetchTeamData = async () => {
      // Fetch team members
      if (team._count.ContactTeam > 0) {
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
    };

    fetchTeamData();
  }, [team.id, team._count.ContactTeam]);

  const CompanyLogo = ({ logoUrl, name, size = 'md' }: { logoUrl?: string | null; name: string; size?: 'sm' | 'md' }) => {
    const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-12 h-12';
    const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

    if (logoUrl) {
      return (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className={`${sizeClasses} rounded-lg object-cover border border-border`}
        />
      );
    }
    return (
      <div className={`${sizeClasses} bg-gradient-to-br from-muted-foreground to-foreground rounded-lg flex items-center justify-center`}>
        <Building2 className={`${iconSize} text-white`} />
      </div>
    );
  };

  const ContactAvatar = ({ contact, size = 'sm' }: { contact: Contact; size?: 'sm' | 'md' }) => {
    const sizeClasses = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';

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

    if (contact.logoUrl) {
      return (
        <img
          src={contact.logoUrl}
          alt={contact.fullName}
          className={`${sizeClasses} rounded-full object-cover`}
        />
      );
    }

    return (
      <div className={`${sizeClasses} bg-gradient-to-br from-muted-foreground to-foreground rounded-full flex items-center justify-center text-white font-medium`}>
        {getInitials()}
      </div>
    );
  };

  // Calculate visible contacts (show 5 by default)
  const visibleContactCount = 5;
  const visibleContacts = showAllPeople ? teamMembers : teamMembers.slice(0, visibleContactCount);
  const hiddenContactCount = teamMembers.length - visibleContactCount;

  // Calculate visible duties (show 5 by default)
  const visibleDutyCount = 5;
  const visibleDuties = showAllDuties ? teamDuties : teamDuties.slice(0, visibleDutyCount);
  const hiddenDutyCount = teamDuties.length - visibleDutyCount;

  return (
    <Card className="row-hover-accent hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Company/Team Logo */}
          {displayCompany ? (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(37, 117, 252, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
              <CompanyLogo logoUrl={displayCompany.logoUrl} name={displayCompany.name} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(37, 117, 252, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
              <Building2 className="w-5 h-5 text-[#2575FC] dark:text-[#5B8DFF]" />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Team Name with Active Indicator */}
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={displayCompany ? `/companies/${displayCompany.id}` : '#'}
                className="font-semibold text-foreground hover:text-primary"
              >
                {displayCompany?.name || team.name}
              </Link>
              {team.isActive && (
                <span className="w-2 h-2 bg-green-500 rounded-full" title="Active" />
              )}
              {displayCompany?.verified && (
                <Shield className="w-4 h-4 text-green-600" />
              )}
            </div>

            {/* Team Members Inline */}
            {loadingMembers ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : teamMembers.length > 0 ? (
              <div className="flex flex-wrap items-center gap-x-1 gap-y-1 mb-2 text-sm">
                {visibleContacts.map((contact, index) => (
                  <span key={contact.id} className="inline-flex items-center">
                    <ContactAvatar contact={contact} size="sm" />
                    <Link
                      href={`/people/${contact.id}`}
                      className="ml-1 text-foreground hover:text-primary"
                    >
                      {contact.fullName}
                    </Link>
                    {index < visibleContacts.length - 1 && <span className="text-muted-foreground">,</span>}
                  </span>
                ))}
                {hiddenContactCount > 0 && !showAllPeople && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllPeople(true);
                    }}
                    className="text-primary hover:text-primary/80 font-medium ml-1"
                  >
                    +{hiddenContactCount} {hiddenContactCount === 1 ? 'person' : 'people'}
                  </button>
                )}
                {showAllPeople && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllPeople(false);
                    }}
                    className="text-primary hover:text-primary/80 font-medium ml-1"
                  >
                    Hide people
                  </button>
                )}
              </div>
            ) : null}

            {/* Handles/Duties Inline */}
            {loadingDuties ? (
              <p className="text-sm text-muted-foreground">Loading duties...</p>
            ) : teamDuties.length > 0 && (
              <div className="text-sm text-muted-foreground mb-2">
                <span className="font-medium">Handles:</span>{' '}
                {visibleDuties.map((duty, index) => (
                  <span key={duty.id}>
                    {duty.name}
                    {index < visibleDuties.length - 1 && ', '}
                  </span>
                ))}
                {hiddenDutyCount > 0 && !showAllDuties && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllDuties(true);
                    }}
                    className="text-primary hover:text-primary/80 font-medium ml-1"
                  >
                    +{hiddenDutyCount} {hiddenDutyCount === 1 ? 'duty' : 'duties'}
                  </button>
                )}
                {showAllDuties && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllDuties(false);
                    }}
                    className="text-primary hover:text-primary/80 font-medium ml-1"
                  >
                    Show less
                  </button>
                )}
              </div>
            )}

            {/* Last Activity */}
            <p className="text-xs text-muted-foreground">Last activity: 3 days</p>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 text-[#9AA7C2]">
            <button className="p-2 hover:text-[#2575FC] dark:hover:text-[#5B8DFF] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button className="p-2 hover:text-[#2575FC] dark:hover:text-[#5B8DFF] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button className="p-2 hover:text-[#2575FC] dark:hover:text-[#5B8DFF] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
