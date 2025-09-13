'use client';

import { useState, useEffect } from 'react';
import { useFirebaseSession } from '@/hooks/useFirebaseSession';
import { useAuth } from '@/lib/auth/firebase-auth';
import { Building2, Users, Search, Upload, FileText, CheckCircle, XCircle, Network, Filter, Plus, MapPin, ChevronDown, X, Globe, User, Briefcase, BarChart3, Tv, Satellite, Monitor } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ForumLayout } from '@/components/layout/ForumLayout';
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

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  logoUrl?: string;
  department?: string;
  seniority: string;
  verified: boolean;
  isActive: boolean;
  company: {
    id: string;
    name: string;
    city: string;
    state: string;
    companyType: string;
    logoUrl?: string;
    verified: boolean;
  };
  createdAt: string;
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
  }
]

const INDUSTRY_COLORS: Record<string, string> = {
  'TECHNOLOGY': 'bg-blue-100 text-blue-800',
  'AEROSPACE': 'bg-purple-100 text-purple-800',
  'FOOD_DELIVERY': 'bg-orange-100 text-orange-800',
  'E_COMMERCE': 'bg-green-100 text-green-800',
  'INSURANCE': 'bg-red-100 text-red-800',
  'FOOD_BEVERAGE': 'bg-yellow-100 text-yellow-800',
  'EDUCATION': 'bg-indigo-100 text-indigo-800',
  'TRAVEL': 'bg-pink-100 text-pink-800',
  'ENTERTAINMENT_MEDIA': 'bg-violet-100 text-violet-800',
  'RETAIL': 'bg-emerald-100 text-emerald-800'
}

export default function OrgsPage() {
  const hasFirebaseSession = useFirebaseSession();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Agency view state
  const [agencies, setAgencies] = useState<Agency[]>(MOCK_AGENCIES);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>(MOCK_AGENCIES);
  const [activeTab, setActiveTab] = useState<'agencies' | 'advertisers' | 'people' | 'industries' | 'publisher' | 'dsp-ssp' | 'adtech'>('agencies');

  const [showAddEntityModal, setShowAddEntityModal] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<'agency' | 'advertiser' | 'person' | 'industry' | 'publisher' | 'dsp-ssp' | 'adtech'>('agency');

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

  // Authentication check - redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !firebaseUser && !hasFirebaseSession) {
      console.log('❌ No Firebase authentication found in orgs page, redirecting to signin');
      router.push('/auth/firebase-signin');
    }
  }, [authLoading, firebaseUser, hasFirebaseSession, router]);

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

  // Fetch companies data
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orgs/companies');
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        const data = await response.json();
        console.log('API response:', data); // Debug log
        if (data.success && Array.isArray(data.companies)) {
          setCompanies(data.companies);
          setFilteredCompanies(data.companies);
        } else {
          throw new Error(data.error || 'Invalid response format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch contacts data when People tab is accessed
  useEffect(() => {
    const fetchContacts = async () => {
      if (activeTab !== 'people') return;
      
      try {
        setContactsLoading(true);
        const response = await fetch('/api/orgs/contacts?limit=50');
        if (!response.ok) {
          throw new Error('Failed to fetch contacts');
        }
        const data = await response.json();
        console.log('Contacts API response:', data);
        if (data.success && Array.isArray(data.contacts)) {
          setContacts(data.contacts);
          setFilteredContacts(data.contacts);
        } else {
          throw new Error(data.error || 'Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      } finally {
        setContactsLoading(false);
      }
    };

    fetchContacts();
  }, [activeTab]);

  // Filter companies based on search and filters
  useEffect(() => {
    if (!Array.isArray(companies)) {
      setFilteredCompanies([]);
      return;
    }
    
    let filtered = [...companies];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(company =>
        (company.name && company.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (company.city && company.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (company.state && company.state.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply agency type filter
    if (filterState.agencyType !== 'all') {
      filtered = filtered.filter(company =>
        (company as any).agencyType === filterState.agencyType ||
        company.companyType === filterState.agencyType
      );
    }

    // Apply geography filter
    if (filterState.geography !== 'all') {
      filtered = filtered.filter(company =>
        company.state === filterState.geography
      );
    }

    // Apply industry filter (using clientIndustry for now)
    if (filterState.clientIndustry !== 'all') {
      filtered = filtered.filter(company =>
        company.industry === filterState.clientIndustry
      );
    }

    setFilteredCompanies(filtered);
  }, [searchQuery, companies, filterState]);

  // Set admin status based on Firebase user
  useEffect(() => {
    // For now, we'll skip admin privileges for Firebase users
    // This can be implemented later by fetching user profile or checking custom claims
    setIsAdmin(false);
  }, [firebaseUser]);

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
        (agency.state && agency.state.toLowerCase().includes(searchQuery.toLowerCase()))
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

  // Filter contacts based on search and filters
  useEffect(() => {
    if (!Array.isArray(contacts)) {
      setFilteredContacts([]);
      return;
    }
    
    let filtered = [...contacts];

    // Apply search filter
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(contact =>
        (contact.fullName && contact.fullName.toLowerCase().includes(searchTerm)) ||
        (contact.firstName && contact.firstName.toLowerCase().includes(searchTerm)) ||
        (contact.lastName && contact.lastName.toLowerCase().includes(searchTerm)) ||
        (contact.title && contact.title.toLowerCase().includes(searchTerm)) ||
        (contact.company.name && contact.company.name.toLowerCase().includes(searchTerm)) ||
        (contact.company.city && contact.company.city.toLowerCase().includes(searchTerm)) ||
        (contact.department && contact.department.toLowerCase().includes(searchTerm))
      );
    }

    // Apply company type filter
    if (filterState.agencyType !== 'all') {
      filtered = filtered.filter(contact =>
        contact.company.companyType === filterState.agencyType
      );
    }

    // Apply geography filter
    if (filterState.geography !== 'all') {
      filtered = filtered.filter(contact =>
        contact.company.state === filterState.geography
      );
    }

    setFilteredContacts(filtered);
  }, [searchQuery, contacts, filterState]);

  // Helper functions for contacts
  const getSeniorityBadgeColor = (seniority: string) => {
    switch (seniority) {
      case 'C_LEVEL': return 'bg-purple-100 text-purple-800';
      case 'VP_LEVEL': return 'bg-indigo-100 text-indigo-800';
      case 'DIRECTOR': return 'bg-blue-100 text-blue-800';
      case 'MANAGER': return 'bg-green-100 text-green-800';
      case 'SENIOR': return 'bg-yellow-100 text-yellow-800';
      case 'ASSOCIATE': return 'bg-orange-100 text-orange-800';
      case 'JUNIOR': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeniorityLabel = (seniority: string) => {
    switch (seniority) {
      case 'C_LEVEL': return 'C-Level';
      case 'VP_LEVEL': return 'VP Level';
      case 'DIRECTOR': return 'Director';
      case 'MANAGER': return 'Manager';
      case 'SENIOR': return 'Senior';
      case 'ASSOCIATE': return 'Associate';
      case 'JUNIOR': return 'Junior';
      default: return seniority.replace(/_/g, ' ');
    }
  };

  const getDepartmentLabel = (department?: string) => {
    if (!department) return 'General';
    return department.replace(/_/g, ' ');
  };

  // Early return for loading state - must come after all hooks  
  if (authLoading) {
    return (
      <ForumLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      </ForumLayout>
    );
  }

  const headerActions = null; // test

  return (
    <ForumLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Deal Directory
          </h1>
          <p className="text-lg text-gray-600">
            Explore deal connections and partnership opportunities
          </p>
        </div>
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
              {/* Show Add buttons for all authenticated users */}
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
                <Button 
                  onClick={() => {
                    setSelectedEntityType('industry');
                    setShowAddEntityModal(true);
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Industry
                </Button>
              )}
              {activeTab === 'publisher' && (
                <Button 
                  onClick={() => {
                    setSelectedEntityType('publisher');
                    setShowAddEntityModal(true);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Publisher
                </Button>
              )}
              {activeTab === 'dsp-ssp' && (
                <Button 
                  onClick={() => {
                    setSelectedEntityType('dsp-ssp');
                    setShowAddEntityModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add DSP/SSP
                </Button>
              )}
              {activeTab === 'adtech' && (
                <Button 
                  onClick={() => {
                    setSelectedEntityType('adtech');
                    setShowAddEntityModal(true);
                  }}
                  className="bg-pink-600 hover:bg-pink-700"
                >
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
                      <p className="text-2xl font-bold text-gray-900">{Array.isArray(companies) ? companies.length : 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Team Members</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Array.isArray(companies) ? companies.reduce((total, company) => total + (company._count?.contacts || 0), 0) : 0}
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
                        {Array.isArray(companies) && companies.length > 0 
                          ? Math.round((companies.filter(c => c.verified).length / companies.length) * 100)
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

            {/* Companies List */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  {searchQuery ? `Search Results (${Array.isArray(filteredCompanies) ? filteredCompanies.length : 0})` : 'Agency Directory'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {searchQuery ? `Found ${Array.isArray(filteredCompanies) ? filteredCompanies.length : 0} agencies matching your search` : 'Discover and connect with leading agencies'}
                </p>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading agencies...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : !Array.isArray(filteredCompanies) || filteredCompanies.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No agencies found</p>
                    <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {Array.isArray(filteredCompanies) ? filteredCompanies.slice(0, 10).map((company) => (
                      <div key={company.id} className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <CompanyLogo 
                              logoUrl={company.logoUrl} 
                              companyName={company.name}
                              size="lg"
                              className="rounded-xl"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <Link href={`/orgs/companies/${company.id}`} className="group">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                      <SearchHighlight 
                                        text={company.name} 
                                        searchTerm={searchQuery}
                                        highlightClassName="bg-yellow-200 text-yellow-900 px-1 rounded font-semibold"
                                      />
                                    </h3>
                                  </Link>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAgencyTypeBadgeColor(company.companyType)}`}>
                                      {getAgencyTypeLabel(company.companyType)}
                                    </span>
                                    {(company.city || company.state) && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        <SearchHighlight 
                                          text={`${company.city || ''}, ${company.state || ''}`.replace(/^,\s*|\s*,$/g, '')}
                                          searchTerm={searchQuery}
                                          highlightClassName="bg-yellow-200 text-yellow-900 px-1 rounded font-medium"
                                        />
                                      </span>
                                    )}
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                      <Network className="w-3 h-3 mr-1" />
                                      Org Chart
                                    </span>
                                    {company.verified && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <Users className="w-4 h-4" />
                                  <span>{company._count?.contacts || 0} people</span>
                                </div>
                              </div>
                              {/* Client/Advertiser Pills */}
                              <div className="mt-2 mb-1">
                                <div className="flex flex-wrap gap-1">
                                  {getCompanyClients(company.id).slice(0, expandedCompanies.has(company.id) ? undefined : 2).map((client, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                    >
                                      <SearchHighlight 
                                        text={client}
                                        searchTerm={searchQuery}
                                        highlightClassName="bg-yellow-200 text-yellow-900 px-1 rounded font-medium"
                                      />
                                    </span>
                                  ))}
                                  {getCompanyClients(company.id).length > 2 && (
                                    <button
                                      onClick={() => toggleCompanyExpansion(company.id)}
                                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                      {expandedCompanies.has(company.id) 
                                        ? 'Show less' 
                                        : `+${getCompanyClients(company.id).length - 2} more clients`
                                      }
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : null}
                  </div>
                )}
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
          <div className="w-full">
            {/* People Stats Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Contacts</p>
                      <p className="text-2xl font-bold text-gray-900">{Array.isArray(contacts) ? contacts.length : 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Verified</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Array.isArray(contacts) ? contacts.filter(c => c.verified).length : 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Companies</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Array.isArray(contacts) 
                          ? new Set(contacts.map(c => c.company.id)).size
                          : 0}
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

            {/* Contacts Directory */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  {searchQuery ? `Search Results (${Array.isArray(filteredContacts) ? filteredContacts.length : 0})` : 'People Directory'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {searchQuery ? `Found ${Array.isArray(filteredContacts) ? filteredContacts.length : 0} contacts matching your search` : 'Connect with industry professionals'}
                </p>
              </div>
              <div className="p-6">
                {contactsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading contacts...</p>
                  </div>
                ) : error && activeTab === 'people' ? (
                  <div className="text-center py-12">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : !Array.isArray(filteredContacts) || filteredContacts.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No contacts found</p>
                    <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {Array.isArray(filteredContacts) ? filteredContacts.slice(0, 20).map((contact) => (
                      <div key={contact.id} className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Contact Avatar/Logo */}
                            <div className="flex-shrink-0">
                              {contact.logoUrl ? (
                                <img 
                                  src={contact.logoUrl} 
                                  alt={`${contact.fullName} profile`}
                                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                                  {contact.firstName?.[0]}{contact.lastName?.[0]}
                                </div>
                              )}
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <Link href={`/orgs/contacts/${contact.id}`} className="group">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                      <SearchHighlight 
                                        text={contact.fullName || `${contact.firstName} ${contact.lastName}`} 
                                        searchTerm={searchQuery}
                                        highlightClassName="bg-yellow-200 text-yellow-900 px-1 rounded font-semibold"
                                      />
                                    </h3>
                                  </Link>
                                  <p className="text-sm font-medium text-gray-600 mb-1">
                                    <SearchHighlight 
                                      text={contact.title} 
                                      searchTerm={searchQuery}
                                      highlightClassName="bg-yellow-200 text-yellow-900 px-1 rounded font-medium"
                                    />
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Link href={`/orgs/companies/${contact.company.id}`} className="hover:underline">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                        <Building2 className="w-3 h-3 mr-1" />
                                        <SearchHighlight 
                                          text={contact.company.name}
                                          searchTerm={searchQuery}
                                          highlightClassName="bg-yellow-200 text-yellow-900 px-1 rounded font-medium"
                                        />
                                      </span>
                                    </Link>
                                    {(contact.company.city || contact.company.state) && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        <SearchHighlight 
                                          text={`${contact.company.city || ''}, ${contact.company.state || ''}`.replace(/^,\s*|\s*,$/g, '')}
                                          searchTerm={searchQuery}
                                          highlightClassName="bg-yellow-200 text-yellow-900 px-1 rounded font-medium"
                                        />
                                      </span>
                                    )}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeniorityBadgeColor(contact.seniority)}`}>
                                      {getSeniorityLabel(contact.seniority)}
                                    </span>
                                    {contact.department && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                                        <SearchHighlight 
                                          text={getDepartmentLabel(contact.department)}
                                          searchTerm={searchQuery}
                                          highlightClassName="bg-yellow-200 text-yellow-900 px-1 rounded font-medium"
                                        />
                                      </span>
                                    )}
                                    {contact.verified && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Contact Actions */}
                              <div className="flex items-center space-x-2 mt-4">
                                {contact.email && (
                                  <a 
                                    href={`mailto:${contact.email}`}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email
                                  </a>
                                )}
                                {contact.linkedinUrl && (
                                  <a 
                                    href={contact.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                                    </svg>
                                    LinkedIn
                                  </a>
                                )}
                                {contact.phone && (
                                  <a 
                                    href={`tel:${contact.phone}`}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Call
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
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
              
              // Refresh companies list for company-related entities
              const refreshCompanies = async () => {
                try {
                  const response = await fetch('/api/orgs/companies');
                  if (response.ok) {
                    const data = await response.json();
                    if (data.success && Array.isArray(data.companies)) {
                      setCompanies(data.companies);
                      setFilteredCompanies(data.companies);
                    }
                  }
                } catch (error) {
                  console.error('Error refreshing companies:', error);
                }
              };
              
              // Refresh contacts list for person entities
              const refreshContacts = async () => {
                try {
                  const response = await fetch('/api/orgs/contacts?limit=50');
                  if (response.ok) {
                    const data = await response.json();
                    if (data.success && Array.isArray(data.contacts)) {
                      setContacts(data.contacts);
                      setFilteredContacts(data.contacts);
                    }
                  }
                } catch (error) {
                  console.error('Error refreshing contacts:', error);
                }
              };
              
              // Refresh appropriate data based on entity type
              if (selectedEntityType === 'person') {
                refreshContacts();
              } else {
                refreshCompanies();
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
                  </SelectContent>
                </Select>
              </div>

              {/* By Service Type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Service Type</label>
                <Select 
                  value={filterState.duty} 
                  onValueChange={(value) => setFilterState(prev => ({...prev, duty: value}))}
                >
                  <SelectTrigger className="w-full h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="media-planning">Media Planning</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* Filter Actions */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {activeTab === 'agencies' && `Showing ${Array.isArray(filteredCompanies) ? filteredCompanies.length : 0} of ${Array.isArray(companies) ? companies.length : 0} agencies`}
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
    </ForumLayout>
  );
}

