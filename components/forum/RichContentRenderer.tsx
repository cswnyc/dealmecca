'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Building2, User, ExternalLink } from 'lucide-react';

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

interface MentionChipProps {
  type: 'company' | 'contact';
  id: string;
  name: string;
  data?: Company | Contact;
}

function MentionChip({ type, id, name, data }: MentionChipProps) {
  const [mentionData, setMentionData] = useState<Company | Contact | null>(data || null);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (!data) {
      // Fetch the entity data
      const fetchData = async () => {
        try {
          const endpoint = type === 'company' ? `/api/companies/${id}` : `/api/contacts/${id}`;
          const response = await fetch(endpoint);
          if (response.ok) {
            const result = await response.json();
            setMentionData(result);
          }
        } catch (error) {
          console.error(`Failed to fetch ${type} data:`, error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [type, id, data]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 animate-pulse">
        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        @{name}
      </span>
    );
  }

  if (type === 'company' && mentionData) {
    const company = mentionData as Company;
    return (
      <Link
        href={`/orgs/companies/${id}`}
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors no-underline"
      >
        @{company.name}
      </Link>
    );
  }

  if (type === 'contact' && mentionData) {
    const contact = mentionData as Contact;
    return (
      <Link
        href={`/contacts/${id}`}
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors no-underline"
      >
        @{contact.fullName}
      </Link>
    );
  }

  // Fallback for unrecognized or failed mentions
  return (
    <span className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer">
      @{name}
    </span>
  );
}

interface RichContentRendererProps {
  content: string;
  className?: string;
  mentions?: {
    companies: Company[];
    contacts: Contact[];
  };
}

// Helper function to process email placeholders
function processTextForEmails(text: string): React.ReactNode[] {
  const emailPlaceholderPattern = /__EMAIL_([^_]+)__/g;
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = emailPlaceholderPattern.exec(text)) !== null) {
    // Add text before email
    if (match.index > lastIndex) {
      segments.push(text.slice(lastIndex, match.index));
    }

    // Add email as clickable link
    const email = match[1];
    segments.push(
      <a
        key={`email-${match.index}`}
        href={`mailto:${email}`}
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
      >
        {email}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }

  return segments.length > 0 ? segments : [text];
}

export function RichContentRenderer({
  content,
  className = "",
  mentions
}: RichContentRendererProps) {
  // Parse content and convert mentions to React components
  const parseContentWithMentions = (text: string) => {
    // First, detect and replace email addresses
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    let textWithEmailPlaceholders = text.replace(emailPattern, (email) => {
      return `__EMAIL_${email}__`;
    });

    // Updated pattern to match both old and new formats:
    // Old: @company[name](id) or @contact[name](id)
    // New: @[name](company:id) or @[name](contact:id)
    const mentionPattern = /@(?:(?:(company|contact)\[([^\]]+)\]\(([^)]+)\))|(?:\[([^\]]+)\]\((company|contact):([^)]+)\)))/g;

    let lastIndex = 0;
    const segments = [];
    let match;

    while ((match = mentionPattern.exec(textWithEmailPlaceholders)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        const textSegment = textWithEmailPlaceholders.slice(lastIndex, match.index);
        segments.push(
          <span key={`text-${lastIndex}`}>
            {processTextForEmails(textSegment)}
          </span>
        );
      }

      // Parse the mention
      let type: 'company' | 'contact';
      let name: string;
      let id: string;

      if (match[1]) {
        // Old format: @company[name](id)
        type = match[1] as 'company' | 'contact';
        name = match[2];
        id = match[3];
      } else {
        // New format: @[name](company:id)
        name = match[4];
        type = match[5] as 'company' | 'contact';
        id = match[6];
      }

      // Find existing data for this mention
      let existingData: Company | Contact | undefined;
      if (mentions) {
        if (type === 'company') {
          existingData = mentions.companies.find(c => c.id === id);
        } else {
          existingData = mentions.contacts.find(c => c.id === id);
        }
      }

      segments.push(
        <MentionChip
          key={`mention-${match.index}`}
          type={type}
          id={id}
          name={name}
          data={existingData}
        />
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < textWithEmailPlaceholders.length) {
      const remainingText = textWithEmailPlaceholders.slice(lastIndex);
      segments.push(
        <span key={`text-${lastIndex}`}>
          {processTextForEmails(remainingText)}
        </span>
      );
    }

    return segments;
  };

  return (
    <div className={`rich-content-renderer ${className}`}>
      {parseContentWithMentions(content)}
    </div>
  );
}