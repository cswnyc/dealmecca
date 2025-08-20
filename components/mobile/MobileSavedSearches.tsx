'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, Star, Bell, BellOff, Play, Edit, Trash2, Plus, X, 
  Clock, ChevronRight, Filter, Zap, AlertCircle
} from 'lucide-react'

interface SavedSearch {
  id: string
  name: string
  description?: string
  query: string
  filters: any
  alertEnabled: boolean
  resultCount?: number
  lastRun: string
  createdAt: string
  newMatches?: number
}

interface MobileSavedSearchesProps {
  onExecuteSearch: (search: SavedSearch) => void
  onSaveCurrentSearch: () => void
  currentFilters?: any
  currentQuery?: string
}

export default function MobileSavedSearches({
  onExecuteSearch,
  onSaveCurrentSearch,
  currentFilters,
  currentQuery
}: MobileSavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    alertEnabled: true
  })
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Load saved searches on mount
  useEffect(() => {
    loadSavedSearches()
  }, [])

  const loadSavedSearches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/saved-searches')
      
      if (response.ok) {
        const data = await response.json()
        // Add mock new matches for demo
        const searchesWithMatches = (data.savedSearches || []).map((search: SavedSearch) => ({
          ...search,
          newMatches: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0
        }))
        setSavedSearches(searchesWithMatches)
      } else {
        console.error('Failed to load saved searches')
      }
    } catch (error) {
      console.error('Error loading saved searches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePullToRefresh = async () => {
    setRefreshing(true)
    await loadSavedSearches()
    setRefreshing(false)
  }

  const handleSaveCurrentSearch = async () => {
    if (!saveForm.name.trim()) {
      setError('Search name is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveForm.name.trim(),
          description: saveForm.description.trim() || undefined,
          query: currentQuery || '',
          filters: currentFilters || {},
          alertEnabled: saveForm.alertEnabled
        })
      })

      if (response.ok) {
        await loadSavedSearches()
        setShowSaveDialog(false)
        setSaveForm({ name: '', description: '', alertEnabled: true })
        onSaveCurrentSearch()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save search')
      }
    } catch (error) {
      setError('Failed to save search')
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteSearch = async (search: SavedSearch) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/saved-searches/${search.id}/execute`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update the search with new result count and clear new matches
        setSavedSearches(prev => 
          prev.map(s => 
            s.id === search.id 
              ? { 
                  ...s, 
                  lastRun: new Date().toISOString(), 
                  resultCount: data.results.totalResults,
                  newMatches: 0
                }
              : s
          )
        )
        
        onExecuteSearch(data)
      } else {
        console.error('Failed to execute search')
      }
    } catch (error) {
      console.error('Error executing search:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAlert = async (searchId: string, alertEnabled: boolean) => {
    try {
      const response = await fetch('/api/saved-searches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: searchId,
          alertEnabled
        })
      })

      if (response.ok) {
        setSavedSearches(prev =>
          prev.map(s =>
            s.id === searchId ? { ...s, alertEnabled } : s
          )
        )
      }
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  const handleDeleteSearch = async (searchId: string) => {
    if (!confirm('Delete this saved search?')) {
      return
    }

    try {
      const response = await fetch(`/api/saved-searches?id=${searchId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSavedSearches(prev => prev.filter(s => s.id !== searchId))
      }
    } catch (error) {
      console.error('Error deleting search:', error)
    }
  }

  const formatLastRun = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-4 safe-area-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Saved Searches</h1>
            <p className="text-sm text-gray-500">Quick access to your favorite filters</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            className="min-h-[44px] rounded-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Save Current
          </Button>
        </div>
      </div>

      {/* Pull to Refresh Indicator */}
      {refreshing && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {loading && savedSearches.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading saved searches...</p>
          </div>
        ) : savedSearches.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved searches yet</h3>
            <p className="text-gray-500 mb-6 px-8">Save your current search to quickly access it later and get notified of new matches</p>
            <Button
              onClick={() => setShowSaveDialog(true)}
              className="rounded-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Save Your First Search
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedSearches.map((search) => (
              <SavedSearchCard
                key={search.id}
                search={search}
                onExecute={() => handleExecuteSearch(search)}
                onToggleAlert={(enabled) => handleToggleAlert(search.id, enabled)}
                onDelete={() => handleDeleteSearch(search.id)}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Save Current Search</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveDialog(false)}
                className="min-h-[44px] min-w-[44px] rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Name *
                </label>
                <Input
                  value={saveForm.name}
                  onChange={(e) => setSaveForm({ ...saveForm, name: e.target.value })}
                  placeholder="e.g., NYC Agency CEOs"
                  className={`text-base rounded-xl ${error ? 'border-red-500' : ''}`}
                  style={{ fontSize: '16px' }} // Prevent zoom on iOS
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <Input
                  value={saveForm.description}
                  onChange={(e) => setSaveForm({ ...saveForm, description: e.target.value })}
                  placeholder="Brief description of this search"
                  className="text-base rounded-xl"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-gray-900">Get notifications</div>
                  <div className="text-sm text-gray-500">Alert me when new matches are found</div>
                </div>
                <input
                  type="checkbox"
                  checked={saveForm.alertEnabled}
                  onChange={(e) => setSaveForm({ ...saveForm, alertEnabled: e.target.checked })}
                  className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  disabled={loading}
                  className="h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCurrentSearch}
                  disabled={loading || !saveForm.name.trim()}
                  className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  ) : (
                    <Star className="w-4 h-4 mr-2" />
                  )}
                  Save Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Individual Search Card Component
function SavedSearchCard({ 
  search, 
  onExecute, 
  onToggleAlert, 
  onDelete, 
  loading 
}: {
  search: SavedSearch
  onExecute: () => void
  onToggleAlert: (enabled: boolean) => void
  onDelete: () => void
  loading: boolean
}) {
  const [showActions, setShowActions] = useState(false)

  const formatLastRun = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 active:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{search.name}</h3>
            {search.alertEnabled && (
              <Bell className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
            {search.newMatches && search.newMatches > 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                {search.newMatches} new
              </Badge>
            )}
          </div>
          
          {search.description && (
            <p className="text-sm text-gray-600 truncate mb-2">{search.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>{search.resultCount ?? '?'} results</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatLastRun(search.lastRun)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleAlert(!search.alertEnabled)}
            className="min-h-[44px] min-w-[44px] rounded-full"
          >
            {search.alertEnabled ? (
              <BellOff className="w-4 h-4 text-gray-400" />
            ) : (
              <Bell className="w-4 h-4 text-gray-400" />
            )}
          </Button>
          
          <Button
            size="sm"
            onClick={onExecute}
            disabled={loading}
            className="min-h-[44px] px-4 rounded-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Play className="w-4 h-4 mr-1" />
            )}
            Run
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="min-h-[44px] min-w-[44px] rounded-full"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  )
}
