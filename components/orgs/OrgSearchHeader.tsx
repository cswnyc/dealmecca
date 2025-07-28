'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Building2, User, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchSuggestion {
  companies: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    companyType: string;
    verified: boolean;
  }>;
  contacts: Array<{
    id: string;
    fullName: string;
    title: string;
    company: { name: string; };
    verified: boolean;
  }>;
  locations: Array<{
    location: string;
    city: string;
    state: string;
    count: number;
  }>;
}

interface OrgSearchHeaderProps {
  onSearch: (query: string, filters: any) => void;
  initialQuery?: string;
  loading?: boolean;
}

export function OrgSearchHeader({ onSearch, initialQuery = '', loading = false }: OrgSearchHeaderProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion>({
    companies: [],
    contacts: [],
    locations: []
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      fetchSuggestions(query);
    } else {
      setSuggestions({ companies: [], contacts: [], locations: [] });
      setShowSuggestions(false);
    }
  }, [query]);

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      const response = await fetch(`/api/orgs/search/suggestions?q=${encodeURIComponent(searchQuery)}`, {
      credentials: 'include'
    });
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleSearch = (searchQuery = query) => {
    setShowSuggestions(false);
    onSearch(searchQuery, {});
  };

  const handleSuggestionClick = (suggestion: any, type: string) => {
    if (type === 'company') {
      setQuery(suggestion.name);
      handleSearch(suggestion.name);
    } else if (type === 'contact') {
      setQuery(suggestion.fullName);
      handleSearch(suggestion.fullName);
    } else if (type === 'location') {
      setQuery(suggestion.location);
      handleSearch(suggestion.location);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    // Add null safety checks for suggestions
    const safeCompanies = suggestions?.companies || [];
    const safeContacts = suggestions?.contacts || [];
    const safeLocations = suggestions?.locations || [];
    const totalSuggestions = safeCompanies.length + safeContacts.length + safeLocations.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(prev => (prev + 1) % totalSuggestions);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => prev <= 0 ? totalSuggestions - 1 : prev - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestion >= 0) {
        // Handle selected suggestion
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search companies, contacts, or locations..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          className="pl-10 pr-12 py-4 text-lg text-gray-900 bg-white border-2 border-white/20 focus:border-white rounded-xl shadow-lg"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setShowSuggestions(false);
            }}
            className="absolute inset-y-0 right-10 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}

        <Button
          onClick={() => handleSearch()}
          disabled={loading}
          className="absolute inset-y-0 right-0 px-6 rounded-l-none rounded-r-xl"
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.length >= 2) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {/* Company Suggestions */}
            {(suggestions?.companies || []).length > 0 && (
              <div className="p-3 border-b">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Companies
                </div>
                {(suggestions?.companies || []).map((company, index) => (
                  <button
                    key={company.id}
                    onClick={() => handleSuggestionClick(company, 'company')}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-md flex items-center space-x-3"
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-gray-500">
                        {company.city}, {company.state} • {company.companyType.replace(/_/g, ' ')}
                      </div>
                    </div>
                    {company.verified && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Verified</Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Contact Suggestions */}
            {(suggestions?.contacts || []).length > 0 && (
              <div className="p-3 border-b">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Contacts
                </div>
                {(suggestions?.contacts || []).map((contact, index) => (
                  <button
                    key={contact.id}
                    onClick={() => handleSuggestionClick(contact, 'contact')}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-md flex items-center space-x-3"
                  >
                    <User className="w-4 h-4 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">{contact.fullName}</div>
                      <div className="text-sm text-gray-500">
                        {contact.title} at {contact.company.name}
                      </div>
                    </div>
                    {contact.verified && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Verified</Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Location Suggestions */}
            {(suggestions?.locations || []).length > 0 && (
              <div className="p-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Locations
                </div>
                {(suggestions?.locations || []).map((location, index) => (
                  <button
                    key={`${location.city}-${location.state}`}
                    onClick={() => handleSuggestionClick(location, 'location')}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-md flex items-center space-x-3"
                  >
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium">{location.location}</div>
                      <div className="text-sm text-gray-500">
                        {location.count} {location.count === 1 ? 'company' : 'companies'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {(suggestions?.companies || []).length === 0 && 
             (suggestions?.contacts || []).length === 0 && 
             (suggestions?.locations || []).length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <div>No suggestions found</div>
                <div className="text-sm">Try a different search term</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 