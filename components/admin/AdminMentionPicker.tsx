'use client';

import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BuildingOfficeIcon, UserIcon, TagIcon, CpuChipIcon, GlobeAltIcon } from '@heroicons/react/24/solid';

interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  verified: boolean;
  companyType?: string;
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

interface Category {
  id: string;
  name: string;
  color: string;
  slug: string;
}

interface Industry {
  id: string;
  name: string;
  displayName: string;
  type: 'industry';
  enumValue: string;
}

interface DspSsp {
  id: string;
  name: string;
  displayName: string;
  type: 'dsp-ssp';
  logo?: string;
  description?: string;
  verified: boolean;
}

interface Publisher {
  id: string;
  name: string;
  displayName: string;
  type: 'publisher';
  logo?: string;
  description?: string;
  verified: boolean;
}

interface AdminMentionPickerProps {
  type: 'companies' | 'contacts' | 'categories' | 'industries' | 'dsps-ssps' | 'publishers';
  selected: any[];
  onSelectionChange: (items: any[]) => void;
  placeholder?: string;
}

export function AdminMentionPicker({
  type,
  selected,
  onSelectionChange,
  placeholder = "Search..."
}: AdminMentionPickerProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search function
  const searchItems = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      let endpoint = '';
      if (type === 'companies') {
        endpoint = `/api/forum/mentions/companies?q=${encodeURIComponent(searchQuery)}`;
      } else if (type === 'contacts') {
        endpoint = `/api/forum/mentions/contacts?q=${encodeURIComponent(searchQuery)}`;
      } else if (type === 'categories') {
        endpoint = `/api/forum/categories`;
      } else if (type === 'industries') {
        endpoint = `/api/admin/forum/mentions/industries?q=${encodeURIComponent(searchQuery)}`;
      } else if (type === 'dsps-ssps') {
        endpoint = `/api/admin/forum/mentions/dsps-ssps?q=${encodeURIComponent(searchQuery)}`;
      } else if (type === 'publishers') {
        endpoint = `/api/admin/forum/mentions/publishers?q=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        
        let items = [];
        if (type === 'companies') {
          items = data.companies || [];
        } else if (type === 'contacts') {
          items = data.contacts || [];
        } else if (type === 'categories') {
          items = (data || []).filter((cat: Category) => 
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else if (type === 'industries') {
          items = data.industries || [];
        } else if (type === 'dsps-ssps') {
          items = data.dspsSsps || [];
        } else if (type === 'publishers') {
          items = data.publishers || [];
        }

        // Filter out already selected items
        const selectedIds = selected.map(item => item.id);
        const filteredItems = items.filter((item: any) => !selectedIds.includes(item.id));
        
        setSuggestions(filteredItems);
        setShowSuggestions(filteredItems.length > 0);
      }
    } catch (error) {
      console.error('Failed to search items:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  }, [type, selected]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchItems(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchItems]);

  const handleSelectItem = (item: any) => {
    const newSelected = [...selected, item];
    onSelectionChange(newSelected);
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleRemoveItem = (itemId: string) => {
    const newSelected = selected.filter(item => item.id !== itemId);
    onSelectionChange(newSelected);
  };

  const renderSelectedItem = (item: any) => {
    if (type === 'companies') {
      return (
        <div key={item.id} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          <BuildingOfficeIcon className="w-3 h-3" />
          <span>{item.name}</span>
          <button
            onClick={() => handleRemoveItem(item.id)}
            className="ml-1 text-blue-600 hover:text-blue-800"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>
      );
    } else if (type === 'contacts') {
      return (
        <div key={item.id} className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          <UserIcon className="w-3 h-3" />
          <span>{item.fullName}</span>
          <button
            onClick={() => handleRemoveItem(item.id)}
            className="ml-1 text-green-600 hover:text-green-800"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>
      );
    } else if (type === 'categories') {
      return (
        <div key={item.id} className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
          <span>{item.name}</span>
          <button
            onClick={() => handleRemoveItem(item.id)}
            className="ml-1 text-purple-600 hover:text-purple-800"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>
      );
    } else if (type === 'industries') {
      return (
        <div key={item.id} className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
          <TagIcon className="w-3 h-3" />
          <span>{item.name}</span>
          <button
            onClick={() => handleRemoveItem(item.id)}
            className="ml-1 text-orange-600 hover:text-orange-800"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>
      );
    } else if (type === 'dsps-ssps') {
      return (
        <div key={item.id} className="inline-flex items-center space-x-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
          <CpuChipIcon className="w-3 h-3" />
          <span>{item.name}</span>
          <button
            onClick={() => handleRemoveItem(item.id)}
            className="ml-1 text-indigo-600 hover:text-indigo-800"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>
      );
    } else if (type === 'publishers') {
      return (
        <div key={item.id} className="inline-flex items-center space-x-1 px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
          <GlobeAltIcon className="w-3 h-3" />
          <span>{item.name}</span>
          <button
            onClick={() => handleRemoveItem(item.id)}
            className="ml-1 text-teal-600 hover:text-teal-800"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>
      );
    }
  };

  const renderSuggestion = (item: any) => {
    if (type === 'companies') {
      return (
        <button
          key={item.id}
          onClick={() => handleSelectItem(item)}
          className="w-full px-3 py-2 text-left hover:bg-muted flex items-center space-x-3"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            {item.logoUrl ? (
              <img src={item.logoUrl} alt={item.name} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">{item.name}</div>
            {item.companyType && (
              <div className="text-sm text-muted-foreground">{item.companyType}</div>
            )}
          </div>
          {item.verified && (
            <div className="text-blue-500 text-xs">Verified</div>
          )}
        </button>
      );
    } else if (type === 'contacts') {
      return (
        <button
          key={item.id}
          onClick={() => handleSelectItem(item)}
          className="w-full px-3 py-2 text-left hover:bg-muted flex items-center space-x-3"
        >
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">{item.fullName}</div>
            {item.title && item.company && (
              <div className="text-sm text-muted-foreground">{item.title} at {item.company.name}</div>
            )}
          </div>
        </button>
      );
    } else if (type === 'categories') {
      return (
        <button
          key={item.id}
          onClick={() => handleSelectItem(item)}
          className="w-full px-3 py-2 text-left hover:bg-muted flex items-center space-x-3"
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: item.color }}
          ></div>
          <div className="font-medium text-foreground">{item.name}</div>
        </button>
      );
    } else if (type === 'industries') {
      return (
        <button
          key={item.id}
          onClick={() => handleSelectItem(item)}
          className="w-full px-3 py-2 text-left hover:bg-muted flex items-center space-x-3"
        >
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <TagIcon className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">{item.name}</div>
            <div className="text-sm text-muted-foreground">Industry</div>
          </div>
        </button>
      );
    } else if (type === 'dsps-ssps') {
      return (
        <button
          key={item.id}
          onClick={() => handleSelectItem(item)}
          className="w-full px-3 py-2 text-left hover:bg-muted flex items-center space-x-3"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            {item.logo ? (
              <img src={item.logo} alt={item.name} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <CpuChipIcon className="w-4 h-4 text-indigo-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">{item.name}</div>
            <div className="text-sm text-muted-foreground">DSP/SSP</div>
          </div>
          {item.verified && (
            <div className="text-indigo-500 text-xs">Verified</div>
          )}
        </button>
      );
    } else if (type === 'publishers') {
      return (
        <button
          key={item.id}
          onClick={() => handleSelectItem(item)}
          className="w-full px-3 py-2 text-left hover:bg-muted flex items-center space-x-3"
        >
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
            {item.logo ? (
              <img src={item.logo} alt={item.name} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <GlobeAltIcon className="w-4 h-4 text-teal-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">{item.name}</div>
            <div className="text-sm text-muted-foreground">Publisher</div>
          </div>
          {item.verified && (
            <div className="text-teal-500 text-xs">Verified</div>
          )}
        </button>
      );
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected Items */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(renderSelectedItem)}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="py-1">
              {suggestions.map(renderSuggestion)}
              {suggestions.length === 0 && !loading && (
                <div className="px-3 py-2 text-sm text-muted-foreground">No results found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}