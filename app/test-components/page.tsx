'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedCompanyGrid } from '@/components/orgs/EnhancedCompanyGrid';
import { EnhancedContactCard } from '@/components/orgs/EnhancedContactCard';
import { MobileCompanyBrowser } from '@/components/mobile/MobileCompanyBrowser';
import { BulkCompanyUpload } from '@/components/admin/BulkCompanyUpload';
import { DataEnrichment } from '@/components/admin/DataEnrichment';
import { 
  TestTube, 
  Smartphone, 
  Upload, 
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function TestComponentsPage() {
  const [testScenario, setTestScenario] = useState('normal');
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('company-grid');

  // Test data scenarios
  const normalCompanies = [
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
      name: 'Figma',
      logoUrl: 'https://logo.clearbit.com/figma.com',
      location: 'San Francisco, CA',
      teamCount: 45,
      industry: 'Design',
      tier: 'startup' as const,
      verified: false,
      recentActivity: 'Updated 1 day ago'
    }
  ];

  const stressTestCompanies = Array.from({length: 50}, (_, i) => ({
    id: `stress-${i}`,
    name: `Test Company ${i + 1}`,
    logoUrl: i % 3 === 0 ? 'https://logo.clearbit.com/test.com' : undefined,
    location: `City ${i + 1}, State`,
    teamCount: Math.floor(Math.random() * 1000) + 10,
    industry: ['Technology', 'Marketing', 'Finance', 'Healthcare'][i % 4],
    tier: (['enterprise', 'growth', 'startup'] as const)[i % 3],
    verified: i % 2 === 0,
    recentActivity: `Updated ${Math.floor(Math.random() * 24)} hours ago`
  }));

  const emptyDataCompany = {
    id: 'empty',
    name: 'Empty Data Test Company',
    // Missing: logoUrl, location, teamCount, etc.
  };

  const longDataCompany = {
    id: 'long',
    name: 'This Is An Extremely Long Company Name That Should Test Text Overflow And Layout Breaking Scenarios Inc.',
    location: 'Very Long City Name That Might Break The Layout, An Extremely Long State Name',
    teamCount: 999999,
    industry: 'Very Long Industry Classification That Tests Text Wrapping',
    tier: 'enterprise' as const,
    verified: true,
    recentActivity: 'Updated with a very long activity description that tests text wrapping and overflow scenarios'
  };

  const testContacts = [
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
      fullName: 'Dr. Elizabeth Alexandra Catherine Smith-Johnson-Williams',
      title: 'Senior Vice President of International Business Development and Strategic Partnerships',
      company: {
        id: '2',
        name: 'Very Long Company Name That Tests Layout Breaking',
        city: 'San Francisco',
        state: 'CA',
        verified: false
      },
      email: 'very.long.email.address@very-long-domain-name.com',
      seniority: 'C-Level',
      verified: false,
      lastActive: '1 day ago'
    },
    {
      id: '3',
      fullName: 'John',
      title: 'Manager',
      company: {
        id: '3',
        name: 'Minimal Data Corp',
        verified: false
      },
      seniority: 'Manager',
      verified: false
    }
  ];

  const getTestData = () => {
    switch (testScenario) {
      case 'empty': return [];
      case 'single': return [normalCompanies[0]];
      case 'stress': return stressTestCompanies;
      case 'edge': return [emptyDataCompany, longDataCompany];
      default: return normalCompanies;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <TestTube className="w-8 h-8 mr-3 text-blue-600" />
                Component Testing Lab
              </h1>
              <p className="text-gray-600 mt-2">
                Test all enhanced components before deployment
              </p>
            </div>
            
            {/* Test Controls */}
            <div className="flex space-x-3">
              <Button
                variant={isMobile ? "default" : "outline"}
                onClick={() => setIsMobile(!isMobile)}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                {isMobile ? 'Desktop View' : 'Mobile View'}
              </Button>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Scenario Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { key: 'normal', label: 'Normal Data', icon: CheckCircle, color: 'text-green-600' },
                { key: 'empty', label: 'Empty State', icon: AlertTriangle, color: 'text-yellow-600' },
                { key: 'single', label: 'Single Item', icon: CheckCircle, color: 'text-blue-600' },
                { key: 'stress', label: 'Stress Test (50 items)', icon: AlertTriangle, color: 'text-orange-600' },
                { key: 'edge', label: 'Edge Cases', icon: AlertTriangle, color: 'text-red-600' }
              ].map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <Button
                    key={scenario.key}
                    variant={testScenario === scenario.key ? "default" : "outline"}
                    onClick={() => setTestScenario(scenario.key)}
                    className="flex flex-col items-center space-y-2 h-auto py-3"
                  >
                    <Icon className={`w-5 h-5 ${scenario.color}`} />
                    <span className="text-xs text-center">{scenario.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="company-grid">Company Grid</TabsTrigger>
            <TabsTrigger value="contact-cards">Contact Cards</TabsTrigger>
            <TabsTrigger value="mobile-browser">Mobile Browser</TabsTrigger>
            <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
            <TabsTrigger value="data-enrichment">Data Enrichment</TabsTrigger>
          </TabsList>

          <TabsContent value="company-grid" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">EnhancedCompanyGrid Testing</h2>
              <p className="text-gray-600">
                Current scenario: <strong>{testScenario}</strong> | 
                Items: <strong>{getTestData().length}</strong>
              </p>
            </div>
            {isMobile ? (
              <div className="max-w-sm mx-auto border-4 border-gray-800 rounded-2xl overflow-hidden">
                <div className="bg-gray-100 p-4">
                  <EnhancedCompanyGrid 
                    companies={getTestData()} 
                    loading={testScenario === 'loading'}
                  />
                </div>
              </div>
            ) : (
              <EnhancedCompanyGrid 
                companies={getTestData()} 
                loading={testScenario === 'loading'}
              />
            )}
          </TabsContent>

          <TabsContent value="contact-cards" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">EnhancedContactCard Testing</h2>
              <p className="text-gray-600">Testing different contact data scenarios</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {testContacts.map((contact) => (
                <EnhancedContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mobile-browser" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">MobileCompanyBrowser Testing</h2>
              <p className="text-gray-600">Mobile-first company browsing experience</p>
            </div>
            <div className="max-w-sm mx-auto border-8 border-gray-800 rounded-[2rem] overflow-hidden bg-black">
              <MobileCompanyBrowser companies={getTestData()} />
            </div>
          </TabsContent>

          <TabsContent value="bulk-upload" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">BulkCompanyUpload Testing</h2>
              <p className="text-gray-600">Test CSV upload functionality</p>
            </div>
            <BulkCompanyUpload />
          </TabsContent>

          <TabsContent value="data-enrichment" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">DataEnrichment Testing</h2>
              <p className="text-gray-600">Test data enhancement options</p>
            </div>
            <DataEnrichment />
          </TabsContent>
        </Tabs>

        {/* Testing Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Testing Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">What to Test:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Component renders without errors</li>
                  <li>• Responsive behavior on different screen sizes</li>
                  <li>• Action buttons work correctly</li>
                  <li>• Loading states display properly</li>
                  <li>• Empty states show helpful messages</li>
                  <li>• Large datasets don't break layout</li>
                  <li>• Long text content handles gracefully</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Browser Testing:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Chrome (latest)</li>
                  <li>• Firefox (latest)</li>
                  <li>• Safari (latest)</li>
                  <li>• Edge (latest)</li>
                  <li>• iOS Safari (mobile)</li>
                  <li>• Chrome Mobile (Android)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
