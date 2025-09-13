'use client'

import { useAuth } from '@/lib/auth/firebase-auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  ArrowLeft,
  Save,
  Crown
} from 'lucide-react'
import PageLayout from '@/components/navigation/PageLayout'

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  subscriptionTier: string
  createdAt: string
}

export default function SettingsPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }

    if (!firebaseUser) {
      router.push('/auth/firebase-signin')
      return
    }
    
    if (firebaseUser) {
      fetchProfile()
    }
  }, [firebaseUser, authLoading, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setName(data.name || '')
      } else if (response.status === 401) {
        router.push('/auth/signin')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) return

    setSaving(true)
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        alert('Profile updated successfully!')
      } else {
        alert('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return (
          <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium">
            Free Plan
          </span>
        )
      case 'PRO':
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
            <Crown className="w-3 h-3" /> Pro Plan
          </span>
        )
      case 'TEAM':
        return (
          <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
            <Crown className="w-3 h-3" /> Team Plan
          </span>
        )
      case 'ADMIN':
        return (
          <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
            <Crown className="w-3 h-3" /> Admin
          </span>
        )
      default:
        return null
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout
      title="Settings"
      description="Manage your account and preferences"
      maxWidth="2xl"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <div className="mt-1">
                    {profile && getSubscriptionBadge(profile.subscriptionTier)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </label>
                  <p className="text-gray-900 py-2">
                    {profile?.createdAt 
                      ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={saving || !name.trim() || name === profile?.name}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription & Billing
              </CardTitle>
              <CardDescription>
                Manage your subscription plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Current Plan</h4>
                  <p className="text-sm text-gray-600">
                    {profile?.subscriptionTier === 'FREE' 
                      ? 'Free plan with 10 searches per month'
                      : profile?.subscriptionTier === 'PRO'
                      ? 'Pro plan with unlimited searches'
                      : profile?.subscriptionTier === 'TEAM'
                      ? 'Team plan with advanced features'
                      : 'Admin access'}
                  </p>
                </div>
                <div className="text-right">
                  {profile && getSubscriptionBadge(profile.subscriptionTier)}
                </div>
              </div>
              
              {profile?.subscriptionTier === 'FREE' && (
                <div className="flex justify-between items-center p-4 border border-sky-200 bg-sky-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sky-900">Upgrade to Pro</h4>
                    <p className="text-sm text-sky-700">
                      Get unlimited searches, advanced analytics, and priority support
                    </p>
                  </div>
                  <Button onClick={() => router.push('/upgrade')}>
                    Upgrade Now
                  </Button>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => router.push('/pricing')}>
                  View All Plans
                </Button>
                {profile?.subscriptionTier !== 'FREE' && (
                  <Button variant="outline">
                    Manage Billing
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive updates about your account and new features</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-sky-600 focus:ring-sky-500" defaultChecked />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">Search Limit Alerts</h4>
                    <p className="text-sm text-gray-600">Get notified when approaching your monthly search limit</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-sky-600 focus:ring-sky-500" defaultChecked />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">Forum Activity</h4>
                    <p className="text-sm text-gray-600">Notifications about replies to your forum posts</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-sky-600 focus:ring-sky-500" />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="outline">
                  Save Notification Preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Privacy
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline">
                  Change Password
                </Button>
                <Button variant="outline">
                  Download My Data
                </Button>
                <Button variant="outline">
                  Privacy Settings
                </Button>
                <Button variant="outline" className="bg-red-600 text-white border-red-600 hover:bg-red-700">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
} 