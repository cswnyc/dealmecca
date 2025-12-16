'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  verified: boolean;
  companyType?: string;
  industry?: string;
  city?: string;
  state?: string;
}

interface Contact {
  id: string;
  fullName: string;
  title?: string;
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

interface TopicMention {
  id: string;
  topic: {
    id: string;
    name: string;
    description?: string;
    context?: string;
    color?: string;
    icon?: string;
    companies: Array<{
      id: string;
      company: Company;
      context?: string;
      role?: string;
      order: number;
    }>;
    contacts: Array<{
      id: string;
      contact: Contact;
      context?: string;
      role?: string;
      order: number;
    }>;
  };
}

interface TopicChipProps {
  topicMention: TopicMention;
  className?: string;
  maxDisplayItems?: number;
}

export function TopicChip({
  topicMention,
  className = '',
  maxDisplayItems = 3
}: TopicChipProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { topic } = topicMention;

  const allItems = [
    ...topic.companies.map(tc => ({
      type: 'company' as const,
      data: tc.company,
      context: tc.context,
      role: tc.role,
      order: tc.order
    })),
    ...topic.contacts.map(tc => ({
      type: 'contact' as const,
      data: tc.contact,
      context: tc.context,
      role: tc.role,
      order: tc.order
    }))
  ].sort((a, b) => a.order - b.order);

  const displayItems = isExpanded ? allItems : allItems.slice(0, maxDisplayItems);
  const hiddenCount = allItems.length - maxDisplayItems;
  const showExpansion = allItems.length > maxDisplayItems;

  const primaryColor = topic.color || '#3B82F6';

  return (
    <div className={`inline-block ${className}`}>
      {/* Main Topic Display */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border-0 shadow-sm bg-muted hover:bg-muted/80 hover:shadow-md transition-all duration-200"
      >
        {/* Primary Company Logo */}
        {allItems.length > 0 && allItems[0].type === 'company' && (
          <div className="flex -space-x-1">
            {allItems[0].data.logoUrl ? (
              <img
                src={allItems[0].data.logoUrl}
                alt={`${allItems[0].data.name} logo`}
                className="w-5 h-5 rounded-full border-2 border-background object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">
                  {allItems[0].data.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Show second company logo if exists */}
            {allItems.length > 1 && allItems[1].type === 'company' && (
              <>
                {allItems[1].data.logoUrl ? (
                  <img
                    src={allItems[1].data.logoUrl}
                    alt={`${allItems[1].data.name} logo`}
                    className="w-5 h-5 rounded-full border-2 border-background object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">
                      {allItems[1].data.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Topic Icon (fallback if no company logos) */}
        {topic.icon && allItems.length === 0 && (
          <span className="text-lg" aria-label="Topic icon">
            {topic.icon}
          </span>
        )}

        {/* Topic Name */}
        <Link
          href={`/forum?topic=${encodeURIComponent(topic.name)}`}
          className="font-medium text-foreground hover:text-primary transition-colors no-underline"
        >
          {topic.name}
        </Link>

        {/* Verification Badge for Primary Company */}
        {allItems.length > 0 && allItems[0].type === 'company' && allItems[0].data.verified && (
          <span className="text-primary" title="Verified company">
            ✓
          </span>
        )}

        {/* Expansion Button */}
        {showExpansion && (
          <div
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="text-xs font-medium">
              {isExpanded ? 'less' : `+${hiddenCount} more`}
            </span>
            {isExpanded ? (
              <ChevronUpIcon className="w-3 h-3" />
            ) : (
              <ChevronDownIcon className="w-3 h-3" />
            )}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-3 p-4 bg-muted rounded-lg border border-border shadow-sm animate-in slide-in-from-top-1 duration-200">
          {topic.description && (
            <p className="text-sm text-muted-foreground mb-4 font-medium">{topic.description}</p>
          )}

          <div className="space-y-3">
            {displayItems.map((item, index) => (
              <div key={`${item.type}-${item.data.id}`} className="transition-all duration-200 hover:scale-[1.02]">
                {item.type === 'company' ? (
                  <CompanyItem
                    company={item.data as Company}
                    context={item.context}
                    role={item.role}
                  />
                ) : (
                  <ContactItem
                    contact={item.data as Contact}
                    context={item.context}
                    role={item.role}
                  />
                )}
              </div>
            ))}
          </div>

          {topic.context && (
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Context:</span>
                <span className="text-xs text-foreground bg-background px-2 py-1 rounded-full">{topic.context}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CompanyItem({
  company,
  context,
  role
}: {
  company: Company;
  context?: string;
  role?: string;
}) {
  return (
    <Link
      href={`/companies/${company.id}`}
      className="flex items-center gap-3 text-sm hover:bg-background rounded-lg px-3 py-2 transition-all duration-200 group shadow-sm hover:shadow-md"
    >
      {/* Company Logo */}
      <div className="relative">
        {company.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={`${company.name} logo`}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-background"
          />
        ) : (
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center ring-2 ring-background">
            <span className="text-primary text-sm font-bold">
              {company.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Verification Badge */}
        {company.verified && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-xs">✓</span>
          </div>
        )}
      </div>

      {/* Company Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {company.name}
          </span>
          {company.companyType && (
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              {company.companyType.toLowerCase()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {role && (
            <span className="px-2 py-0.5 bg-muted rounded-full text-muted-foreground font-medium">
              {role}
            </span>
          )}
          {context && <span className="text-muted-foreground">{context}</span>}
          {company.city && company.state && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {company.city}, {company.state}
            </span>
          )}
        </div>
      </div>

      {/* Industry Badge */}
      {company.industry && (
        <div className="text-xs text-muted-foreground">
          {company.industry.replace(/_/g, ' ').toLowerCase()}
        </div>
      )}
    </Link>
  );
}

function ContactItem({
  contact,
  context,
  role
}: {
  contact: Contact;
  context?: string;
  role?: string;
}) {
  return (
    <Link
      href={`/contacts/${contact.id}`}
      className="flex items-center gap-3 text-sm hover:bg-background rounded-lg px-3 py-2 transition-all duration-200 group shadow-sm hover:shadow-md"
    >
      {/* Contact Avatar */}
      <div className="relative">
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center ring-2 ring-background">
          <span className="text-muted-foreground text-sm font-medium">
            {contact.fullName.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {contact.fullName}
          </span>
          {contact.title && (
            <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
              {contact.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {role && (
            <span className="px-2 py-0.5 bg-muted rounded-full text-muted-foreground font-medium">
              {role}
            </span>
          )}
          {contact.company && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4z" clipRule="evenodd" />
              </svg>
              {contact.company.name}
            </span>
          )}
          {context && <span className="text-muted-foreground">{context}</span>}
        </div>
      </div>
    </Link>
  );
}