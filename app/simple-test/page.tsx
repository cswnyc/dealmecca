'use client';

import { EnhancedCompanyGrid } from '@/components/orgs/EnhancedCompanyGrid';
import { EnhancedContactCard } from '@/components/orgs/EnhancedContactCard';

// Simple test page that bypasses all middleware and auth
export default function SimpleTestPage() {
  const testCompanies = [
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
    }
  ];

  const testContact = {
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
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ✅ Enhanced Components Test
          </h1>
          <p className="text-gray-600">
            Simple test page to verify enhanced components work correctly
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Enhanced Company Grid</h2>
          <EnhancedCompanyGrid companies={testCompanies} />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Enhanced Contact Card</h2>
          <div className="max-w-lg">
            <EnhancedContactCard contact={testContact} />
          </div>
        </div>

        <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            🎉 Components Working!
          </h3>
          <p className="text-green-700">
            If you can see this page with styled components, 
            your enhanced DealMecca components are working correctly.
          </p>
        </div>
      </div>
    </div>
  );
}
