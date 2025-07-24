'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Search, 
  Home, 
  Calendar, 
  Users, 
  Target, 
  Menu,
  Bell,
  User,
  Settings,
  Plus,
  MessageCircle,
  BarChart3,
  Zap,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePWA } from '@/components/providers/pwa-provider'

interface NavigationItem {
  id: string
  name: string
  href: string
  icon: React.ReactNode
  activeIcon?: React.ReactNode
  badge?: number | string
  shortcut?: boolean
  color: string
  activeColor: string
}

interface MobileNavigationProps {
  className?: string
}

export default function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { isOnline, offlineActions } = usePWA()
  const [notifications, setNotifications] = useState(3)
  const [showQuickActions, setShowQuickActions] = useState(false)

  // Primary navigation items for bottom tab bar
  const primaryNavItems: NavigationItem[] = [
    {
      id: 'dashboard',
      name: 'Home',
      href: '/dashboard',
      icon: <Home className="w-5 h-5" />,
      activeIcon: <Home className="w-5 h-5 fill-current" />,
      color: 'text-gray-600',
      activeColor: 'text-blue-600'
    },
    {
      id: 'search',
      name: 'Search',
      href: '/search',
      icon: <Search className="w-5 h-5" />,
      activeIcon: <Search className="w-5 h-5 fill-current" />,
      shortcut: true,
      color: 'text-gray-600',
      activeColor: 'text-blue-600'
    },
    {
      id: 'orgs',
      name: 'Orgs',
      href: '/orgs',
      icon: <Building2 className="w-5 h-5" />,
      activeIcon: <Building2 className="w-5 h-5 fill-current" />,
      badge: 'New',
      color: 'text-gray-600',
      activeColor: 'text-indigo-600'
    },
    {
      id: 'events',
      name: 'Events',
      href: '/events',
      icon: <Calendar className="w-5 h-5" />,
      activeIcon: <Calendar className="w-5 h-5 fill-current" />,
      badge: 2, // upcoming events
      color: 'text-gray-600',
      activeColor: 'text-green-600'
    },
    {
      id: 'more',
      name: 'More',
      href: '#',
      icon: <Menu className="w-5 h-5" />,
      color: 'text-gray-600',
      activeColor: 'text-gray-800'
    }
  ]

  // Quick action items
  const quickActions = [
    {
      id: 'voice-search',
      name: 'Voice Search',
      icon: <Search className="w-5 h-5" />,
      action: () => startVoiceSearch(),
      color: 'bg-blue-600'
    },
    {
      id: 'scan-card',
      name: 'Scan Card',
      icon: <User className="w-5 h-5" />,
      action: () => startCardScan(),
      color: 'bg-green-600'
    },
    {
      id: 'quick-note',
      name: 'Quick Note',
      icon: <Plus className="w-5 h-5" />,
      action: () => createQuickNote(),
      color: 'bg-purple-600'
    },
    {
      id: 'nearby-events',
      name: 'Nearby Events',
      icon: <Calendar className="w-5 h-5" />,
      action: () => findNearbyEvents(),
      color: 'bg-orange-600'
    }
  ]

  // Additional navigation items for the drawer/more menu
  const secondaryNavItems = [
    { name: 'Intelligence', href: '/intelligence', icon: <Target className="w-5 h-5" />, badge: 'AI' },
    { name: 'Forum', href: '/forum', icon: <MessageCircle className="w-5 h-5" />, badge: notifications },
    { name: 'Analytics', href: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
    { name: 'Profile', href: '/profile', icon: <User className="w-5 h-5" /> }
  ]

  const handleNavigation = (item: NavigationItem) => {
    // Haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    if (item.id === 'more') {
      setShowQuickActions(!showQuickActions)
    } else {
      router.push(item.href)
      setShowQuickActions(false)
    }
  }

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Voice search implementation would go here
      console.log('Starting voice search...')
      router.push('/search?voice=true')
    } else {
      router.push('/search')
    }
  }

  const startCardScan = () => {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      // Camera scanning implementation would go here
      console.log('Starting card scan...')
      router.push('/scan')
    } else {
      alert('Camera not available on this device')
    }
  }

  const createQuickNote = () => {
    router.push('/notes/new')
  }

  const findNearbyEvents = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          router.push(`/events?lat=${latitude}&lng=${longitude}&nearby=true`)
        },
        (error) => {
          console.log('Location access denied:', error)
          router.push('/events')
        }
      )
    } else {
      router.push('/events')
    }
  }

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const getActiveItem = () => {
    return primaryNavItems.find(item => 
      item.href !== '#' && isActiveRoute(item.href)
    )
  }

  const activeItem = getActiveItem()

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${className}`}>
        <div className="bg-white border-t border-gray-200 px-2 py-1 safe-area-padding-bottom">
          <div className="flex items-center justify-around">
            {primaryNavItems.map((item) => {
              const isActive = item.href !== '#' && isActiveRoute(item.href)
              const showBadge = item.badge && (typeof item.badge === 'number' ? item.badge > 0 : true)
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-colors duration-200 ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  } hover:text-blue-600 focus:outline-none focus:text-blue-600`}
                  style={{
                    minHeight: '48px', // Touch target minimum
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <div className="relative">
                    {isActive ? (item.activeIcon || item.icon) : item.icon}
                    
                    {/* Badge */}
                    {showBadge && (
                      <div className="absolute -top-2 -right-2">
                        <Badge 
                          variant={typeof item.badge === 'string' ? 'default' : 'destructive'}
                          className={`text-xs px-1.5 py-0.5 min-w-[16px] h-4 flex items-center justify-center ${
                            typeof item.badge === 'string' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      </div>
                    )}

                    {/* Offline sync indicator */}
                    {item.id === 'search' && !isOnline && offlineActions.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </div>
                  
                  <span className={`text-xs mt-1 truncate max-w-full ${
                    isActive ? 'font-medium' : 'font-normal'
                  }`}>
                    {item.name}
                  </span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions Overlay */}
      {showQuickActions && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setShowQuickActions(false)}
          />
          
          {/* Quick Actions Panel */}
          <div className="absolute bottom-16 left-4 right-4 bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <button
                onClick={() => setShowQuickActions(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    action.action()
                    setShowQuickActions(false)
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl text-white transition-transform active:scale-95 ${action.color}`}
                  style={{ minHeight: '80px' }}
                >
                  {action.icon}
                  <span className="text-sm font-medium mt-2">{action.name}</span>
                </button>
              ))}
            </div>

            {/* Secondary Navigation */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">More Options</h4>
              <div className="space-y-2">
                {secondaryNavItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href)
                      setShowQuickActions(false)
                    }}
                    className="flex items-center gap-3 w-full p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="text-gray-500">
                      {item.icon}
                    </div>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* User Info */}
            {session?.user && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{session.user.name}</p>
                    <p className="text-sm text-gray-500">{session.user.email}</p>
                  </div>
                  {!isOnline && (
                    <div className="text-orange-500">
                      <Zap className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safe area padding for devices with notches */}
      <style jsx>{`
        .safe-area-padding-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        
        /* Prevent zoom on touch */
        button {
          touch-action: manipulation;
        }
        
        /* Smooth scrolling for mobile */
        html {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Custom tap highlight */
        * {
          -webkit-tap-highlight-color: rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </>
  )
} 