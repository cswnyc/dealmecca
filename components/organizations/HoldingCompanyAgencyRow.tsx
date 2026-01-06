'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

interface Branch {
  id: string;
  name: string;
}

interface AgencyRowProps {
  agency: {
    id: string;
    name: string;
    logoUrl?: string;
    verified: boolean;
    branches: Branch[];
    totalBranches: number;
    lastActivity: string;
  };
}

export function HoldingCompanyAgencyRow({ agency }: AgencyRowProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Show 4 branches initially, or all if expanded
  const visibleBranches = isExpanded ? agency.branches : agency.branches.slice(0, 4);
  const hasMoreBranches = agency.totalBranches > 4;

  const handleRowClick = () => {
    router.push(`/companies/${agency.id}`);
  };

  return (
    <div 
      className="px-6 py-4 border-l-2 border-transparent hover:border-[#2575FC] dark:hover:border-[#5B8DFF] hover:bg-[#F7F9FC] dark:hover:bg-[#101E38] transition-all cursor-pointer group"
      onClick={handleRowClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-[#EAF1FF] dark:bg-[#1A2744] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {agency.logoUrl ? (
              <CompanyLogo logoUrl={agency.logoUrl} companyName={agency.name} size="md" />
            ) : (
              <svg className="w-6 h-6 text-[#2575FC] dark:text-[#5B8DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + Verified */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-[#162B54] dark:text-[#EAF0FF] group-hover:text-[#2575FC] dark:group-hover:text-[#5B8DFF] transition-colors">
                {agency.name}
              </h3>
              {agency.verified && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Verified
                </span>
              )}
            </div>

            {/* Branches - displayed vertically */}
            {agency.branches.length > 0 && (
              <div className="flex flex-col gap-0.5 mb-1">
                {visibleBranches.map((branch, index) => {
                  // Extract city abbreviation from branch name (e.g., "AKQA Atlanta" -> "ATL")
                  const cityMatch = branch.name.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*$/);
                  const city = cityMatch ? cityMatch[1] : '';
                  const abbr = city.split(' ').map(w => w.slice(0, 3).toUpperCase()).join('').slice(0, 3);
                  
                  // Generate a color based on branch index
                  const colors = [
                    'bg-blue-500',
                    'bg-indigo-500', 
                    'bg-cyan-500',
                    'bg-violet-500',
                    'bg-purple-500',
                    'bg-fuchsia-500',
                    'bg-pink-500',
                    'bg-rose-500'
                  ];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <Link
                      key={branch.id}
                      href={`/companies/${branch.id}`}
                      className="inline-flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#9AA7C2] hover:text-[#2575FC] dark:hover:text-[#5B8DFF] transition-colors w-fit"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className={`w-5 h-5 rounded ${colorClass} flex items-center justify-center text-[7px] text-white font-bold flex-shrink-0`}>
                        {abbr}
                      </span>
                      {branch.name}{!isExpanded && index < Math.min(3, agency.branches.length - 1) ? ',' : ''}
                    </Link>
                  );
                })}
                {hasMoreBranches && (
                  <button 
                    className="text-xs font-medium text-[#2575FC] dark:text-[#5B8DFF] hover:underline ml-6 text-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                  >
                    {isExpanded ? 'Show less' : `+${agency.totalBranches - 4} branches`}
                  </button>
                )}
              </div>
            )}

            {/* Last activity */}
            <p className="text-xs text-[#9AA7C2] dark:text-[#6B7A99]">
              Last activity: {agency.lastActivity}
            </p>
          </div>
        </div>

        {/* Action buttons - aligned to top */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-4">
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
  );
}
