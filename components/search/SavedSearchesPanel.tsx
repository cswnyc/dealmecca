'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Save, Search, Star, Clock, Bell, BellOff, Play, Edit, Trash2, 
  Plus, X, AlertCircle, Check
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
}

interface SavedSearchesPanelProps {
  currentFilters: any
  currentQuery: string
  onExecuteSearch: (search: SavedSearch) => void
  onSaveCurrentSearch: () => void
}

export default function SavedSearchesPanel({
  currentFilters,
  currentQuery,
  onExecuteSearch,
  onSaveCurrentSearch
}: SavedSearchesPanelProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    alertEnabled: false
  })
  const [error, setError] = useState<string | null>(null)

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
        setSavedSearches(data.savedSearches || [])
      } else {
        console.error('Failed to load saved searches')
      }
    } catch (error) {
      console.error('Error loading saved searches:', error)
    } finally {
      setLoading(false)
    }
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
          query: currentQuery,
          filters: currentFilters,
          alertEnabled: saveForm.alertEnabled
        })
      })

      if (response.ok) {
        await loadSavedSearches()
        setShowSaveDialog(false)
        setSaveForm({ name: '', description: '', alertEnabled: false })
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
        
        // Update the search with new result count
        setSavedSearches(prev => 
          prev.map(s => 
            s.id === search.id 
              ? { ...s, lastRun: new Date().toISOString(), resultCount: data.results.totalResults }
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
    if (!confirm('Are you sure you want to delete this saved search?')) {
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
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Saved Searches
            </CardTitle>
            <CardDescription>
              Quick access to your favorite search filters
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Save Current
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && savedSearches.length === 0 ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading saved searches...</p>
          </div>
        ) : savedSearches.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">No saved searches yet</p>
            <p className="text-sm text-gray-500">Save your current search to quickly access it later</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{search.name}</h4>
                    {search.alertEnabled && (
                      <Bell className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleToggleAlert(search.id, !search.alertEnabled)}
                    >
                      {search.alertEnabled ? (
                        <BellOff className="h-3 w-3" />
                      ) : (
                        <Bell className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDeleteSearch(search.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>

                {search.description && (
                  <p className="text-xs text-gray-600 mb-2">{search.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {search.resultCount ?? '?'} results
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatLastRun(search.lastRun)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleExecuteSearch(search)}
                    disabled={loading}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Run
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Save Current Search</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSaveDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Search Name *
                  </label>
                  <Input
                    value={saveForm.name}
                    onChange={(e) => setSaveForm({ ...saveForm, name: e.target.value })}
                    placeholder="e.g., NYC Agency CEOs"
                    className={error ? 'border-red-500' : ''}
                  />
                  {error && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {error}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description (optional)
                  </label>
                  <Input
                    value={saveForm.description}
                    onChange={(e) => setSaveForm({ ...saveForm, description: e.target.value })}
                    placeholder="Brief description of this search"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="alerts"
                    checked={saveForm.alertEnabled}
                    onChange={(e) => setSaveForm({ ...saveForm, alertEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="alerts" className="text-sm">
                    Get notified when new matches are found
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(false)}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveCurrentSearch}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
