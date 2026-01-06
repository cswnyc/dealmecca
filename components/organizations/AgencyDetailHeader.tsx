'use client';

import { CheckCircle } from 'lucide-react';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

interface AgencyDetailHeaderProps {
  agency: {
    name: string;
    logoUrl?: string;
    type: string;
    verified: boolean;
    stats: {
      partnerships: number;
      contacts: number;
      teams: number;
      lastActivity: string;
    };
  };
}

export function AgencyDetailHeader({ agency }: AgencyDetailHeaderProps) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-16 h-16 rounded-xl bg-white dark:bg-dark-surfaceAlt border border-border dark:border-dark-border flex items-center justify-center">
            {agency.logoUrl ? (
              <CompanyLogo logoUrl={agency.logoUrl} companyName={agency.name} size="lg" />
            ) : (
              <span className="text-brand-ink dark:text-white font-bold text-sm">
                {agency.name.split(' ')[0].slice(0, 4).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-brand-ink dark:text-white font-display">
                {agency.name}
              </h1>
              {agency.verified && (
                <span className="px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-muted-foreground">{agency.type}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-border dark:border-dark-border rounded-lg text-sm font-medium text-muted-foreground hover:border-brand-primary dark:hover:border-[#5B8DFF] hover:text-brand-primary dark:hover:text-[#5B8DFF] transition-all">
            Follow
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-br from-brand-primary to-brand-violet hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 py-4 border-t border-border dark:border-dark-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">
            {agency.stats.partnerships}
          </p>
          <p className="text-sm text-muted-foreground">Partnerships</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">
            {agency.stats.contacts}
          </p>
          <p className="text-sm text-muted-foreground">Contacts</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">
            {agency.stats.teams}
          </p>
          <p className="text-sm text-muted-foreground">Teams</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">
            {agency.stats.lastActivity}
          </p>
          <p className="text-sm text-muted-foreground">Last activity</p>
        </div>
      </div>
    </div>
  );
}

