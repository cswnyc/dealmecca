'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TestLoginSimple() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('admin@dealmecca.com')
  const [password, setPassword] = useState('AdminPass123!')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else if (result?.ok) {
        // Success - redirect to test page
        router.push('/test-auth-fixed')
      }
    } catch (error) {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>✅ Authenticated</CardTitle>
              <CardDescription>You are now logged in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Email:</strong> {session.user?.email}
              </div>
              <div>
                <strong>Role:</strong> {session.user?.role}
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/test-auth-fixed')}
                  className="w-full"
                >
                  Test API Authentication
                </Button>
                <Button 
                  onClick={() => router.push('/search')}
                  className="w-full"
                  variant="outline"
                >
                  Go to Search Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🔐 Test Login</CardTitle>
          <CardDescription>
            Login to test the fixed authentication system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dealmecca.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="text-red-700 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p className="mb-2">Test Credentials:</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
              <p><strong>Admin:</strong> admin@dealmecca.com / AdminPass123!</p>
              <p><strong>User:</strong> test@dealmecca.com / TestPass123!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 