'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Building2, Users, Search, Upload, FileText, CheckCircle, XCircle, Network, Filter, Plus, MapPin, ChevronDown, X, Globe, User, Briefcase, BarChart3, Tv, Satellite, Monitor } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchHighlight } from '@/components/ui/SearchHighlight';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { AddEntityModal } from '@/components/org-charts/AddEntityModal';

// Force dynamic rendering for user-specific content
export const dynamic = 'force-dynamic'

interface Company {
  id: string;
  name: string;
  companyType: string;
  industry: string;
  city: string;
  state: string;
  verified: boolean;
  logoUrl?: string;
  _count: {
    contacts: number;
  };
}

interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  subscriptionTier: string;
}

interface BulkUploadResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    contact: string;
    error: string;
  }>;
}

interface Agency {
  id: string
  name: string
  type: 'INDEPENDENT_AGENCY' | 'HOLDING_COMPANY_AGENCY' | 'NETWORK_AGENCY'
  city: string
  state: string
  country?: string
  verified: boolean
  logoUrl?: string
  teamCount: number
  lastActivity: string
  clients: Array<{
    id: string
    name: string
    industry: string
    logoUrl?: string
    verified: boolean
  }>
}

const MOCK_AGENCIES: Agency[] = [
  {
    id: '1',
    name: 'Kinesso SF',
    type: 'NETWORK_AGENCY',
    city: 'San Francisco',
    state: 'CA',
    verified: true,
    teamCount: 12,
    lastActivity: '2 hrs',
    clients: [
      { id: '1', name: 'DoPro', industry: 'TECHNOLOGY', verified: true },
      { id: '2', name: 'Boeing', industry: 'AEROSPACE', verified: true },
      { id: '3', name: 'GrubHub', industry: 'FOOD_DELIVERY', verified: true }
    ]
  },
  {
    id: '2',
    name: 'OMD Chicago',
    type: 'NETWORK_AGENCY',
    city: 'Chicago',
    state: 'IL',
    verified: true,
    teamCount: 22,
    lastActivity: '2 hrs',
    clients: [
      { id: '4', name: 'Amazon', industry: 'E_COMMERCE', verified: true },
      { id: '5', name: 'State Farm', industry: 'INSURANCE', verified: true },
      { id: '6', name: 'Pepsi Co', industry: 'FOOD_BEVERAGE', verified: true }
    ]
  },
  {
    id: '3',
    name: 'The Marketing Practice Denver',
    type: 'INDEPENDENT_AGENCY',
    city: 'Denver',
    state: 'CO',
    verified: true,
    teamCount: 8,
    lastActivity: '3 hrs',
    clients: [
      { id: '7', name: 'Commvault', industry: 'TECHNOLOGY', verified: true },
      { id: '8', name: 'GE Aerospace', industry: 'AEROSPACE', verified: true }
    ]
  },
  {
    id: '4',
    name: 'Billups NY',
    type: 'INDEPENDENT_AGENCY',
    city: 'New York City',
    state: 'NY',
    verified: true,
    teamCount: 81,
    lastActivity: '3 hrs',
    clients: [
      { id: '9', name: 'University of Virginia', industry: 'EDUCATION', verified: true },
      { id: '10', name: 'Kennedy Space Center', industry: 'AEROSPACE', verified: true },
      { id: '11', name: 'Etihad Airways', industry: 'TRAVEL', verified: true }
    ]
  },
  {
    id: '5',
    name: 'EssenceMediacom NY',
    type: 'NETWORK_AGENCY',
    city: 'New York City',
    state: 'NY',
    verified: true,
    teamCount: 49,
    lastActivity: '3 hrs',
    clients: [
      { id: '12', name: 'NBCUniversal', industry: 'ENTERTAINMENT_MEDIA', verified: true },
      { id: '13', name: 'Google', industry: 'TECHNOLOGY', verified: true },
      { id: '14', name: 'Target', industry: 'RETAIL', verified: true }
    ]
  },
  {
    id: '6',
    name: 'Wieden+Kennedy',
    type: 'INDEPENDENT_AGENCY',
    city: 'Portland',
    state: 'OR',
    verified: true,
    teamCount: 67,
    lastActivity: '4 hrs',
    clients: [
      { id: '15', name: 'Nike', industry: 'SPORTS_APPAREL', verified: true },
      { id: '16', name: 'Old Spice', industry: 'PERSONAL_CARE', verified: true },
      { id: '17', name: 'Chrysler', industry: 'AUTOMOTIVE', verified: true }
    ]
  },
  {
    id: '7',
    name: 'GroupM',
    type: 'HOLDING_COMPANY_AGENCY',
    city: 'New York City',
    state: 'NY',
    verified: true,
    teamCount: 89,
    lastActivity: '1 hr',
    clients: [
      { id: '18', name: 'Unilever', industry: 'CONSUMER_GOODS', verified: true },
      { id: '19', name: 'HSBC', industry: 'FINANCIAL_SERVICES', verified: true },
      { id: '20', name: 'Nestlé', industry: 'FOOD_BEVERAGE', verified: true }
    ]
  },
  {
    id: '8',
    name: 'Publicis Media',
    type: 'HOLDING_COMPANY_AGENCY',
    city: 'Chicago',
    state: 'IL',
    verified: true,
    teamCount: 71,
    lastActivity: '2 hrs',
    clients: [
      { id: '21', name: 'Samsung', industry: 'ELECTRONICS', verified: true },
      { id: '22', name: 'Walmart', industry: 'RETAIL', verified: true },
      { id: '23', name: 'Procter & Gamble', industry: 'CONSUMER_GOODS', verified: true }
    ]
  },
  {
    id: '9',
    name: 'Havas Media',
    type: 'HOLDING_COMPANY_AGENCY',
    city: 'Los Angeles',
    state: 'CA',
    verified: true,
    teamCount: 54,
    lastActivity: '5 hrs',
    clients: [
      { id: '24', name: 'Reckitt', industry: 'CONSUMER_GOODS', verified: true },
      { id: '25', name: 'Hyundai', industry: 'AUTOMOTIVE', verified: true },
      { id: '26', name: 'Pernod Ricard', industry: 'BEVERAGES', verified: true }
    ]
  },
  {
    id: '10',
    name: 'IPG Mediabrands',
    type: 'HOLDING_COMPANY_AGENCY',
    city: 'New York City',
    state: 'NY',
    verified: true,
    teamCount: 93,
    lastActivity: '3 hrs',
    clients: [
      { id: '27', name: 'Johnson & Johnson', industry: 'HEALTHCARE', verified: true },
      { id: '28', name: 'Spotify', industry: 'ENTERTAINMENT_MEDIA', verified: true },
      { id: '29', name: 'American Express', industry: 'FINANCIAL_SERVICES', verified: true }
    ]
  },
  {
    id: '11',
    name: 'Dentsu',
    type: 'HOLDING_COMPANY_AGENCY',
    city: 'New York City',
    state: 'NY',
    verified: true,
    teamCount: 76,
    lastActivity: '4 hrs',
    clients: [
      { id: '30', name: 'Toyota', industry: 'AUTOMOTIVE', verified: true },
      { id: '31', name: 'Microsoft', industry: 'TECHNOLOGY', verified: true },
      { id: '32', name: 'General Mills', industry: 'FOOD_BEVERAGE', verified: true }
    ]
  },
  {
    id: '12',
    name: 'R/GA',
    type: 'INDEPENDENT_AGENCY',
    city: 'New York City',
    state: 'NY',
    verified: true,
    teamCount: 45,
    lastActivity: '6 hrs',
    clients: [
      { id: '33', name: 'Nike', industry: 'SPORTS_APPAREL', verified: true },
      { id: '34', name: 'Samsung', industry: 'ELECTRONICS', verified: true },
      { id: '35', name: 'Google', industry: 'TECHNOLOGY', verified: true }
    ]
  },
  {
    id: '13',
    name: 'BBDO',
    type: 'HOLDING_COMPANY_AGENCY',
    city: 'New York City',
    state: 'NY',
    verified: true,
    teamCount: 82,
    lastActivity: '2 hrs',
    clients: [
      { id: '36', name: 'PepsiCo', industry: 'FOOD_BEVERAGE', verified: true },
      { id: '37', name: 'AT&T', industry: 'TELECOMMUNICATIONS', verified: true },
      { id: '38', name: 'Visa', industry: 'FINANCIAL_SERVICES', verified: true }
    ]
  },
  {
    id: '14',
    name: 'DDB',
    type: 'HOLDING_COMPANY_AGENCY',
    city: 'New York City',
    state: 'NY',
    verified: true,
    teamCount: 67,
    lastActivity: '5 hrs',
    clients: [
      { id: '39', name: 'McDonald\'s', industry: 'FOOD_BEVERAGE', verified: true },
      { id: '40', name: 'Volkswagen', industry: 'AUTOMOTIVE', verified: true },
      { id: '41', name: 'State Farm', industry: 'INSURANCE', verified: true }
    ]
  },
  {
    id: '15',
    name: 'McCann',
    type: 'HOLDING_COMPANY_AGENCY',
    city: 'New York City',
    state: 'NY',
    verified: true,
    teamCount: 74,
    lastActivity: '3 hrs',
    clients: [
      { id: '42', name: 'Coca-Cola', industry: 'BEVERAGES', verified: true },
      { id: '43', name: 'Mastercard', industry: 'FINANCIAL_SERVICES', verified: true },
      { id: '44', name: 'L\'Oréal', industry: 'BEAUTY', verified: true }
    ]
  },
  {
    id: '16',
    name: 'Ogilvy',
    type: 'HOLDING_COMPANY_AGENCY',
    city: 'New York City',
    state: 'NY',
    verified: true,
    teamCount: 69,
    lastActivity: '4 hrs',
    clients: [
      { id: '45', name: 'IBM', industry: 'TECHNOLOGY', verified: true },
      { id: '46', name: 'Unilever', industry: 'CONSUMER_GOODS', verified: true },
      { id: '47', name: 'Ford', industry: 'AUTOMOTIVE', verified: true }
    ]
  },
  {
    id: '17',
    name: 'AKQA',
    type: 'INDEPENDENT_AGENCY',
    city: 'San Francisco',
    state: 'CA',
    verified: true,
    teamCount: 38,
    lastActivity: '7 hrs',
    clients: [
      { id: '48', name: 'Nike', industry: 'SPORTS_APPAREL', verified: true },
      { id: '49', name: 'Audi', industry: 'AUTOMOTIVE', verified: true },
      { id: '50', name: 'Xbox', industry: 'GAMING', verified: true }
    ]
  },
  {
    id: '18',
    name: 'Droga5',
    type: 'INDEPENDENT_AGENCY',
    city: 'New York City',
    state: 'NY',
    verified: true,
    teamCount: 52,
    lastActivity: '5 hrs',
    clients: [
      { id: '51', name: 'Under Armour', industry: 'SPORTS_APPAREL', verified: true },
      { id: '52', name: 'The New York Times', industry: 'MEDIA', verified: true },
      { id: '53', name: 'Puma', industry: 'SPORTS_APPAREL', verified: true }
    ]
  }
]

const INDUSTRY_COLORS: Record<string, string> = {
  'TECHNOLOGY': 'bg-blue-100 text-blue-800',
  'AEROSPACE': 'bg-purple-100 text-purple-800',
  'FOOD_DELIVERY': 'bg-orange-100 text-orange-800',
  'E_COMMERCE': 'bg-green-100 text-green-800',
  'INSURANCE': 'bg-red-100 text-red-800',
  'FOOD_BEVERAGE': 'bg-amber-100 text-amber-800',
  'EDUCATION': 'bg-indigo-100 text-indigo-800',
  'TRAVEL': 'bg-pink-100 text-pink-800',
  'ENTERTAINMENT_MEDIA': 'bg-violet-100 text-violet-800',
  'RETAIL': 'bg-emerald-100 text-emerald-800',
  'SPORTS_APPAREL': 'bg-lime-100 text-lime-800',
  'PERSONAL_CARE': 'bg-cyan-100 text-cyan-800',
  'AUTOMOTIVE': 'bg-slate-100 text-slate-800',
  'CONSUMER_GOODS': 'bg-amber-100 text-amber-800',
  'FINANCIAL_SERVICES': 'bg-teal-100 text-teal-800',
  'ELECTRONICS': 'bg-sky-100 text-sky-800',
  'BEVERAGES': 'bg-rose-100 text-rose-800',
  'HEALTHCARE': 'bg-fuchsia-100 text-fuchsia-800',
  'TELECOMMUNICATIONS': 'bg-violet-100 text-violet-800',
  'BEAUTY': 'bg-pink-100 text-pink-800',
  'GAMING': 'bg-purple-100 text-purple-800',
  'MEDIA': 'bg-gray-100 text-gray-800'
}

export default function OrganizationsPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false); // Use mock data immediately
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Agency view state - Start with empty, will fetch from API
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);
  const [activeTab, setActiveTab] = useState<'agencies' | 'advertisers' | 'people' | 'industries' | 'publisher' | 'dsp-ssp' | 'adtech'>('agencies');

  const [showAddEntityModal, setShowAddEntityModal] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<'agency' | 'advertiser' | 'person'>('agency');

  // Persistent filter states across all tabs
  const [filterState, setFilterState] = useState({
    agencyType: 'all',
    geography: 'all',
    industry: 'all',
    status: 'all',
    client: 'all',
    clientIndustry: 'all',
    duty: 'all'
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  // Helper functions for agency view
  const getAgencyTypeLabel = (type: string) => {
    switch (type) {
      case 'INDEPENDENT_AGENCY': return 'Independent Agency';
      case 'HOLDING_COMPANY_AGENCY': return 'Holding Company';
      case 'NETWORK_AGENCY': return 'Network Agency';
      default: return type;
    }
  };

  const getAgencyTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'INDEPENDENT_AGENCY': return 'bg-green-100 text-green-800';
      case 'HOLDING_COMPANY_AGENCY': return 'bg-blue-100 text-blue-800';
      case 'NETWORK_AGENCY': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock data for client relationships
  const getCompanyClients = (companyId: string) => {
    const agency = agencies.find(a => a.id === companyId);
    if (agency && agency.clients) {
      return agency.clients.map(c => c.name);
    }

    const clientData: Record<string, string[]> = {
      '1': ['Nike', 'Adidas', 'Under Armour'],
      '2': ['Coca-Cola', 'Pepsi', 'Dr Pepper'],
      '3': ['Apple', 'Microsoft', 'Google'],
      '4': ['McDonald\'s', 'Burger King', 'KFC'],
      '5': ['Toyota', 'Honda', 'Ford']
    };
    return clientData[companyId] || ['Client A', 'Client B'];
  };

  const toggleCompanyExpansion = (companyId: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue as any);
  };

  // Set admin status based on Firebase user
  useEffect(() => {
    if (firebaseUser && (firebaseUser as any).role === 'ADMIN') {
      setIsAdmin(true);
    }
  }, [firebaseUser]);

  // Fetch agencies from API
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/organizations/agencies', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setAgencies(data.agencies || []);
        } else {
          console.error('Failed to fetch agencies:', response.statusText);
          setError('Failed to load agencies');
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
        setError('Failed to load agencies');
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  // Agency filtering
  useEffect(() => {
    if (!Array.isArray(agencies)) {
      setFilteredAgencies([]);
      return;
    }

    let filtered = [...agencies];

    if (searchQuery.trim()) {
      filtered = filtered.filter(agency =>
        (agency.name && agency.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (agency.city && agency.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (agency.state && agency.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (agency.clients && agency.clients.some(client =>
          client.name.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    if (filterState.agencyType !== 'all') {
      filtered = filtered.filter(agency => agency.type === filterState.agencyType);
    }

    if (filterState.geography !== 'all') {
      filtered = filtered.filter(agency => agency.state === filterState.geography);
    }

    setFilteredAgencies(filtered);
  }, [searchQuery, agencies, filterState.agencyType, filterState.geography]);

  // Early return for loading state - must come after all hooks
  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-full bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
      <div className="min-h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Building2 className="h-8 w-8 mr-3 text-sky-600" />
                    Organizations
                  </h1>
                  <p className="mt-1 text-gray-600">
                    Explore deal connections and partnership opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 pb-6 mb-6">
              {/* Tab Navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {[
                    { id: 'agencies', label: 'Agencies', icon: Building2 },
                    { id: 'advertisers', label: 'Advertisers', icon: Globe },
                    { id: 'people', label: 'People', icon: User },
                    { id: 'industries', label: 'Industries', icon: Briefcase },
                    { id: 'publisher', label: 'Publisher', icon: Monitor },
                    { id: 'dsp-ssp', label: 'DSP/SSP', icon: Satellite },
                    { id: 'adtech', label: 'Adtech', icon: BarChart3 }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search Bar and Action Buttons */}
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder={
                      activeTab === 'agencies' ? 'Search agencies...' :
                      activeTab === 'advertisers' ? 'Search advertisers...' :
                      activeTab === 'people' ? 'Search people...' :
                      activeTab === 'industries' ? 'Search industries...' :
                      activeTab === 'publisher' ? 'Search publishers...' :
                      activeTab === 'dsp-ssp' ? 'Search DSP/SSP...' :
                      'Search adtech...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-white shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex space-x-2">
                  {activeTab === 'agencies' && (
                    <Button onClick={() => {
                      setSelectedEntityType('agency');
                      setShowAddEntityModal(true);
                    }} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Agency
                    </Button>
                  )}
                  {activeTab === 'advertisers' && (
                    <Button
                      onClick={() => {
                        setSelectedEntityType('advertiser');
                        setShowAddEntityModal(true);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Advertiser
                    </Button>
                  )}
                  {activeTab === 'people' && (
                    <Button
                      onClick={() => {
                        setSelectedEntityType('person');
                        setShowAddEntityModal(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Person
                    </Button>
                  )}
                  {activeTab === 'industries' && (
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Industry
                    </Button>
                  )}
                  {activeTab === 'publisher' && (
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Publisher
                    </Button>
                  )}
                  {activeTab === 'dsp-ssp' && (
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add DSP/SSP
                    </Button>
                  )}
                  {activeTab === 'adtech' && (
                    <Button className="bg-pink-600 hover:bg-pink-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Adtech
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'agencies' && (
              <div className="w-full">
                {/* Modern Stats Bar */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total Agencies</p>
                          <p className="text-2xl font-bold text-gray-900">{filteredAgencies.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Team Members</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {filteredAgencies.reduce((total, agency) => total + agency.teamCount, 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Verified Rate</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {filteredAgencies.length > 0
                              ? Math.round((filteredAgencies.filter(a => a.verified).length / filteredAgencies.length) * 100)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Filter Toggle */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors duration-200"
                    >
                      <Filter className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Filters</span>
                      <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Agencies List */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {searchQuery ? `Search Results (${filteredAgencies.length})` : 'Agency Directory'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {searchQuery ? `Found ${filteredAgencies.length} agencies matching your search` : 'Discover and connect with leading agencies'}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4">
                      {filteredAgencies.map((agency) => (
                        <div key={agency.id} className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <CompanyLogo
                                logoUrl={agency.logoUrl}
                                companyName={agency.name}
                                size="lg"
                                className="rounded-xl"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <Link href={`/orgs/companies/${agency.id}`} className="group">
                                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        <SearchHighlight
                                          text={agency.name}
                                          searchTerm={searchQuery}
                                          highlightClassName="bg-sky-100 text-sky-900 px-1 rounded font-semibold"
                                        />
                                      </h3>
                                    </Link>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAgencyTypeBadgeColor(agency.type)}`}>
                                        {getAgencyTypeLabel(agency.type)}
                                      </span>
                                      {(agency.city || agency.state) && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                          <MapPin className="w-3 h-3 mr-1" />
                                          <SearchHighlight
                                            text={`${agency.city || ''}, ${agency.state || ''}`.replace(/^,\s*|\s*,$/g, '')}
                                            searchTerm={searchQuery}
                                            highlightClassName="bg-sky-100 text-sky-900 px-1 rounded font-medium"
                                          />
                                        </span>
                                      )}
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                        <Network className="w-3 h-3 mr-1" />
                                        Org Chart
                                      </span>
                                      {agency.verified && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Verified
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Users className="w-4 h-4" />
                                    <span>{agency.teamCount} people</span>
                                  </div>
                                </div>
                                {/* Client/Advertiser Pills */}
                                <div className="mt-2 mb-1">
                                  <div className="flex flex-wrap gap-1">
                                    {agency.clients?.slice(0, expandedCompanies.has(agency.id) ? undefined : 3).map((client, index) => (
                                      <span
                                        key={index}
                                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${INDUSTRY_COLORS[client.industry] || 'bg-gray-50 text-gray-700'}`}
                                      >
                                        <SearchHighlight
                                          text={client.name}
                                          searchTerm={searchQuery}
                                          highlightClassName="bg-sky-100 text-sky-900 px-1 rounded font-medium"
                                        />
                                      </span>
                                    ))}
                                    {agency.clients && agency.clients.length > 3 && (
                                      <button
                                        onClick={() => toggleCompanyExpansion(agency.id)}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                      >
                                        {expandedCompanies.has(agency.id)
                                          ? 'Show less'
                                          : `+${agency.clients.length - 3} more clients`
                                        }
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Tab Contents */}
            {activeTab === 'advertisers' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Advertisers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Advertiser directory coming soon...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === 'people' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>People</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">People directory coming soon...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === 'industries' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5" />
                    <span>Industries</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Industry analysis coming soon...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === 'publisher' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5" />
                    <span>Publishers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Publisher directory coming soon...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === 'dsp-ssp' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Satellite className="h-5 w-5" />
                    <span>DSP/SSP</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">DSP/SSP directory coming soon...</p>
                </CardContent>
              </Card>
            )}

            {activeTab === 'adtech' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Adtech</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Adtech directory coming soon...</p>
                </CardContent>
              </Card>
            )}

            {/* Add Entity Modal */}
            {showAddEntityModal && (
              <AddEntityModal
                isOpen={showAddEntityModal}
                onClose={() => setShowAddEntityModal(false)}
                entityType={selectedEntityType}
                onEntityAdded={(entity) => {
                  console.log('Entity added:', entity);
                  // Refresh the companies list if needed
                  if (selectedEntityType === 'agency') {
                    window.location.reload();
                  }
                }}
              />
            )}

            {/* Persistent Filter Panel */}
            {showFilters && (
              <div className="bg-white border border-gray-200 rounded-xl mb-6 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
                  <p className="text-sm text-gray-600 mt-1">Refine your search to find the perfect agency partners</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* By Agency Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">Agency Type</label>
                      <Select
                        value={filterState.agencyType}
                        onValueChange={(value) => setFilterState(prev => ({...prev, agencyType: value}))}
                      >
                        <SelectTrigger className="w-full h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select agency type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="INDEPENDENT_AGENCY">Independent Agency</SelectItem>
                          <SelectItem value="HOLDING_COMPANY_AGENCY">Holding Company</SelectItem>
                          <SelectItem value="NETWORK_AGENCY">Network Agency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* By Location */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">Location</label>
                      <Select
                        value={filterState.geography}
                        onValueChange={(value) => setFilterState(prev => ({...prev, geography: value}))}
                      >
                        <SelectTrigger className="w-full h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="IL">Illinois</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          <SelectItem value="OR">Oregon</SelectItem>
                          <SelectItem value="CO">Colorado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* By Client */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">Client</label>
                      <Select
                        value={filterState.client}
                        onValueChange={(value) => setFilterState(prev => ({...prev, client: value}))}
                      >
                        <SelectTrigger className="w-full h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Clients</SelectItem>
                          <SelectItem value="nike">Nike</SelectItem>
                          <SelectItem value="coca-cola">Coca-Cola</SelectItem>
                          <SelectItem value="apple">Apple</SelectItem>
                          <SelectItem value="mcdonalds">McDonald's</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="samsung">Samsung</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* By Client Industry */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">Client Industry</label>
                      <Select
                        value={filterState.clientIndustry}
                        onValueChange={(value) => setFilterState(prev => ({...prev, clientIndustry: value}))}
                      >
                        <SelectTrigger className="w-full h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Industries</SelectItem>
                          <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                          <SelectItem value="RETAIL">Retail</SelectItem>
                          <SelectItem value="AUTOMOTIVE">Automotive</SelectItem>
                          <SelectItem value="FOOD_BEVERAGE">Food & Beverage</SelectItem>
                          <SelectItem value="FINANCIAL_SERVICES">Financial Services</SelectItem>
                          <SelectItem value="SPORTS_APPAREL">Sports & Apparel</SelectItem>
                          <SelectItem value="ENTERTAINMENT_MEDIA">Entertainment & Media</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                {/* Filter Actions */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {activeTab === 'agencies' && `Showing ${filteredAgencies.length} of ${agencies.length} agencies`}
                    {activeTab !== 'agencies' && `Filters applied to ${activeTab}`}
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setFilterState({
                        agencyType: 'all',
                        geography: 'all',
                        industry: 'all',
                        status: 'all',
                        client: 'all',
                        clientIndustry: 'all',
                        duty: 'all'
                      })}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
    </AuthGuard>
  );
}