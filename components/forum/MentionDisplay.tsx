'use client';

import Link from 'next/link';
import { formatMentionsForDisplay } from '@/lib/mention-utils';
import { Building2, User, ExternalLink } from 'lucide-react';

interface MentionDisplayProps {
  content: string;
  className?: string;
}

export function MentionDisplay({ content, className = "" }: MentionDisplayProps) {
  // Convert mentions to clickable links
  const formattedContent = formatMentionsForDisplay(content);

  return (
    <div 
      className={`mention-content ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
      style={{
        // Custom styles for mentions
        '--mention-company-color': '#2563eb',
        '--mention-contact-color': '#059669'
      } as React.CSSProperties}
    />
  );
}

// CSS styles for mentions (you can add this to your global CSS or use styled components)
export const mentionStyles = `
  .mention-content .mention {
    @apply inline-flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium no-underline transition-colors;
  }
  
  .mention-content .mention-company {
    @apply bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800;
  }
  
  .mention-content .mention-contact {
    @apply bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800;
  }
  
  .mention-content .mention::before {
    content: "";
    @apply w-3 h-3 mr-1;
    background-size: contain;
  }
  
  .mention-content .mention-company::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75'/%3E%3C/svg%3E");
  }
  
  .mention-content .mention-contact::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z'/%3E%3C/svg%3E");
  }
`;

// Enhanced version with React components instead of dangerouslySetInnerHTML
interface MentionDisplayReactProps {
  content: string;
  className?: string;
  showIcons?: boolean;
}

export function MentionDisplayReact({ 
  content, 
  className = "",
  showIcons = true 
}: MentionDisplayReactProps) {
  // Parse content and convert mentions to React components
  const parseContentWithMentions = (text: string) => {
    // Company mentions pattern
    const companyPattern = /@company\[([^\]]+)\]\(([^)]+)\)/g;

    // First pass: company mentions
    const textWithCompanyPlaceholders = text.replace(companyPattern, (match, name, id) => {
      return `__COMPANY_MENTION_${id}_${name}__`;
    });

    // Second pass: contact mentions
    const contactPattern = /@contact\[([^\]]+)\]\(([^)]+)\)/g;
    const textWithAllPlaceholders = textWithCompanyPlaceholders.replace(contactPattern, (match, name, id) => {
      return `__CONTACT_MENTION_${id}_${name}__`;
    });

    // Split by placeholders and reconstruct with React components
    const segments = textWithAllPlaceholders.split(/(__(?:COMPANY|CONTACT)_MENTION_[^_]+_[^_]+__)/);
    
    return segments.map((segment, index) => {
      if (segment.startsWith('__COMPANY_MENTION_')) {
        const parts = segment.match(/__COMPANY_MENTION_([^_]+)_(.+)__/);
        if (parts) {
          const [, id, name] = parts;
          return (
            <Link
              key={index}
              href={`/orgs/companies/${id}`}
              className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition-colors no-underline"
            >
              {showIcons && <Building2 className="w-3 h-3" />}
              <span>@{name}</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </Link>
          );
        }
      } else if (segment.startsWith('__CONTACT_MENTION_')) {
        const parts = segment.match(/__CONTACT_MENTION_([^_]+)_(.+)__/);
        if (parts) {
          const [, id, name] = parts;
          return (
            <Link
              key={index}
              href={`/contacts/${id}`}
              className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 transition-colors no-underline"
            >
              {showIcons && <User className="w-3 h-3" />}
              <span>@{name}</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </Link>
          );
        }
      }
      
      // Regular text
      return <span key={index} className="text-foreground">{segment}</span>;
    });
  };

  return (
    <div className={`mention-content ${className}`}>
      {parseContentWithMentions(content)}
    </div>
  );
} 