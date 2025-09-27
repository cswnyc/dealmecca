'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/firebase-auth'
import { signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Loader2, CheckCircle, AlertCircle, Linkedin } from 'lucide-react'

export default function LinkedInSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const processLinkedInAuth = async () => {
      try {
        const sessionToken = searchParams?.get('session')
        const userDataString = searchParams?.get('user')

        if (!sessionToken) {
          throw new Error('No session token received')
        }

        // Parse and validate the session token
        const sessionData = JSON.parse(atob(sessionToken))

        if (!sessionData.userId || !sessionData.email) {
          throw new Error('Invalid session data')
        }

        // Check token expiration
        if (Date.now() > sessionData.exp) {
          throw new Error('Session token expired')
        }

        // Store session data in localStorage for the app to use
        localStorage.setItem('linkedin-session', JSON.stringify(sessionData))

        // Parse user data if available
        let userData = null
        if (userDataString) {
          try {
            userData = JSON.parse(userDataString)
          } catch (e) {
            console.warn('Failed to parse user data:', e)
          }
        }

        setStatus('success')

        // Redirect after a short delay
        setTimeout(() => {
          router.push('/forum')
        }, 2000)

      } catch (error) {
        console.error('LinkedIn auth processing error:', error)
        setError(error instanceof Error ? error.message : 'Authentication failed')
        setStatus('error')

        // Redirect to signin page after delay
        setTimeout(() => {
          router.push('/auth/signin?error=linkedin_auth_failed')
        }, 3000)
      }
    }

    processLinkedInAuth()
  }, [searchParams, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Linkedin className="w-12 h-12 text-blue-600" />
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Completing LinkedIn Sign-In
          </h1>
          <p className="text-gray-600 mb-4">
            Please wait while we set up your account...
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Authenticating with LinkedIn</span>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <Linkedin className="w-6 h-6 text-blue-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to DealMecca!
          </h1>
          <p className="text-gray-600 mb-6">
            Your LinkedIn account has been successfully connected. Redirecting you to the community...
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              ✨ You now have access to all community features and can start networking with other professionals.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Failed
          </h1>
          <p className="text-gray-600 mb-4">
            We couldn't complete your LinkedIn sign-in.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Redirecting you back to the sign-in page...
          </p>
        </div>
      </div>
    )
  }

  return null
}