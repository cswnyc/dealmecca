'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Trash2, Play, Plus, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  query: string;
  filters: any;
  alertEnabled: boolean;
  lastRun: string;
  resultCount?: number;
}

interface SavedSearchesDropdownProps {
  currentQuery: string;
  currentFilters: any;
  onLoadSearch: (search: SavedSearch) => void;
  onSearchSaved?: () => void;
}

export function SavedSearchesDropdown({
  currentQuery,
  currentFilters,
  onLoadSearch,
  onSearchSaved
}: SavedSearchesDropdownProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const response = await fetch('/api/organizations/saved-searches');
      if (response.ok) {
        const data = await response.json();
        setSavedSearches(data.savedSearches || []);
      }
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    }
  };

  const handleSaveSearch = async () => {
    if (!saveName.trim()) {
      alert('Please enter a name for this search');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/organizations/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName,
          description: saveDescription,
          query: currentQuery,
          filters: currentFilters
        })
      });

      if (response.ok) {
        setSaveName('');
        setSaveDescription('');
        setShowSaveDialog(false);
        await fetchSavedSearches();
        if (onSearchSaved) onSearchSaved();
      } else {
        alert('Failed to save search');
      }
    } catch (error) {
      console.error('Error saving search:', error);
      alert('Failed to save search');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) {
      return;
    }

    try {
      const response = await fetch(`/api/organizations/saved-searches?id=${searchId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchSavedSearches();
      } else {
        alert('Failed to delete search');
      }
    } catch (error) {
      console.error('Error deleting search:', error);
      alert('Failed to delete search');
    }
  };

  const handleRunSearch = async (search: SavedSearch) => {
    onLoadSearch(search);
    setShowDropdown(false);

    // Update last run time
    try {
      await fetch(`/api/organizations/saved-searches/${search.id}`, {
        method: 'POST'
      });
      await fetchSavedSearches();
    } catch (error) {
      console.error('Error updating search:', error);
    }
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2"
        >
          <BookmarkCheck className="h-4 w-4" />
          <span>Saved Searches</span>
          {savedSearches.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {savedSearches.length}
            </Badge>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center space-x-2"
          disabled={!currentQuery.trim()}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Save Current</span>
        </Button>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookmarkCheck className="h-5 w-5 mr-2 text-blue-600" />
              Saved Searches
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {savedSearches.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bookmark className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No saved searches yet</p>
                <p className="text-xs mt-1">Save your frequently used searches for quick access</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedSearches.map((search) => (
                  <div
                    key={search.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{search.name}</h4>
                        {search.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{search.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => handleRunSearch(search)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                          title="Run search"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSearch(search.id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          title="Delete search"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span className="flex items-center">
                        <span className="font-medium text-gray-700 mr-1">{search.query}</span>
                      </span>
                      <span>
                        {search.resultCount !== undefined && search.resultCount !== null ? (
                          `${search.resultCount} results`
                        ) : (
                          'No results yet'
                        )}
                      </span>
                    </div>

                    {search.alertEnabled && (
                      <div className="mt-2 flex items-center text-xs text-amber-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Alerts enabled
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setShowDropdown(false);
                setShowSaveDialog(true);
              }}
              className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Save New Search
            </button>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Search Name *
              </label>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., Tech Agencies in NY"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Description (Optional)
              </label>
              <Textarea
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Add notes about this search..."
                rows={3}
                className="w-full"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-1">Current Search:</p>
              <p className="text-sm text-gray-900">"{currentQuery}"</p>
              {Object.keys(currentFilters).length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  + {Object.keys(currentFilters).length} active filter(s)
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSearch} disabled={loading || !saveName.trim()}>
              {loading ? 'Saving...' : 'Save Search'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
