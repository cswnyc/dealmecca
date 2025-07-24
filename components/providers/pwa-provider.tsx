'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Wifi, WifiOff, X } from 'lucide-react'

interface PWAContextType {
  isOnline: boolean
  isInstallable: boolean
  isInstalled: boolean
  promptInstall: () => void
  offlineActions: OfflineAction[]
  addOfflineAction: (action: OfflineAction) => void
  syncWhenOnline: () => void
}

interface OfflineAction {
  id: string
  type: 'search' | 'favorite' | 'note' | 'connection'
  data: any
  timestamp: Date
}

const PWAContext = createContext<PWAContextType | null>(null)

export const usePWA = () => {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}

interface PWAProviderProps {
  children: React.ReactNode
}

export default function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showOfflineToast, setShowOfflineToast] = useState(false)
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([])

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered successfully')
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available, prompt user to refresh
                    if (confirm('New version available! Refresh to update?')) {
                      newWorker.postMessage({ type: 'SKIP_WAITING' })
                      window.location.reload()
                    }
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.log('[PWA] Service Worker registration failed:', error)
          })

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SYNC_SUCCESS') {
            console.log('[PWA] Sync successful:', event.data)
            // Remove synced actions from local state
            setOfflineActions(prev => 
              prev.filter(action => action.type !== event.data.action)
            )
          }
        })
      })
    }

    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      
      // Show install prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true)
        }
      }, 30000) // 30 seconds
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully')
      setIsInstalled(true)
      setIsInstallable(false)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    // Online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineToast(false)
      syncWhenOnline()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineToast(true)
      setTimeout(() => setShowOfflineToast(false), 5000)
    }

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load offline actions from localStorage
    const savedOfflineActions = localStorage.getItem('offlineActions')
    if (savedOfflineActions) {
      setOfflineActions(JSON.parse(savedOfflineActions))
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Save offline actions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('offlineActions', JSON.stringify(offlineActions))
  }, [offlineActions])

  const promptInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted the install prompt')
        } else {
          console.log('[PWA] User dismissed the install prompt')
        }
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      })
    }
  }

  const addOfflineAction = (action: OfflineAction) => {
    setOfflineActions(prev => [...prev, action])
    
    // Register background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return (registration as any).sync.register('background-sync')
      }).catch((error) => {
        console.log('[PWA] Background sync registration failed:', error)
      })
    }
  }

  const syncWhenOnline = () => {
    if (isOnline && offlineActions.length > 0) {
      console.log('[PWA] Syncing offline actions...')
      
      // Trigger background sync if supported
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          return (registration as any).sync.register('background-sync')
        })
      } else {
        // Fallback: sync immediately
        offlineActions.forEach(async (action) => {
          try {
            await processOfflineAction(action)
            setOfflineActions(prev => prev.filter(a => a.id !== action.id))
          } catch (error) {
            console.log('[PWA] Failed to sync action:', action, error)
          }
        })
      }
    }
  }

  const processOfflineAction = async (action: OfflineAction) => {
    // This mirrors the service worker logic
    switch (action.type) {
      case 'favorite':
        return fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        })
      case 'note':
        return fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        })
      case 'connection':
        return fetch('/api/connections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        })
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false)
    // Don't show again for 24 hours
    localStorage.setItem('installPromptDismissed', Date.now().toString())
  }

  const contextValue: PWAContextType = {
    isOnline,
    isInstallable,
    isInstalled,
    promptInstall,
    offlineActions,
    addOfflineAction,
    syncWhenOnline
  }

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
      
      {/* Install Prompt */}
      {showInstallPrompt && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Install DealMecca
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Get quick access and work offline. Install our app for the best experience.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={promptInstall} className="bg-blue-600 hover:bg-blue-700">
                      Install App
                    </Button>
                    <Button size="sm" variant="outline" onClick={dismissInstallPrompt}>
                      Not Now
                    </Button>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={dismissInstallPrompt}
                  className="p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Offline Toast */}
      {showOfflineToast && (
        <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-gray-900">You're offline</h4>
                  <p className="text-sm text-gray-600">
                    Some features are limited. Changes will sync when reconnected.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Online Status Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-40">
          <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-full text-sm">
            <WifiOff className="w-4 h-4" />
            <span>Offline</span>
            {offlineActions.length > 0 && (
              <span className="bg-red-200 px-2 py-1 rounded-full text-xs">
                {offlineActions.length} pending
              </span>
            )}
          </div>
        </div>
      )}

      {/* Sync Status */}
      {isOnline && offlineActions.length > 0 && (
        <div className="fixed bottom-4 left-4 z-40">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Wifi className="w-4 h-4" />
            <span>Syncing {offlineActions.length} items...</span>
          </div>
        </div>
      )}
    </PWAContext.Provider>
  )
} 