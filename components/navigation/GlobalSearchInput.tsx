'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  X, 
  Building2, 
  Users, 
  Briefcase, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'company' | 'team' | 'businessLine' | 'contact' | 'forumPost' | 'event' | 'forumCategory';
  category: string;
  icon: string;
  metadata?: {
    verified?: boolean;
    location?: string;
    description?: string;
    slug?: string;
  };
}

interface SearchResults {
  suggestions: SearchSuggestion[];
  categories: {
    company: number;
    team: number;
    businessLine: number;
    contact: number;
    forumPost: number;
    event: number;
  };
  totalResults: number;
  seeAllQuery: string;
}

interface GlobalSearchInputProps {
  className?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function GlobalSearchInput({ 
  className = '',
  placeholder = 'Search companies, teams...',
  size = 'md'
}: GlobalSearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    suggestions: [],
    categories: { company: 0, team: 0, businessLine: 0, contact: 0, forumPost: 0, event: 0 },
    totalResults: 0,
    seeAllQuery: ''
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setResults({
        suggestions: [],
        categories: { company: 0, team: 0, businessLine: 0, contact: 0, forumPost: 0, event: 0 },
        totalResults: 0,
        seeAllQuery: ''
      });
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8&categorized=true`,
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setResults({
          suggestions: data.suggestions || [],
          categories: data.categories || { company: 0, team: 0, businessLine: 0, contact: 0, forumPost: 0, event: 0 },
          totalResults: data.totalResults || 0,
          seeAllQuery: searchQuery
        });
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Search suggestions failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    if (!value.trim()) {
      setResults({
        suggestions: [],
        categories: { company: 0, team: 0, businessLine: 0, contact: 0, forumPost: 0, event: 0 },
        totalResults: 0,
        seeAllQuery: ''
      });
      setShowDropdown(false);
      return;
    }

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(() => {
      debouncedSearch(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    const totalItems = results.suggestions.length + 1; // +1 for "See all results"
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === 0) {
          // "See all results" option
          handleSeeAllResults();
        } else if (selectedIndex > 0 && results.suggestions[selectedIndex - 1]) {
          handleSuggestionClick(results.suggestions[selectedIndex - 1]);
        } else if (query.trim()) {
          handleSeeAllResults();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setShowDropdown(false);

    // Navigate based on suggestion type
    if (suggestion.type === 'company') {
      router.push(`/companies/${suggestion.id}`);
    } else if (suggestion.type === 'contact') {
      router.push(`/people/${suggestion.id}`);
    } else if (suggestion.type === 'forumPost') {
      router.push(`/forum/posts/${suggestion.id}`);
    } else if (suggestion.type === 'forumCategory') {
      // Navigate to forum page filtered by category
      router.push(`/forum?category=${suggestion.metadata?.slug || suggestion.id}`);
    } else if (suggestion.type === 'event') {
      router.push(`/events/${suggestion.id}`);
    } else {
      // For teams and business lines, go to search results
      router.push(`/search?q=${encodeURIComponent(suggestion.title)}&type=${suggestion.type}`);
    }
  };

  // Handle "See all results"
  const handleSeeAllResults = () => {
    if (!query.trim()) return;
    
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // Handle clear search
  const handleClear = () => {
    setQuery('');
    setResults({
      suggestions: [],
      categories: { company: 0, team: 0, businessLine: 0, contact: 0, forumPost: 0, event: 0 },
      totalResults: 0,
      seeAllQuery: ''
    });
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon component for suggestion type
  const getIconComponent = (type: string) => {
    switch (type) {
      case 'company':
        return Building2;
      case 'team':
        return Users;
      case 'businessLine':
        return Briefcase;
      default:
        return Building2;
    }
  };

  // Size variants
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground', iconSizes[size])} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 1 && setShowDropdown(true)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-form-type="other"
          className={cn(
            'w-full pl-10 pr-10 border border-input rounded-lg',
            'bg-card text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'transition-all duration-200',
            sizeClasses[size]
          )}
        />
        
        {/* Loading or Clear Button */}
        {loading ? (
          <Loader2 className={cn('absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin', iconSizes[size])} />
        ) : query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className={iconSizes[size]} />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.totalResults > 0 ? (
            <>
              {/* See All Results Option */}
              <button
                onClick={handleSeeAllResults}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-muted border-b border-border',
                  'flex items-center justify-between group transition-colors',
                  selectedIndex === 0 && 'bg-primary/10'
                )}
              >
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">
                    See all results for: <span className="font-medium">{results.seeAllQuery}</span>
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              </button>

              {/* Suggestions */}
              {results.suggestions.map((suggestion, index) => {
                const IconComponent = getIconComponent(suggestion.type);
                const isSelected = selectedIndex === index + 1;
                
                return (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-muted',
                      'flex items-center justify-between group transition-colors',
                      isSelected && 'bg-primary/10',
                      index === results.suggestions.length - 1 ? '' : 'border-b border-border'
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <IconComponent className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-medium truncate">
                            {suggestion.title}
                          </span>
                          {suggestion.metadata?.verified && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        {suggestion.metadata?.location && (
                          <div className="text-xs text-muted-foreground truncate">
                            {suggestion.metadata.location}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="ml-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {suggestion.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </>
          ) : (
            // No Results
            <div className="px-4 py-6 text-center">
              <Search className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <div className="text-muted-foreground text-sm">
                No results found for "{query}"
              </div>
              <div className="text-muted-foreground/70 text-xs mt-1">
                Try searching for companies, contacts, or teams
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}