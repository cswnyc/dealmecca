'use client'

import React from 'react';
import Link from 'next/link';
import { Building2, User, Tag, Users } from 'lucide-react';

interface MentionTextProps {
  children: string;
  className?: string;
}

interface ParsedMention {
  type: 'company' | 'contact' | 'category' | 'user';
  id: string;
  name: string;
  url: string;
}

export default function MentionText({ children, className = '' }: MentionTextProps) {
  // Parse mentions from text
  const parseMentions = (text: string) => {
    const mentionRegex = /@\[([^\]]+)\]\(([^:]+):([^)]+)\)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const [fullMatch, name, type, id] = match;
      const mention: ParsedMention = {
        type: type as ParsedMention['type'],
        id,
        name,
        url: getMentionUrl(type as ParsedMention['type'], id)
      };

      // Add the mention component
      parts.push(
        <MentionLink
          key={`${type}-${id}-${match.index}`}
          mention={mention}
        />
      );

      lastIndex = match.index + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  const getMentionUrl = (type: string, id: string) => {
    switch (type) {
      case 'company':
        return `/companies/${id}`;
      case 'contact':
        return `/contacts/${id}`;
      case 'category':
        return `/forum/categories/${id}`;
      case 'user':
        return `/users/${id}`;
      default:
        return '#';
    }
  };

  const parsedContent = parseMentions(children);

  return <span className={className}>{parsedContent}</span>;
}

interface MentionLinkProps {
  mention: ParsedMention;
}

function MentionLink({ mention }: MentionLinkProps) {
  const getIcon = () => {
    switch (mention.type) {
      case 'company':
        return <Building2 className="w-3 h-3" />;
      case 'contact':
        return <User className="w-3 h-3" />;
      case 'category':
        return <Tag className="w-3 h-3" />;
      case 'user':
        return <Users className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getColorClasses = () => {
    switch (mention.type) {
      case 'company':
        return 'text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border-blue-200';
      case 'contact':
        return 'text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 border-green-200';
      case 'category':
        return 'text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border-purple-200';
      case 'user':
        return 'text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 border-orange-200';
      default:
        return 'text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 border-border';
    }
  };

  return (
    <Link
      href={mention.url}
      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-sm font-medium border transition-colors ${getColorClasses()}`}
    >
      {getIcon()}
      <span>@{mention.name}</span>
    </Link>
  );
}