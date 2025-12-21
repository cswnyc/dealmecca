'use client';

import React from 'react';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

interface TeamChipProps {
  name: string;
  logo?: string;
  color?: string;
}

// Generate a deterministic color from a string
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
  const lightness = 45 + (Math.abs(hash >> 8) % 15); // 45-60%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function TeamChip({ name, logo, color }: TeamChipProps) {
  const chipColor = color || stringToColor(name);
  
  // Get initials from name (up to 2 letters)
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#F3F6FB] dark:bg-[#162449] rounded-md text-xs text-[#64748B] dark:text-[#9AA7C2] transition-colors">
      {logo ? (
        <img 
          src={logo} 
          alt={name} 
          className="w-4 h-4 rounded object-cover"
        />
      ) : (
        <span 
          className="w-4 h-4 rounded flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0"
          style={{ backgroundColor: chipColor }}
        >
          {initials}
        </span>
      )}
      <span className="truncate max-w-[150px]">{name}</span>
    </span>
  );
}

interface MoreTeamsLinkProps {
  count: number;
  expanded: boolean;
  onToggle: () => void;
}

export function MoreTeamsLink({ count, expanded, onToggle }: MoreTeamsLinkProps) {
  if (count <= 0) {
    return null;
  }
  
  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className="text-sm font-medium text-[#2575FC] dark:text-[#5B8DFF] whitespace-nowrap hover:underline transition-all"
    >
      {expanded ? 'Show less' : `+${count} ${count === 1 ? 'team' : 'teams'}`}
    </button>
  );
}

