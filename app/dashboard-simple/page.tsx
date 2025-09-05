'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ForumLayout } from '@/components/layout/ForumLayout';
import { 
  MessageSquare, 
  Search, 
  Building2, 
  Users, 
  ArrowRight, 
  Crown, 
  Calendar,
  BarChart3
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  subscriptionTier: string;
  createdAt: string;
  _count: {
    posts: number;
    comments: number;
  };
}

export default function SimpleDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchProfile();
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <ForumLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ForumLayout>
    );
  }

  return (
    <ForumLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name || 'User'}
          </h1>
          <p className="text-lg text-gray-600">
            Jump into the community or explore what's new
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/forum')}>
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Join Discussions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-3">
                Connect with media professionals and share insights
              </p>
              <Button variant="ghost" size="sm" className="p-0 h-auto font-medium text-blue-600">
                Go to Forum <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/search')}>
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Search Database</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-3">
                Find companies and contacts in the media industry
              </p>
              <Button variant="ghost" size="sm" className="p-0 h-auto font-medium text-green-600">
                Start Searching <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/org-charts')}>
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Org Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-3">
                Explore company hierarchies and find decision makers
              </p>
              <Button variant="ghost" size="sm" className="p-0 h-auto font-medium text-purple-600">
                Explore <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/contacts')}>
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-3">
                Manage and organize your professional network
              </p>
              <Button variant="ghost" size="sm" className="p-0 h-auto font-medium text-orange-600">
                View Contacts <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Account Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-gray-600" />
              Account Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Crown className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-semibold text-gray-900">{profile?.subscriptionTier}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-semibold text-gray-900">
                  {profile?.createdAt 
                    ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })
                    : 'N/A'}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-teal-600" />
                <p className="text-sm text-gray-600">Forum Posts</p>
                <p className="font-semibold text-gray-900">{profile?._count?.posts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA to Forum */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to connect?
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Join ongoing discussions, share your insights, and connect with other media professionals in our active community forum.
            </p>
            <Button 
              size="lg"
              onClick={() => router.push('/forum')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Go to Community Forum
            </Button>
          </CardContent>
        </Card>
      </div>
    </ForumLayout>
  );
}