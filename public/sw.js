const CACHE_NAME = 'dealmecca-v2.0.0-FORCE-UPDATE'
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/search',
  '/intelligence',
  '/events',
  '/forum',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
]

const API_CACHE_URLS = [
  // Removed API endpoints from pre-caching to prevent installation errors
  // These will be cached on-demand instead
]

const RUNTIME_CACHE = 'dealmecca-runtime-v2.0-FORCE-UPDATE'
const API_CACHE = 'dealmecca-api-v1.1-auth-fix'

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_CACHE_URLS).catch(error => {
          console.error('[SW] Failed to cache some static assets:', error)
          // Continue installation even if some assets fail to cache
          return Promise.resolve()
        })
      }),
      caches.open(API_CACHE).then((cache) => {
        console.log('[SW] API cache initialized (no pre-caching)')
        // Don't pre-cache API routes to avoid authentication conflicts
        return Promise.resolve()
      })
    ])
  )
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== RUNTIME_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  )
})

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // CRITICAL: Never cache authentication endpoints
  const authEndpoints = [
    '/api/auth/',
    '/api/auth/session',
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/auth/signup',
    '/api/auth/csrf',
    '/api/auth/providers',
    '/api/auth/callback',
    '/api/direct-login',
    '/api/debug-session',
    '/api/test-session-creation'
  ]
  
  if (authEndpoints.some(endpoint => url.pathname.startsWith(endpoint))) {
    console.log('[SW] Bypassing auth endpoint:', url.pathname)
    // Let auth requests go directly to network - NO CACHING
    event.respondWith(fetch(request))
    return
  }

  // Handle API routes with cache-first strategy for specific endpoints
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Handle static assets with cache-first strategy
  event.respondWith(handleStaticRequest(request))
})

// Handle API requests with intelligent caching
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  // Cache-first for user profile and dashboard metrics
  const cacheFirstRoutes = [
    '/api/users/profile',
    '/api/dashboard/metrics',
    '/api/search/suggestions'
  ]
  
  if (cacheFirstRoutes.some(route => url.pathname.includes(route))) {
    try {
      const cache = await caches.open(API_CACHE)
      const cachedResponse = await cache.match(request)
      
      if (cachedResponse) {
        // Serve from cache and update in background
        updateCacheInBackground(request, cache)
        return cachedResponse
      }
    } catch (error) {
      console.log('[SW] Cache error:', error)
    }
  }

  // Network-first for other API routes
  try {
    const response = await fetch(request)
    
    // Cache successful responses
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[SW] Network error, serving from cache:', error)
    
    // Serve from cache on network failure
    const cache = await caches.open(API_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API failures
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'You are currently offline. Some features may be limited.'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request)
    
    // Cache the page if successful
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[SW] Navigation network error:', error)
    
    // Try to serve from cache
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Serve offline page as last resort
    return caches.match('/offline.html') || new Response(
      '<h1>You are offline</h1><p>Please check your internet connection.</p>',
      { headers: { 'Content-Type': 'text/html' } }
    )
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const response = await fetch(request)
    
    // Cache static assets
    if (response.ok) {
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[SW] Static asset error:', error)
    return new Response('Asset not available offline', { status: 404 })
  }
}

// Update cache in background
async function updateCacheInBackground(request, cache) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
  } catch (error) {
    console.log('[SW] Background update failed:', error)
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineActions())
  } else if (event.tag === 'search-sync') {
    event.waitUntil(syncOfflineSearches())
  } else if (event.tag === 'favorite-sync') {
    event.waitUntil(syncOfflineFavorites())
  }
})

// Sync offline actions when connection is restored
async function syncOfflineActions() {
  try {
    console.log('[SW] Syncing offline actions...')
    
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        await processOfflineAction(action)
        await removeOfflineAction(action.id)
        
        // Notify the client about successful sync
        await notifyClients({
          type: 'SYNC_SUCCESS',
          action: action.type,
          message: `${action.type} synced successfully`
        })
      } catch (error) {
        console.log('[SW] Failed to sync action:', action, error)
      }
    }
  } catch (error) {
    console.log('[SW] Sync error:', error)
  }
}

// Sync offline searches
async function syncOfflineSearches() {
  try {
    const offlineSearches = await getOfflineSearches()
    
    for (const search of offlineSearches) {
      // Re-run the search to get fresh results
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(search.query)
      })
      
      if (response.ok) {
        await removeOfflineSearch(search.id)
      }
    }
  } catch (error) {
    console.log('[SW] Search sync error:', error)
  }
}

// Sync offline favorites
async function syncOfflineFavorites() {
  try {
    const offlineFavorites = await getOfflineFavorites()
    
    for (const favorite of offlineFavorites) {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(favorite)
      })
      
      if (response.ok) {
        await removeOfflineFavorite(favorite.id)
      }
    }
  } catch (error) {
    console.log('[SW] Favorite sync error:', error)
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  if (!event.data) {
    return
  }

  const data = event.data.json()
  const { title, body, icon, badge, tag, actions } = data

  const options = {
    body,
    icon: icon || '/icons/icon-192x192.png',
    badge: badge || '/icons/badge-72x72.png',
    tag: tag || 'general',
    requireInteraction: false,
    actions: actions || [],
    data: data.data || {},
    vibrate: [200, 100, 200]
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag)
  
  event.notification.close()

  const { action } = event
  const { data } = event.notification
  
  let targetUrl = '/'
  
  // Handle different notification actions
  switch (action) {
    case 'view':
      targetUrl = data.url || '/'
      break
    case 'search':
      targetUrl = '/search'
      break
    case 'events':
      targetUrl = '/events'
      break
    case 'intelligence':
      targetUrl = '/intelligence'
      break
    default:
      targetUrl = data.url || '/'
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

// Message handling from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Utility functions for IndexedDB operations
async function getOfflineActions() {
  // In a real implementation, you'd use IndexedDB
  return JSON.parse(localStorage.getItem('offlineActions') || '[]')
}

async function removeOfflineAction(id) {
  const actions = await getOfflineActions()
  const filtered = actions.filter(action => action.id !== id)
  localStorage.setItem('offlineActions', JSON.stringify(filtered))
}

async function processOfflineAction(action) {
  // Process different types of offline actions
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

async function getOfflineSearches() {
  return JSON.parse(localStorage.getItem('offlineSearches') || '[]')
}

async function removeOfflineSearch(id) {
  const searches = await getOfflineSearches()
  const filtered = searches.filter(search => search.id !== id)
  localStorage.setItem('offlineSearches', JSON.stringify(filtered))
}

async function getOfflineFavorites() {
  return JSON.parse(localStorage.getItem('offlineFavorites') || '[]')
}

async function removeOfflineFavorite(id) {
  const favorites = await getOfflineFavorites()
  const filtered = favorites.filter(fav => fav.id !== id)
  localStorage.setItem('offlineFavorites', JSON.stringify(filtered))
}

// Notify all clients
async function notifyClients(message) {
  const clientList = await clients.matchAll()
  clientList.forEach(client => {
    client.postMessage(message)
  })
}

console.log('[SW] Service worker loaded') 