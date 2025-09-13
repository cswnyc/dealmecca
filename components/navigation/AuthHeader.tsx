'use client'

import { useAuth } from '@/lib/auth/firebase-auth'
import { auth } from '@/lib/firebase'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, LogOut, Settings, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthHeader() {
  const { user: firebaseUser, loading } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

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
        {/* Welcome Message */}
        <span className="text-sm text-gray-600 hidden md:block">
          Welcome, {firebaseUser.displayName || firebaseUser.email}
        </span>
        
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