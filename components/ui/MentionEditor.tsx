'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, Building2, Tag, Users, AtSign } from 'lucide-react';

interface MentionItem {
  id: string;
  type: 'company' | 'contact' | 'category' | 'user';
  name: string;
  slug: string;
  avatar?: string;
  subtitle?: string;
  mentionText: string;
  url: string;
  color?: string;
  icon?: string;
}

interface MentionEditorProps {
  value: string;
  onChange: (value: string, mentions: MentionItem[]) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  maxLength?: number;
  disabled?: boolean;
}

export default function MentionEditor({
  value,
  onChange,
  placeholder = "Type @ to mention companies, contacts, categories...",
  className = "",
  multiline = true,
  maxLength,
  disabled = false
}: MentionEditorProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState<MentionItem[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const [loading, setLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  const ref = multiline ? textareaRef : inputRef;

  // Search for mentions
  const searchMentions = useCallback(async (query: string) => {
    if (query.length < 1) {
      setMentionResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/mentions/search?q=${encodeURIComponent(query)}&limit=8`);
      if (response.ok) {
        const results = await response.json();
        setMentionResults(results);
        setSelectedMentionIndex(0);
      }
    } catch (error) {
      console.error('Error searching mentions:', error);
      setMentionResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    setCursorPosition(cursorPos);

    // Check if we're in a mention
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([^@\s]*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      const startPos = cursorPos - query.length - 1;

      setMentionQuery(query);
      setMentionStartPos(startPos);
      setShowMentions(true);
      searchMentions(query);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }

    // Extract existing mentions from the text
    const mentions: MentionItem[] = [];
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = mentionRegex.exec(newValue)) !== null) {
      // This is a simplified extraction - in a real implementation,
      // you'd want to store mention data separately
    }

    onChange(newValue, mentions);
  };

  // Handle mention selection
  const insertMention = (mention: MentionItem) => {
    if (!ref.current) return;

    const beforeMention = value.slice(0, mentionStartPos);
    const afterMention = value.slice(cursorPosition);
    const mentionText = `@[${mention.name}](${mention.type}:${mention.id})`;

    const newValue = beforeMention + mentionText + afterMention;
    const newCursorPos = beforeMention.length + mentionText.length;

    onChange(newValue, [mention]);

    setShowMentions(false);
    setMentionQuery('');

    // Focus and set cursor position
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
        ref.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showMentions || mentionResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < mentionResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev > 0 ? prev - 1 : mentionResults.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (mentionResults[selectedMentionIndex]) {
          insertMention(mentionResults[selectedMentionIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowMentions(false);
        break;
    }
  };

  // Get icon for mention type
  const getMentionIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Building2 className="w-4 h-4" />;
      case 'contact':
        return <User className="w-4 h-4" />;
      case 'category':
        return <Tag className="w-4 h-4" />;
      case 'user':
        return <Users className="w-4 h-4" />;
      default:
        return <AtSign className="w-4 h-4" />;
    }
  };

  // Format display text (convert mention syntax to readable text)
  const formatDisplayText = (text: string) => {
    return text.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1');
  };

  const baseInputClasses = `w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground placeholder:text-muted-foreground ${disabled ? 'bg-muted cursor-not-allowed' : ''} ${className}`;

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          ref={textareaRef}
          value={formatDisplayText(value)}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${baseInputClasses} resize-vertical min-h-[100px]`}
          maxLength={maxLength}
          disabled={disabled}
        />
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={formatDisplayText(value)}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={baseInputClasses}
          maxLength={maxLength}
          disabled={disabled}
        />
      )}

      {/* Mentions dropdown */}
      {showMentions && (
        <div
          ref={mentionsRef}
          className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Searching...
            </div>
          ) : mentionResults.length > 0 ? (
            mentionResults.map((mention, index) => (
              <button
                key={`${mention.type}-${mention.id}`}
                className={`w-full px-3 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none ${
                  index === selectedMentionIndex ? 'bg-primary/10 border-l-2 border-primary' : ''
                }`}
                onClick={() => insertMention(mention)}
                onMouseEnter={() => setSelectedMentionIndex(index)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {mention.avatar ? (
                      <img
                        src={mention.avatar}
                        alt={mention.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        mention.type === 'company' ? 'bg-blue-100 text-blue-600' :
                        mention.type === 'contact' ? 'bg-green-100 text-green-600' :
                        mention.type === 'category' ? 'bg-purple-100 text-purple-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {getMentionIcon(mention.type)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {mention.name}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        mention.type === 'company' ? 'bg-blue-100 text-blue-800' :
                        mention.type === 'contact' ? 'bg-green-100 text-green-800' :
                        mention.type === 'category' ? 'bg-purple-100 text-purple-800' :
                        'bg-muted text-foreground'
                      }`}>
                        {mention.type}
                      </span>
                    </div>
                    {mention.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">
                        {mention.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : mentionQuery.length > 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No matches found for "{mentionQuery}"
            </div>
          ) : (
            <div className="px-3 py-8 text-center text-muted-foreground">
              <AtSign className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm">Type to search for mentions</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Companies, contacts, categories, and users
              </p>
            </div>
          )}
        </div>
      )}

      {/* Character count */}
      {maxLength && (
        <div className="mt-1 text-xs text-muted-foreground text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}