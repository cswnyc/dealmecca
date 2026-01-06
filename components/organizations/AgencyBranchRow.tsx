'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Users } from 'lucide-react';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  color?: string;
}

interface BranchRowProps {
  branch: {
    id: string;
    name: string;
    teams?: Team[];
    peopleCount: number;
    lastActivity: string;
  };
}

export function AgencyBranchRow({ branch }: BranchRowProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const visibleTeams = isExpanded ? branch.teams : branch.teams?.slice(0, 3);
  const hasMoreTeams = branch.teams && branch.teams.length > 3;

  const handleRowClick = () => {
    router.push(`/companies/${branch.id}`);
  };

  return (
    <div 
      className="px-6 py-4 border-l-2 border-transparent hover:border-[#2575FC] dark:hover:border-[#5B8DFF] hover:bg-[#F7F9FC] dark:hover:bg-[#101E38] transition-all cursor-pointer group"
      onClick={handleRowClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Location icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #60A5FA 0%, #22D3EE 100%)' }}
          >
            <MapPin className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#162B54] dark:text-[#EAF0FF] mb-1 group-hover:text-[#2575FC] dark:group-hover:text-[#5B8DFF] transition-colors">
              {branch.name}
            </h3>

            {/* Teams/Clients */}
            {branch.teams && branch.teams.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {visibleTeams?.map((team) => (
                  <Link 
                    key={team.id} 
                    href={`/companies/${team.id}`}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: team.color || '#2575FC' }}
                    >
                      {team.logoUrl ? (
                        <CompanyLogo logoUrl={team.logoUrl} companyName={team.name} size="xs" />
                      ) : (
                        <span className="text-[8px] text-white font-bold">
                          {team.name[0]}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#64748B] dark:text-[#9AA7C2] hover:text-[#2575FC] dark:hover:text-[#5B8DFF] transition-colors">
                      {team.name}
                    </span>
                  </Link>
                ))}
                {hasMoreTeams && (
                  <button 
                    className="text-xs text-[#2575FC] dark:text-[#5B8DFF] font-medium hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                  >
                    {isExpanded ? 'Show less' : `+${branch.teams!.length - 3} more`}
                  </button>
                )}
              </div>
            )}

            <p className="text-xs text-[#9AA7C2] dark:text-[#6B7A99]">
              Last activity: {branch.lastActivity}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* People count */}
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#9AA7C2]">
            <Users className="w-4 h-4" />
            {branch.peopleCount} {branch.peopleCount === 1 ? 'person' : 'people'}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 text-[#9AA7C2] dark:text-[#6B7A99] hover:text-[#2575FC] dark:hover:text-[#5B8DFF] rounded-lg hover:bg-[#F3F6FB] dark:hover:bg-[#1A2744] transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </button>
            <button 
              className="p-1.5 text-[#9AA7C2] dark:text-[#6B7A99] hover:text-[#2575FC] dark:hover:text-[#5B8DFF] rounded-lg hover:bg-[#F3F6FB] dark:hover:bg-[#1A2744] transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
