'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Building2, User, ExternalLink } from 'lucide-react';

// Cache for resolved mentions to avoid repeated API calls
const mentionCache = new Map<string, any>();

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
  resolved?: {
    type: 'company' | 'contact';
    id: string;
    displayName: string;
    confidence: number;
  };
}

function MentionChip({ type, id, name, data, resolved }: MentionChipProps) {
  const [mentionData, setMentionData] = useState<Company | Contact | null>(data || null);
  const [loading, setLoading] = useState(!data && !resolved);

  useEffect(() => {
    if (!data && !resolved) {
      const abortController = new AbortController();

      // Fetch the entity data
      const fetchData = async () => {
        try {
          const endpoint = type === 'company' ? `/api/companies/${id}` : `/api/contacts/${id}`;
          const response = await fetch(endpoint, { signal: abortController.signal });
          if (response.ok) {
            const result = await response.json();
            if (!abortController.signal.aborted) {
              setMentionData(result);
            }
          }
        } catch (error) {
          // Ignore abort errors (component unmounted)
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          // Silently handle network errors - mention will show without additional data
        } finally {
          if (!abortController.signal.aborted) {
            setLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        abortController.abort();
      };
    }
  }, [type, id, data, resolved]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground animate-pulse">
        <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
        @{name}
      </span>
    );
  }

  // Handle resolved mentions (smart detection results)
  if (resolved) {
    return (
      <Link
        href={resolved.type === 'company' ? `/orgs/companies/${resolved.id}` : `/contacts/${resolved.id}`}
        className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors no-underline"
        title={`${resolved.displayName} (${Math.round(resolved.confidence * 100)}% match)`}
      >
        {name}
      </Link>
    );
  }

  if (type === 'company' && mentionData) {
    const company = mentionData as Company;
    return (
      <Link
        href={`/orgs/companies/${id}`}
        className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors no-underline"
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
        className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors no-underline"
      >
        @{contact.fullName}
      </Link>
    );
  }

  // Fallback for unrecognized or failed mentions
  return (
    <span className="text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer font-medium">
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
        className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
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
  const [resolvedMentions, setResolvedMentions] = useState<Record<string, any>>({});
  const [mentionsResolved, setMentionsResolved] = useState(false);

  // Extract and resolve plain @mentions on component mount
  useEffect(() => {
    const resolvePlainMentions = async () => {
      // Find all plain @mentions (not already structured)
      const plainMentionPattern = /@([a-zA-Z0-9\s&'"\-\.]+)(?=\s|$|[^a-zA-Z0-9\s&'"\-\.])/g;
      const structuredMentionPattern = /@(?:(?:(company|contact)\[([^\]]+)\]\(([^)]+)\))|(?:\[([^\]]+)\]\((company|contact):([^)]+)\)))/g;

      const plainMentions = [];
      const structuredMentions = new Set();
      let match;

      // First, collect all structured mentions to avoid double-processing
      const contentCopy = content;
      while ((match = structuredMentionPattern.exec(contentCopy)) !== null) {
        const mentionText = match[0];
        structuredMentions.add(mentionText);
      }

      // Then find plain mentions that aren't already structured
      structuredMentionPattern.lastIndex = 0; // Reset regex
      while ((match = plainMentionPattern.exec(content)) !== null) {
        const fullMatch = match[0];
        const mentionName = match[1].trim();

        // Skip if this looks like a structured mention or email
        if (mentionName.includes('@') || mentionName.includes('(') || mentionName.includes(']')) continue;
        if ([...structuredMentions].some(sm => sm.includes(mentionName))) continue;
        if (mentionName.length < 2 || mentionName.length > 50) continue;

        plainMentions.push(fullMatch);
      }

      if (plainMentions.length > 0) {
        // Check cache first
        const cacheKey = plainMentions.sort().join('|');
        if (mentionCache.has(cacheKey)) {
          setResolvedMentions(mentionCache.get(cacheKey));
          setMentionsResolved(true);
          return;
        }

        try {
          const response = await fetch('/api/forum/mentions/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mentions: plainMentions }),
          });

          if (response.ok) {
            const data = await response.json();
            mentionCache.set(cacheKey, data.resolutions);
            setResolvedMentions(data.resolutions);
          }
        } catch (error) {
          console.warn('Failed to resolve mentions:', error);
        }
      }
      setMentionsResolved(true);
    };

    resolvePlainMentions();
  }, [content]);

  // Parse content and convert mentions to React components
  const parseContentWithMentions = (text: string) => {
    // First, detect and replace email addresses
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    let textWithEmailPlaceholders = text.replace(emailPattern, (email) => {
      return `__EMAIL_${email}__`;
    });

    // Process in multiple phases:
    // 1. Handle structured mentions (@company[name](id) or @[name](company:id))
    // 2. Handle plain @mentions using resolved data
    // 3. Handle remaining text

    const segments = [];
    let processedText = textWithEmailPlaceholders;

    // Phase 1: Handle structured mentions
    const structuredMentionPattern = /@(?:(?:(company|contact)\[([^\]]+)\]\(([^)]+)\))|(?:\[([^\]]+)\]\((company|contact):([^)]+)\)))/g;
    let lastIndex = 0;
    let match;

    const structuredSegments = [];
    while ((match = structuredMentionPattern.exec(textWithEmailPlaceholders)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        structuredSegments.push({
          type: 'text',
          content: textWithEmailPlaceholders.slice(lastIndex, match.index),
          start: lastIndex,
          end: match.index
        });
      }

      // Parse the structured mention
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

      structuredSegments.push({
        type: 'structured-mention',
        mentionType: type,
        id,
        name,
        data: existingData,
        start: match.index,
        end: match.index + match[0].length
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < textWithEmailPlaceholders.length) {
      structuredSegments.push({
        type: 'text',
        content: textWithEmailPlaceholders.slice(lastIndex),
        start: lastIndex,
        end: textWithEmailPlaceholders.length
      });
    }

    // Phase 2: Process plain @mentions in text segments only
    const finalSegments = [];

    for (const segment of structuredSegments) {
      if (segment.type === 'structured-mention') {
        finalSegments.push(
          <MentionChip
            key={`structured-mention-${segment.start}`}
            type={segment.mentionType}
            id={segment.id}
            name={segment.name}
            data={segment.data}
          />
        );
      } else if (segment.type === 'text') {
        // Process plain mentions in this text segment
        const textContent = segment.content;
        const plainMentionPattern = /@([a-zA-Z0-9\s&'"\-\.]+)(?=\s|$|[^a-zA-Z0-9\s&'"\-\.])/g;

        let textLastIndex = 0;
        let plainMatch;

        while ((plainMatch = plainMentionPattern.exec(textContent)) !== null) {
          // Add text before the plain mention
          if (plainMatch.index > textLastIndex) {
            const beforeText = textContent.slice(textLastIndex, plainMatch.index);
            finalSegments.push(
              <span key={`text-${segment.start}-${textLastIndex}`}>
                {processTextForEmails(beforeText)}
              </span>
            );
          }

          const fullMatch = plainMatch[0];
          const resolved = resolvedMentions[fullMatch];

          if (resolved && mentionsResolved) {
            // Render as clickable link
            finalSegments.push(
              <MentionChip
                key={`plain-mention-${segment.start}-${plainMatch.index}`}
                type={resolved.type}
                id={resolved.id}
                name={fullMatch}
                resolved={resolved}
              />
            );
          } else {
            // Render as plain text or loading state
            finalSegments.push(
              <span
                key={`unresolved-mention-${segment.start}-${plainMatch.index}`}
                className={mentionsResolved ? "text-muted-foreground" : "text-primary animate-pulse font-medium"}
                title={mentionsResolved ? "Unknown mention" : "Resolving mention..."}
              >
                {fullMatch}
              </span>
            );
          }

          textLastIndex = plainMatch.index + plainMatch[0].length;
        }

        // Add remaining text in this segment
        if (textLastIndex < textContent.length) {
          const remainingText = textContent.slice(textLastIndex);
          finalSegments.push(
            <span key={`text-remaining-${segment.start}-${textLastIndex}`}>
              {processTextForEmails(remainingText)}
            </span>
          );
        }
      }
    }

    return finalSegments;
  };

  return (
    <div className={`rich-content-renderer text-foreground ${className}`}>
      {parseContentWithMentions(content)}
    </div>
  );
}