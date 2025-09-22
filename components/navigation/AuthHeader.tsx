'use client'

import { useAuth } from '@/lib/auth/firebase-auth'
import { auth } from '@/lib/firebase'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, LogOut, Settings, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthHeader() {
  // Handle cases where Firebase provider might not be available (e.g., during build)
  let firebaseUser = null;
  let loading = false;
  
  try {
    const authContext = useAuth();
    firebaseUser = authContext.user;
    loading = authContext.loading;
  } catch (error) {
    // If useAuth fails (e.g., during build), just use defaults
    console.log('AuthHeader: Firebase context not available, using defaults');
  }

  const [showDropdown, setShowDropdown] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Prevent hydration mismatch by not rendering until client is ready
  if (!isClient) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse bg-gray-200 rounded h-8 w-16"></div>
        <div className="animate-pulse bg-gray-200 rounded h-8 w-20"></div>
      </div>
    )
  }

  // Hide AuthHeader on homepage, forum, organizations, events, admin, auth, privacy, and terms pages to avoid duplicate user menus
  if (pathname === '/' ||
      pathname === '/forum' ||
      pathname.startsWith('/forum/') ||
      pathname === '/organizations' ||
      pathname === '/events' ||
      pathname === '/admin' ||
      pathname.startsWith('/admin/') ||
      pathname.startsWith('/auth/') ||
      pathname === '/privacy' ||
      pathname === '/terms') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse bg-gray-200 rounded h-8 w-16"></div>
        <div className="animate-pulse bg-gray-200 rounded h-8 w-20"></div>
      </div>
    )
  }

  if (firebaseUser) {
    return (
      <div className="flex items-center space-x-4">
        {/* User Menu */}
        <div className="relative">
          <Button 
            variant="ghost" 
            className="flex items-center space-x-2"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <User className="w-4 h-4" />
            <span className="hidden md:block">User</span>
          </Button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Dashboard
              </Link>
              <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </Link>
              <button 
                onClick={async () => {
                  try {
                    await firebaseSignOut(auth);
                    router.push('/auth/firebase-signin');
                  } catch (error) {
                    console.error('Error signing out:', error);
                  }
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Not logged in - show login buttons
  return (
    <div className="flex items-center space-x-4">
      <Link href="/auth/firebase-signin">
        <Button variant="ghost" className="text-gray-700 hover:text-primary font-medium">
          Sign In
        </Button>
      </Link>
      <Link href="/auth/firebase-signin">
        <Button className="bg-accent hover:bg-accent-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          Get Started
        </Button>
      </Link>
    </div>
  )
} 