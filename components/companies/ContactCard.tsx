'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Building2, Linkedin } from 'lucide-react';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
  clientCompany?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
  company?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
}

interface ContactTeam {
  id: string;
  team: Team;
  isPrimary: boolean;
}

interface Duty {
  id: string;
  name: string;
  category: string;
}

interface ContactCardProps {
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    title?: string | null;
    email?: string | null;
    verified: boolean;
    seniority?: string | null;
    linkedinUrl?: string | null;
    logoUrl?: string | null;
    updatedAt?: string;
    company?: {
      id: string;
      name: string;
    } | null;
  };
}

export function ContactCard({ contact }: ContactCardProps) {
  const [teams, setTeams] = useState<ContactTeam[]>([]);
  const [duties, setDuties] = useState<Duty[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingDuties, setLoadingDuties] = useState(false);
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [showAllDuties, setShowAllDuties] = useState(false);

  // Fetch contact's teams on mount
  useEffect(() => {
    const fetchTeams = async () => {
      setLoadingTeams(true);
      try {
        const response = await fetch(`/api/orgs/contacts/${contact.id}/teams`);
        if (response.ok) {
          const data = await response.json();
          setTeams(data || []);
        }
      } catch (error) {
        console.error('Error fetching contact teams:', error);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [contact.id]);

  // Fetch contact's duties directly
  useEffect(() => {
    const fetchDuties = async () => {
      setLoadingDuties(true);
      try {
        const response = await fetch(`/api/orgs/contacts/${contact.id}/duties`);
        if (response.ok) {
          const data = await response.json();
          setDuties(data || []);
        }
      } catch (error) {
        console.error('Error fetching contact duties:', error);
      } finally {
        setLoadingDuties(false);
      }
    };

    fetchDuties();
  }, [contact.id]);

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

  const formatLastActivity = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    const now = new Date();
    const updated = new Date(dateStr);
    const diffMs = now.getTime() - updated.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
    if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'}`;
  };

  // Get teams with client companies (for display with logos)
  const teamsWithClients = teams.map(ct => ({
    id: ct.team.id,
    name: ct.team.clientCompany?.name || ct.team.company?.name || ct.team.name,
    logoUrl: ct.team.clientCompany?.logoUrl || ct.team.company?.logoUrl,
    companyId: ct.team.clientCompany?.id || ct.team.company?.id
  }));

  const visibleTeamCount = 2;
  const visibleTeams = showAllTeams ? teamsWithClients : teamsWithClients.slice(0, visibleTeamCount);
  const hiddenTeamCount = teamsWithClients.length - visibleTeamCount;

  // Duties display
  const visibleDutyCount = 4;
  const visibleDuties = showAllDuties ? duties : duties.slice(0, visibleDutyCount);
  const hiddenDutyCount = duties.length - visibleDutyCount;

  const CompanyLogo = ({ logoUrl, name, size = 'sm' }: { logoUrl?: string | null; name: string; size?: 'sm' | 'md' }) => {
    const sizeClasses = size === 'sm' ? 'w-5 h-5' : 'w-8 h-8';

    if (logoUrl) {
      return (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className={`${sizeClasses} rounded object-cover`}
        />
      );
    }
    return (
      <div className={`${sizeClasses} bg-muted rounded flex items-center justify-center`}>
        <Building2 className="w-3 h-3 text-muted-foreground" />
      </div>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Contact Avatar */}
          <Link href={`/people/${contact.id}`}>
            {contact.logoUrl ? (
              <img
                src={contact.logoUrl}
                alt={contact.fullName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-muted-foreground to-foreground rounded-full flex items-center justify-center text-white font-bold">
                {getInitials()}
              </div>
            )}
          </Link>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Name Row with LinkedIn and Verified */}
            <div className="flex items-center gap-2 mb-0.5">
              <Link
                href={`/people/${contact.id}`}
                className="font-semibold text-foreground hover:text-primary"
              >
                {contact.fullName}
              </Link>
              {contact.linkedinUrl && (
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {contact.verified && (
                <Shield className="w-4 h-4 text-green-600" />
              )}
            </div>

            {/* Title @ Company */}
            {(contact.title || contact.company) && (
              <p className="text-sm text-muted-foreground mb-2">
                {contact.title}
                {contact.title && contact.company && ' @ '}
                {contact.company && (
                  <Link
                    href={`/companies/${contact.company.id}`}
                    className="hover:text-primary"
                  >
                    {contact.company.name}
                  </Link>
                )}
              </p>
            )}

            {/* Teams Row with Logos */}
            {loadingTeams ? (
              <p className="text-sm text-muted-foreground">Loading teams...</p>
            ) : teamsWithClients.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-1 gap-y-1 mb-2 text-sm">
                {visibleTeams.map((team, index) => (
                  <span key={team.id} className="inline-flex items-center">
                    <CompanyLogo logoUrl={team.logoUrl} name={team.name} />
                    {team.companyId ? (
                      <Link
                        href={`/companies/${team.companyId}`}
                        className="ml-1 text-foreground hover:text-primary"
                      >
                        {team.name}
                      </Link>
                    ) : (
                      <span className="ml-1 text-foreground">{team.name}</span>
                    )}
                    {index < visibleTeams.length - 1 && <span className="text-muted-foreground">,</span>}
                  </span>
                ))}
                {hiddenTeamCount > 0 && !showAllTeams && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllTeams(true);
                    }}
                    className="text-primary hover:text-primary/80 font-medium ml-1"
                  >
                    +{hiddenTeamCount} {hiddenTeamCount === 1 ? 'team' : 'teams'}
                  </button>
                )}
                {showAllTeams && hiddenTeamCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllTeams(false);
                    }}
                    className="text-primary hover:text-primary/80 font-medium ml-1"
                  >
                    Show less
                  </button>
                )}
              </div>
            )}

            {/* Handles/Duties */}
            {loadingDuties ? (
              <p className="text-sm text-muted-foreground mb-2">Loading duties...</p>
            ) : duties.length > 0 && (
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
                {showAllDuties && hiddenDutyCount > 0 && (
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

            {/* Email */}
            {contact.email && (
              <p className="text-sm text-muted-foreground mb-1">{contact.email}</p>
            )}

            {/* Last Activity */}
            <p className="text-xs text-muted-foreground">
              Last activity: {formatLastActivity(contact.updatedAt)}
            </p>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <button className="hover:text-foreground flex items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-muted-foreground">{teams.length || 0}</span>
            </button>
            <button className="hover:text-foreground">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button className="hover:text-foreground">
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
