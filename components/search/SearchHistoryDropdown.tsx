'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { History, Clock, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchHistoryItem {
  id: string;
  query: string;
  resultsCount: number;
  searchType?: string;
  createdAt: string;
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

interface SearchHistoryDropdownProps {
  onSelectHistory: (query: string) => void;
}

export function SearchHistoryDropdown({ onSelectHistory }: SearchHistoryDropdownProps) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showDropdown) {
      fetchSearchHistory();
    }
  }, [showDropdown]);

  const fetchSearchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/organizations/search-history?limit=10');
      if (response.ok) {
        const data = await response.json();
        setSearchHistory(data.searchHistory || []);
      }
    } catch (error) {
      console.error('Error fetching search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all search history?')) {
      return;
    }

    try {
      const response = await fetch('/api/organizations/search-history', {
        method: 'DELETE'
      });

      if (response.ok) {
        setSearchHistory([]);
      } else {
        alert('Failed to clear history');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Failed to clear history');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <History className="h-4 w-4" />
        <span className="hidden sm:inline">History</span>
      </Button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-600" />
                Recent Searches
              </h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              ) : searchHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No recent searches</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {searchHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectHistory(item.query);
                        setShowDropdown(false);
                      }}
                      className="w-full p-2 rounded-md hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate flex-1">
                          {item.query}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>
                      {item.resultsCount > 0 && (
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.resultsCount} results
                          </Badge>
                          {item.searchType && (
                            <span className="text-xs text-gray-500">{item.searchType}</span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {searchHistory.length > 0 && (
              <div className="p-2 border-t border-gray-200">
                <button
                  onClick={handleClearHistory}
                  className="w-full flex items-center justify-center space-x-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear History</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
