'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedCompanyGrid } from '@/components/orgs/EnhancedCompanyGrid';
import { EnhancedContactCard } from '@/components/orgs/EnhancedContactCard';
import { MobileCompanyBrowser } from '@/components/mobile/MobileCompanyBrowser';
import { 
  Building2, 
  Users, 
  Smartphone, 
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';

export default function EnhancedOrgsPage() {
  const [activeTab, setActiveTab] = useState('companies');

  // Mock data that demonstrates the enhanced features
  const mockCompanies = [
    {
      id: '1',
      name: 'Nike',
      logoUrl: 'https://logo.clearbit.com/nike.com',
      location: 'Beaverton, OR',
      teamCount: 156,
      industry: 'Sportswear',
      tier: 'enterprise' as const,
      verified: true,
      recentActivity: 'Updated 2 hours ago'
    },
    {
      id: '2',
      name: 'Spotify',
      logoUrl: 'https://logo.clearbit.com/spotify.com',
      location: 'Stockholm, Sweden',
      teamCount: 89,
      industry: 'Technology',
      tier: 'growth' as const,
      verified: true,
      recentActivity: 'Updated 5 hours ago'
    },
    {
      id: '3',
      name: 'Airbnb',
      logoUrl: 'https://logo.clearbit.com/airbnb.com',
      location: 'San Francisco, CA',
      teamCount: 234,
      industry: 'Travel',
      tier: 'enterprise' as const,
      verified: false,
      recentActivity: 'Updated 1 day ago'
    },
    {
      id: '4',
      name: 'Shopify',
      logoUrl: 'https://logo.clearbit.com/shopify.com',
      location: 'Ottawa, Canada',
      teamCount: 78,
      industry: 'E-commerce',
      tier: 'growth' as const,
      verified: true,
      recentActivity: 'Updated 3 hours ago'
    },
    {
      id: '5',
      name: 'Figma',
      logoUrl: 'https://logo.clearbit.com/figma.com',
      location: 'San Francisco, CA',
      teamCount: 45,
      industry: 'Design',
      tier: 'startup' as const,
      verified: true,
      recentActivity: 'Updated 6 hours ago'
    },
    {
      id: '6',
      name: 'Notion',
      logoUrl: 'https://logo.clearbit.com/notion.so',
      location: 'San Francisco, CA',
      teamCount: 67,
      industry: 'Productivity',
      tier: 'growth' as const,
      verified: true,
      recentActivity: 'Updated 4 hours ago'
    }
  ];

  const mockContacts = [
    {
      id: '1',
      fullName: 'Sarah Johnson',
      title: 'VP of Marketing',
      company: {
        id: '1',
        name: 'Nike',
        city: 'Beaverton',
        state: 'OR',
        verified: true
      },
      email: 'sarah.johnson@nike.com',
      phone: '+1 (503) 555-0123',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
      seniority: 'VP',
      department: 'Marketing',
      verified: true,
      lastActive: '2 hours ago',
      roles: ['Marketing', 'Brand Strategy', 'Digital']
    },
    {
      id: '2',
      fullName: 'Michael Chen',
      title: 'Senior Product Manager',
      company: {
        id: '2',
        name: 'Spotify',
        city: 'Stockholm',
        state: 'Sweden',
        verified: true
      },
      email: 'michael.chen@spotify.com',
      linkedinUrl: 'https://linkedin.com/in/michaelchen',
      seniority: 'Manager',
      department: 'Product',
      verified: false,
      lastActive: '5 hours ago',
      roles: ['Product Management', 'Strategy']
    },
    {
      id: '3',
      fullName: 'Emily Rodriguez',
      title: 'Chief Technology Officer',
      company: {
        id: '4',
        name: 'Shopify',
        city: 'Ottawa',
        state: 'Canada',
        verified: true
      },
      email: 'emily.rodriguez@shopify.com',
      phone: '+1 (613) 555-0456',
      linkedinUrl: 'https://linkedin.com/in/emilyrodriguez',
      seniority: 'C-Level',
      department: 'Technology',
      verified: true,
      lastActive: '1 hour ago',
      roles: ['Engineering', 'Leadership', 'Technology Strategy']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Next-Generation
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Business Directory
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Experience the future of B2B networking with enhanced company profiles, 
              smart contact cards, and mobile-first design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center space-x-2 text-blue-100">
                <Sparkles className="w-5 h-5" />
                <span>5+ Years More Advanced than SellerCrowd</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-100">
                <Smartphone className="w-5 h-5" />
                <span>Mobile-First Design</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-100">
                <Award className="w-5 h-5" />
                <span>Premium Data Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why DealMecca Dominates</h2>
          <p className="text-gray-600 text-lg">See the difference modern design and smart features make</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* SellerCrowd */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">SellerCrowd (Outdated)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-600">
                <li>❌ Basic gray/white design from 2019</li>
                <li>❌ Zero mobile optimization</li>
                <li>❌ Simple email links only</li>
                <li>❌ No visual hierarchy</li>
                <li>❌ Limited contact information</li>
                <li>❌ No data enrichment</li>
                <li>❌ Poor user experience</li>
              </ul>
            </CardContent>
          </Card>

          {/* DealMecca */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-700">DealMecca (Modern)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li>✅ Modern gradients & tier indicators</li>
                <li>✅ Mobile-first responsive design</li>
                <li>✅ Smart action buttons (email, call, LinkedIn)</li>
                <li>✅ Beautiful company logos & avatars</li>
                <li>✅ Rich contact profiles with seniority badges</li>
                <li>✅ AI-powered data enrichment</li>
                <li>✅ Superior user experience</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="companies" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Companies</span>
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Contacts</span>
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4" />
                <span>Mobile</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="companies" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enhanced Company Grid</h3>
              <p className="text-gray-600">Modern company cards with tier indicators, action buttons, and rich data</p>
            </div>
            <EnhancedCompanyGrid companies={mockCompanies} />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Smart Contact Cards</h3>
              <p className="text-gray-600">Professional contact profiles with seniority badges and instant actions</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockContacts.map((contact) => (
                <EnhancedContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Mobile-First Experience</h3>
              <p className="text-gray-600">SellerCrowd doesn't work on mobile - we dominate mobile completely</p>
            </div>
            <div className="max-w-sm mx-auto border-8 border-gray-800 rounded-[2rem] overflow-hidden bg-black">
              <MobileCompanyBrowser companies={mockCompanies} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Experience the Future?</h3>
            <p className="text-blue-100 mb-6">
              Join thousands of professionals who've upgraded from outdated platforms
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
