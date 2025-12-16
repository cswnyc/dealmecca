'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  detectMentionTrigger, 
  insertMention, 
  searchMentionSuggestions, 
  MentionSuggestion 
} from '@/lib/mention-utils';
import { Search, Check, Hash } from 'lucide-react';

interface CategoryOnlyMentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  onMentionsChange?: (mentions: { topics: string[] }) => void;
}

export function CategoryOnlyMentionTextarea({
  value,
  onChange,
  placeholder = "Write your post content here...",
  rows = 6,
  className = "",
  disabled = false,
  onMentionsChange
}: CategoryOnlyMentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentTrigger, setCurrentTrigger] = useState<{
    type: 'topic';
    query: string;
    startIndex: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search function - only for topics
  const searchSuggestions = useCallback(async (type: 'topic', query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchMentionSuggestions(type, query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Failed to search topic mentions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle textarea input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    onChange(newValue);
    
    // Check for mention triggers - only allow topic mentions
    const trigger = detectMentionTrigger(newValue, cursorPosition);
    
    if (trigger && trigger.type === 'topic') {
      setCurrentTrigger(trigger as { type: 'topic'; query: string; startIndex: number });
      if (trigger.query.length >= 2) {
        searchSuggestions('topic', trigger.query);
      } else if (trigger.query.length === 0) {
        // Show placeholder suggestions or hide dropdown
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setCurrentTrigger(null);
      setShowSuggestions(false);
      setSuggestions([]);
    }

    // Notify parent of mention changes
    if (onMentionsChange) {
      // Extract topic mentions from the text (implement parsing logic)
      // For now, we'll implement this when we enhance the parsing
    }
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedIndex] && currentTrigger) {
          insertSelectedMention();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSuggestions([]);
        setCurrentTrigger(null);
        break;
    }
  };

  // Insert selected mention into text
  const insertSelectedMention = () => {
    if (!currentTrigger || !suggestions[selectedIndex] || !textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const { newText, newCursorPosition } = insertMention(
      value,
      cursorPosition,
      suggestions[selectedIndex],
      currentTrigger
    );

    onChange(newText);
    setShowSuggestions(false);
    setSuggestions([]);
    setCurrentTrigger(null);

    // Set cursor position after insertion
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Handle suggestion click
  const handleSuggestionClick = (index: number) => {
    setSelectedIndex(index);
    insertSelectedMention();
  };

  // Calculate suggestion dropdown position
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (showSuggestions && textareaRef.current && currentTrigger) {
      const textarea = textareaRef.current;
      const rect = textarea.getBoundingClientRect();
      
      // Calculate approximate cursor position (simplified)
      const lines = value.substring(0, currentTrigger.startIndex).split('\n');
      const lineHeight = 24; // Approximate line height
      const top = rect.top + (lines.length * lineHeight) + lineHeight;
      const left = rect.left + 8; // Small offset from left edge
      
      setDropdownPosition({ top, left });
    }
  }, [showSuggestions, currentTrigger, value]);

  return (
    <div className="relative">
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none bg-background text-foreground placeholder:text-muted-foreground ${className}`}
      />

      {/* Mention help text */}
      <div className="mt-2 text-xs text-muted-foreground">
        💡 Type <span className="font-mono bg-muted px-1 rounded">@topic</span> to mention categories and topics
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          className="fixed z-50 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto w-80 max-w-[calc(100vw-16px)] sm:max-w-sm md:max-w-md"
          style={{
            top: dropdownPosition.top,
            left: Math.max(8, Math.min(dropdownPosition.left, (typeof window !== 'undefined' ? window.innerWidth : 800) - 320))
          }}
        >
          {isLoading ? (
            <div className="p-3 text-center text-muted-foreground">
              <Search className="w-4 h-4 animate-spin mx-auto mb-1" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  onClick={() => handleSuggestionClick(index)}
                  className={`w-full px-3 py-2 text-left hover:bg-muted flex items-center space-x-3 ${
                    index === selectedIndex ? 'bg-primary/10 border-r-2 border-primary' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Hash className="w-4 h-4 text-purple-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground truncate">
                        {suggestion.name}
                      </span>
                    </div>
                    {suggestion.description && (
                      <div className="text-sm text-muted-foreground truncate">
                        {suggestion.description}
                      </div>
                    )}
                  </div>

                  {/* Selected indicator */}
                  {index === selectedIndex && (
                    <div className="text-primary">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : currentTrigger && currentTrigger.query.length >= 2 ? (
            <div className="p-3 text-center text-muted-foreground">
              <span className="text-sm">No topics found</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}