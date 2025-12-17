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
import { ComprehensiveFilterPanel } from '@/components/filters/ComprehensiveFilterPanel';
import { ComprehensiveAdvertiserFilterPanel } from '@/components/filters/ComprehensiveAdvertiserFilterPanel';
import { ComprehensivePeopleFilterPanel } from '@/components/filters/ComprehensivePeopleFilterPanel';

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
  type: 'INDEPENDENT_AGENCY' | 'HOLDING_COMPANY_AGENCY' | 'NETWORK_AGENCY' | 'MEDIA_HOLDING_COMPANY' | 'HOLDING_COMPANY'
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

interface Advertiser {
  id: string
  name: string
  type: string
  industry: string
  city: string
  state: string
  country: string
  verified: boolean
  logoUrl?: string
  teamCount: number
  lastActivity: string
  agencies: Array<{
    id: string
    name: string
    companyType: string
    logoUrl?: string
    verified: boolean
    isAOR: boolean
  }>
}

interface Contact {
  id: string
  firstName: string
  lastName: string
  fullName: string
  title: string
  email: string
  phone: string
  linkedinUrl?: string
  primaryRole: string
  seniority: string
  department: string
  isDecisionMaker: boolean
  lastActivity: string
  company: {
    id: string
    name: string
    companyType: string
    industry: string
    logoUrl?: string
    verified: boolean
    city: string
    state: string
  }
  interactionCount: number
  noteCount: number
}

interface Publisher {
  id: string
  name: string
  type: string
  industry: string
  city: string
  state: string
  country: string
  verified: boolean
  logoUrl?: string
  website?: string
  teamCount: number
  lastActivity: string
}

interface Platform {
  id: string
  name: string
  type: string
  industry: string
  city: string
  state: string
  country: string
  verified: boolean
  logoUrl?: string
  website?: string
  teamCount: number
  lastActivity: string
  partnerCount: number
  clients: Array<{
    id: string
    name: string
    companyType: string
    logoUrl?: string
    verified: boolean
  }>
}

// Mock agencies removed - now using real data from API

// Industries with post counts
const INDUSTRIES_DATA = [
  { name: 'CPG', posts: 27865 },
  { name: 'Consumer Goods', posts: 26441 },
  { name: 'Retail', posts: 22583 },
  { name: 'Health', posts: 15340 },
  { name: 'Media / Entertainment', posts: 15130 },
  { name: 'Telecom / Cable', posts: 13293 },
  { name: 'Technology', posts: 13228 },
  { name: 'Food', posts: 12780 },
  { name: 'Financial Services', posts: 12675 },
  { name: 'Apparel / Accessories', posts: 11314 },
  { name: 'Travel', posts: 11267 },
  { name: 'Beverages', posts: 10220 },
  { name: 'Pharma', posts: 9254 },
  { name: 'Internet', posts: 8822 },
  { name: 'Personal Care', posts: 8594 },
  { name: 'eCommerce', posts: 8552 },
  { name: 'Automotive', posts: 8461 },
  { name: 'Consumer Electronics', posts: 8256 },
  { name: 'Beauty', posts: 7303 },
  { name: 'Household Products', posts: 6868 },
  { name: 'Restaurants', posts: 6523 },
  { name: 'Alcohol', posts: 5009 },
  { name: 'Software', posts: 4805 },
  { name: 'Gaming', posts: 4690 },
  { name: 'Luxury Goods', posts: 4082 },
  { name: 'Insurance', posts: 4044 },
  { name: 'Banks', posts: 4043 },
  { name: 'Pets', posts: 3911 },
  { name: 'Business Services', posts: 3681 },
  { name: 'Wine / Spirits', posts: 3457 },
  { name: 'Sports', posts: 3277 },
  { name: 'Home Furnishings', posts: 3192 },
  { name: 'Appliances', posts: 3112 },
  { name: 'Tourism', posts: 2980 },
  { name: 'Wealth Management', posts: 2853 },
  { name: 'Credit Cards', posts: 2837 },
  { name: 'Theme Parks', posts: 2687 },
  { name: 'Sporting Goods', posts: 2644 },
  { name: 'Footwear', posts: 2616 },
  { name: 'Home Improvement', posts: 2519 },
  { name: 'Music', posts: 2407 },
  { name: 'Education', posts: 2394 },
  { name: 'Beer', posts: 2246 },
  { name: 'Hotels', posts: 2214 },
  { name: 'Computers', posts: 2196 },
  { name: 'Medical Devices & Equipment', posts: 2090 },
  { name: 'Airlines', posts: 1970 },
  { name: 'Fragrance', posts: 1948 },
  { name: 'DTC Retail', posts: 1863 },
  { name: 'Social Network', posts: 1830 },
  { name: 'Manufacturing', posts: 1826 },
  { name: 'Consumer Services', posts: 1780 },
  { name: 'Jewelry', posts: 1759 },
  { name: 'Government', posts: 1490 },
  { name: 'Security Systems', posts: 1455 },
  { name: 'Gambling', posts: 1423 },
  { name: 'Vision', posts: 1354 },
  { name: 'Publishing', posts: 1345 },
  { name: 'Discount Stores', posts: 1344 },
  { name: 'Automotive Accessories', posts: 1305 },
  { name: 'Fashion', posts: 1300 },
  { name: 'Computer Hardware', posts: 1233 },
  { name: 'Baby Products', posts: 1231 },
  { name: 'Auto Parts', posts: 1228 },
  { name: 'Fitness', posts: 1135 },
  { name: 'Auto Services', posts: 1068 },
  { name: 'Health Care Insurance', posts: 1066 },
  { name: 'Luggage', posts: 1054 },
  { name: 'B2B', posts: 1016 },
  { name: 'Grocery Stores', posts: 1005 },
  { name: 'Transportation', posts: 991 },
  { name: 'Advocacy', posts: 975 },
  { name: 'Toys / Games', posts: 936 },
  { name: 'Delivery & Subscription Services', posts: 889 },
  { name: 'Oil & Gas', posts: 876 },
  { name: 'Non-Profit', posts: 826 },
  { name: 'Politics', posts: 815 },
  { name: 'Agriculture', posts: 743 },
  { name: 'Resorts', posts: 704 },
  { name: 'Industrial', posts: 700 },
  { name: 'Shipping / Mailing', posts: 675 },
  { name: 'Drug Stores', posts: 617 },
  { name: 'Cruise', posts: 609 },
  { name: 'Office Products', posts: 600 },
  { name: 'Diversified Industrial', posts: 598 },
  { name: 'Real Estate', posts: 587 },
  { name: 'Hospitality', posts: 544 },
  { name: 'Information Technology and Services', posts: 523 },
  { name: 'Biotechnology', posts: 522 },
  { name: 'Municipal Services', posts: 505 },
  { name: 'Utility', posts: 477 },
  { name: 'Wellness', posts: 419 },
  { name: 'Armed Forces', posts: 415 },
  { name: 'Recreation', posts: 377 },
  { name: 'Auto Rental', posts: 374 },
  { name: 'Golf', posts: 354 },
  { name: 'Energy', posts: 337 },
  { name: 'Building Materials', posts: 327 },
  { name: 'Department Stores', posts: 308 },
  { name: 'Cannabis / CBD', posts: 282 },
  { name: 'Weight Loss', posts: 276 },
  { name: 'Aerospace / Defense', posts: 250 },
  { name: 'Football', posts: 241 },
  { name: 'Tax Services', posts: 237 },
  { name: 'Floral', posts: 208 },
  { name: 'Employment & Staffing', posts: 201 },
  { name: 'Lawn and Garden Equipment & Products', posts: 201 },
  { name: 'Construction', posts: 197 },
  { name: 'Tobacco', posts: 189 },
  { name: 'Stock Market', posts: 183 },
  { name: 'Convenience Stores', posts: 180 },
  { name: 'Electric', posts: 179 },
  { name: 'Motorcycles', posts: 178 },
  { name: 'Basketball', posts: 178 },
  { name: 'Chemical', posts: 173 },
  { name: 'Kitchen Appliances', posts: 167 },
  { name: 'Power Tools', posts: 159 },
  { name: 'Legal', posts: 156 },
  { name: 'B2C', posts: 149 },
  { name: 'Salons', posts: 133 },
  { name: 'Solar Power', posts: 128 },
  { name: 'Dental', posts: 125 },
  { name: 'Tools', posts: 109 },
  { name: 'Heavy Equipment', posts: 108 },
  { name: 'ATV / Power Sports', posts: 106 },
  { name: 'Soccer', posts: 97 },
  { name: 'Management Consulting', posts: 93 },
  { name: 'Festivals', posts: 90 },
  { name: 'Arts & Crafts', posts: 89 },
  { name: 'Skiing / Snowboarding', posts: 86 },
  { name: 'Baseball', posts: 78 },
  { name: 'Museum', posts: 63 },
  { name: 'Cryptocurrency', posts: 63 },
  { name: 'Moving, Storage & Warehousing', posts: 57 },
  { name: 'Cleaning Services', posts: 56 },
  { name: 'Zoo', posts: 54 },
  { name: 'Hockey', posts: 53 },
  { name: 'Credit Reporting', posts: 53 },
  { name: 'Pest Control', posts: 52 },
  { name: 'Marketing & Advertising', posts: 52 },
  { name: 'Theater', posts: 48 },
  { name: 'Car Racing', posts: 43 },
  { name: 'Greeting Cards', posts: 42 },
  { name: 'Religion', posts: 42 },
  { name: 'Photographic Service', posts: 42 },
  { name: 'Party Supplies', posts: 41 },
  { name: 'Research', posts: 38 },
  { name: 'Recreational Vehicles', posts: 37 },
  { name: 'Boats', posts: 37 },
  { name: 'Instruments', posts: 36 },
  { name: 'Packaging', posts: 32 },
  { name: 'Logistics Services', posts: 32 },
  { name: 'Tennis', posts: 31 },
  { name: 'Aquariums', posts: 28 },
  { name: 'POC', posts: 26 },
  { name: 'Aviation Services', posts: 24 },
  { name: 'Individual & Family Services', posts: 19 },
  { name: 'Fine Art', posts: 19 },
  { name: 'Animal Health Care', posts: 19 },
  { name: 'Performing Arts', posts: 18 },
  { name: 'Fintech', posts: 18 },
  { name: 'Collectibles', posts: 18 },
  { name: 'Retirement Community', posts: 17 },
  { name: 'Auctions', posts: 17 },
  { name: 'Optical', posts: 15 },
  { name: 'Adult Products', posts: 15 },
  { name: 'Bridal', posts: 14 },
  { name: 'Water', posts: 13 },
  { name: 'Wholesale', posts: 12 },
  { name: 'Textiles', posts: 10 },
  { name: 'Environmental Services', posts: 9 },
  { name: 'Firearms', posts: 9 },
  { name: 'Waste / Disposal Management', posts: 8 },
  { name: 'Public Safety', posts: 7 },
  { name: 'Magazines', posts: 7 },
  { name: 'Machinery', posts: 6 },
  { name: 'Mining & Metals', posts: 5 },
  { name: 'Funeral Homes/Services', posts: 4 },
  { name: 'Web Hosting', posts: 4 },
  { name: 'Engineering', posts: 4 },
  { name: 'Horse Racing', posts: 3 },
  { name: 'Event Planning', posts: 3 },
  { name: 'Gardens', posts: 3 },
  { name: 'Video Production', posts: 2 },
  { name: 'Trade Shows', posts: 2 },
  { name: 'Wind Power', posts: 2 },
  { name: 'Recycling', posts: 2 },
  { name: 'Plastic Products', posts: 2 },
  { name: 'Architecture', posts: 1 },
  { name: 'Arena Football', posts: 1 },
  { name: 'Paper & Forest Products', posts: 1 },
  { name: 'Volleyball', posts: 1 },
  { name: 'Robotics', posts: 1 },
  { name: 'Advertising Agency', posts: 0 },
  { name: 'Natural Gas', posts: 0 }
];

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
  'PERSONAL_CARE': 'bg-blue-100 text-blue-800',
  'AUTOMOTIVE': 'bg-slate-100 text-slate-800',
  'CONSUMER_GOODS': 'bg-amber-100 text-amber-800',
  'FINANCIAL_SERVICES': 'bg-emerald-100 text-emerald-800',
  'ELECTRONICS': 'bg-sky-100 text-sky-800',
  'BEVERAGES': 'bg-rose-100 text-rose-800',
  'HEALTHCARE': 'bg-fuchsia-100 text-fuchsia-800',
  'TELECOMMUNICATIONS': 'bg-violet-100 text-violet-800',
  'BEAUTY': 'bg-pink-100 text-pink-800',
  'GAMING': 'bg-purple-100 text-purple-800',
  'MEDIA': 'bg-muted text-muted-foreground'
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
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [filteredAdvertisers, setFilteredAdvertisers] = useState<Advertiser[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [filteredPublishers, setFilteredPublishers] = useState<Publisher[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [filteredPlatforms, setFilteredPlatforms] = useState<Platform[]>([]);
  const [adtech, setAdtech] = useState<Platform[]>([]);
  const [filteredAdtech, setFilteredAdtech] = useState<Platform[]>([]);
  const [activeTab, setActiveTab] = useState<'agencies' | 'advertisers' | 'people' | 'industries' | 'publisher' | 'dsp-ssp' | 'adtech'>('agencies');

  const [showAddEntityModal, setShowAddEntityModal] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<'agency' | 'advertiser' | 'person'>('agency');

  // Persistent filter states across all tabs - Enhanced multi-select structure
  const [filterState, setFilterState] = useState({
    // Agency filters
    agencyType: [] as string[],
    holdingCompany: [] as string[],

    // Geography filters (multi-level)
    regions: [] as string[],
    states: [] as string[],
    cities: [] as string[],

    // Relationship filters
    client: [] as string[],
    clientIndustry: [] as string[],
    agencyPartner: [] as string[],

    // Role/Duty filters
    role: [] as string[],
    duty: [] as string[],

    // Attribute filters
    mediaTypes: [] as string[],
    goals: [] as string[],
    audiences: [] as string[],

    // People filters
    company: [] as string[],
    seniority: [] as string[],
    department: [] as string[],

    // Industry filter (for advertisers)
    industry: [] as string[]
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
      case 'HOLDING_COMPANY': return 'Holding Company';
      case 'MEDIA_HOLDING_COMPANY': return 'Media Holding Company';
      case 'HOLDING_COMPANY_AGENCY': return 'Agency';
      case 'INDEPENDENT_AGENCY': return 'Independent Agency';
      case 'NETWORK_AGENCY': return 'Network Agency';
      default: return type;
    }
  };

  const getAgencyTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'HOLDING_COMPANY': return 'bg-purple-100 text-purple-800';
      case 'MEDIA_HOLDING_COMPANY': return 'bg-indigo-100 text-indigo-800';
      case 'HOLDING_COMPANY_AGENCY': return 'bg-blue-100 text-blue-800';
      case 'INDEPENDENT_AGENCY': return 'bg-green-100 text-green-800';
      case 'NETWORK_AGENCY': return 'bg-orange-100 text-orange-800';
      default: return 'bg-muted text-muted-foreground';
    }
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

  // Fetch advertisers from API
  useEffect(() => {
    const fetchAdvertisers = async () => {
      try {
        const response = await fetch('/api/organizations/advertisers', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setAdvertisers(data.advertisers || []);
        }
      } catch (error) {
        console.error('Error fetching advertisers:', error);
      }
    };

    fetchAdvertisers();
  }, []);

  // Fetch people from API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/organizations/people', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setContacts(data.contacts || []);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, []);

  // Fetch publishers from API
  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const response = await fetch('/api/organizations/publishers', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setPublishers(data.publishers || []);
        }
      } catch (error) {
        console.error('Error fetching publishers:', error);
      }
    };

    fetchPublishers();
  }, []);

  // Fetch DSP/SSP from API
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await fetch('/api/organizations/dsp-ssp', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setPlatforms(data.platforms || []);
        }
      } catch (error) {
        console.error('Error fetching DSP/SSP:', error);
      }
    };

    fetchPlatforms();
  }, []);

  // Fetch Adtech from API
  useEffect(() => {
    const fetchAdtech = async () => {
      try {
        const response = await fetch('/api/organizations/adtech', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setAdtech(data.adtech || []);
        }
      } catch (error) {
        console.error('Error fetching adtech:', error);
      }
    };

    fetchAdtech();
  }, []);

  // Agency filtering
  useEffect(() => {
    if (!Array.isArray(agencies)) {
      setFilteredAgencies([]);
      return;
    }

    let filtered = [...agencies];

    // Search query filter
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

    // Agency type filter (multi-select)
    if (filterState.agencyType.length > 0) {
      filtered = filtered.filter(agency => filterState.agencyType.includes(agency.type));
    }

    // State filter (multi-select)
    if (filterState.states.length > 0) {
      filtered = filtered.filter(agency => agency.state && filterState.states.includes(agency.state));
    }

    // City filter (multi-select)
    if (filterState.cities.length > 0) {
      filtered = filtered.filter(agency => agency.city && filterState.cities.includes(agency.city));
    }

    // Client filter (multi-select)
    if (filterState.client.length > 0) {
      filtered = filtered.filter(agency =>
        agency.clients && agency.clients.some(client =>
          filterState.client.includes(client.name)
        )
      );
    }

    // Client industry filter (multi-select)
    if (filterState.clientIndustry.length > 0) {
      filtered = filtered.filter(agency =>
        agency.clients && agency.clients.some(client =>
          filterState.clientIndustry.includes(client.industry)
        )
      );
    }

    setFilteredAgencies(filtered);
  }, [searchQuery, agencies, filterState.agencyType, filterState.states, filterState.cities, filterState.client, filterState.clientIndustry]);

  // Advertiser filtering
  useEffect(() => {
    if (!Array.isArray(advertisers)) {
      setFilteredAdvertisers([]);
      return;
    }

    let filtered = [...advertisers];

    // Search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(advertiser =>
        (advertiser.name && advertiser.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (advertiser.industry && advertiser.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (advertiser.city && advertiser.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (advertiser.state && advertiser.state.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Industry filter (multi-select)
    if (filterState.industry.length > 0) {
      filtered = filtered.filter(advertiser => advertiser.industry && filterState.industry.includes(advertiser.industry));
    }

    // State filter (multi-select)
    if (filterState.states.length > 0) {
      filtered = filtered.filter(advertiser => advertiser.state && filterState.states.includes(advertiser.state));
    }

    // City filter (multi-select)
    if (filterState.cities.length > 0) {
      filtered = filtered.filter(advertiser => advertiser.city && filterState.cities.includes(advertiser.city));
    }

    // Agency partner filter (multi-select)
    if (filterState.agencyPartner.length > 0) {
      filtered = filtered.filter(advertiser =>
        advertiser.agencies && advertiser.agencies.some(agency =>
          filterState.agencyPartner.includes(agency.name)
        )
      );
    }

    setFilteredAdvertisers(filtered);
  }, [searchQuery, advertisers, filterState.industry, filterState.states, filterState.cities, filterState.agencyPartner]);

  // Contact filtering
  useEffect(() => {
    if (!Array.isArray(contacts)) {
      setFilteredContacts([]);
      return;
    }

    let filtered = [...contacts];

    // Search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(contact =>
        (contact.firstName && contact.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.lastName && contact.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.title && contact.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.company && contact.company.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Company filter (multi-select)
    if (filterState.company.length > 0) {
      filtered = filtered.filter(contact =>
        contact.company && filterState.company.includes(contact.company.name)
      );
    }

    // Role/Title filter (multi-select)
    if (filterState.role.length > 0) {
      filtered = filtered.filter(contact =>
        contact.primaryRole && filterState.role.includes(contact.primaryRole)
      );
    }

    // Seniority filter (multi-select)
    if (filterState.seniority.length > 0) {
      filtered = filtered.filter(contact =>
        contact.seniority && filterState.seniority.includes(contact.seniority)
      );
    }

    // Department filter (multi-select)
    if (filterState.department.length > 0) {
      filtered = filtered.filter(contact =>
        contact.department && filterState.department.includes(contact.department)
      );
    }

    // Industry filter (via company) (multi-select)
    if (filterState.industry.length > 0) {
      filtered = filtered.filter(contact =>
        contact.company && contact.company.industry && filterState.industry.includes(contact.company.industry)
      );
    }

    // State filter (via company) (multi-select)
    if (filterState.states.length > 0) {
      filtered = filtered.filter(contact =>
        contact.company && contact.company.state && filterState.states.includes(contact.company.state)
      );
    }

    // City filter (via company) (multi-select)
    if (filterState.cities.length > 0) {
      filtered = filtered.filter(contact =>
        contact.company && contact.company.city && filterState.cities.includes(contact.company.city)
      );
    }

    setFilteredContacts(filtered);
  }, [searchQuery, contacts, filterState.company, filterState.role, filterState.seniority, filterState.department, filterState.industry, filterState.states, filterState.cities]);

  // Publisher filtering
  useEffect(() => {
    if (!Array.isArray(publishers)) {
      setFilteredPublishers([]);
      return;
    }

    let filtered = [...publishers];

    if (searchQuery.trim()) {
      filtered = filtered.filter(publisher =>
        (publisher.name && publisher.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (publisher.city && publisher.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (publisher.state && publisher.state.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filterState.geography !== 'all') {
      filtered = filtered.filter(publisher => publisher.state === filterState.geography);
    }

    setFilteredPublishers(filtered);
  }, [searchQuery, publishers, filterState.geography]);

  // Platform (DSP/SSP) filtering
  useEffect(() => {
    if (!Array.isArray(platforms)) {
      setFilteredPlatforms([]);
      return;
    }

    let filtered = [...platforms];

    if (searchQuery.trim()) {
      filtered = filtered.filter(platform =>
        (platform.name && platform.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (platform.city && platform.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (platform.state && platform.state.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filterState.geography !== 'all') {
      filtered = filtered.filter(platform => platform.state === filterState.geography);
    }

    setFilteredPlatforms(filtered);
  }, [searchQuery, platforms, filterState.geography]);

  // Adtech filtering
  useEffect(() => {
    if (!Array.isArray(adtech)) {
      setFilteredAdtech([]);
      return;
    }

    let filtered = [...adtech];

    if (searchQuery.trim()) {
      filtered = filtered.filter(company =>
        (company.name && company.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (company.city && company.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (company.state && company.state.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filterState.geography !== 'all') {
      filtered = filtered.filter(company => company.state === filterState.geography);
    }

    setFilteredAdtech(filtered);
  }, [searchQuery, adtech, filterState.geography]);

  // Early return for loading state - must come after all hooks
  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-full bg-muted flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
      <div className="min-h-full bg-muted">
        {/* Header */}
        <div className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center">
                    <Building2 className="h-8 w-8 mr-3 text-sky-600" />
                    Organizations
                  </h1>
                  <p className="mt-1 text-muted-foreground">
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
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border pb-6 mb-6">
              {/* Tab Navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-1 bg-muted p-1 rounded-lg">
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
                            ? 'bg-card text-primary shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                    className="pl-10 pr-10 h-11 bg-card shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
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
                <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Agencies</p>
                          <p className="text-2xl font-bold text-foreground">{filteredAgencies.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                          <p className="text-2xl font-bold text-foreground">
                            {filteredAgencies.reduce((total, agency) => total + agency.teamCount, 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Verified Rate</p>
                          <p className="text-2xl font-bold text-foreground">
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
                      className="flex items-center space-x-2 px-4 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors duration-200"
                    >
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Filters</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <ComprehensiveFilterPanel
                    filterState={filterState}
                    setFilterState={setFilterState}
                    filteredCount={filteredAgencies.length}
                    totalCount={agencies.length}
                    onClose={() => setShowFilters(false)}
                  />
                )}

                {/* Agencies List */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-muted">
                    <h3 className="text-lg font-semibold text-foreground">
                      {searchQuery ? `Search Results (${filteredAgencies.length})` : 'Agency Directory'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery ? `Found ${filteredAgencies.length} agencies matching your search` : 'Discover and connect with leading agencies'}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4">
                      {filteredAgencies.map((agency) => (
                        <div key={agency.id} className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-border transition-all duration-200">
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
                                    <Link href={`/companies/${agency.id}`} className="group">
                                      <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-600 transition-colors">
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
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
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
                                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span>{agency.teamCount} people</span>
                                  </div>
                                </div>
                                {/* Client/Advertiser Pills */}
                                <div className="mt-2 mb-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {agency.clients?.slice(0, expandedCompanies.has(agency.id) ? undefined : 3).map((client, index) => (
                                      <div key={index} className="flex items-center gap-1">
                                        <CompanyLogo
                                          logoUrl={client.logoUrl}
                                          companyName={client.name}
                                          size="sm"
                                          className="rounded-full"
                                        />
                                        <span className="text-sm font-medium text-foreground">
                                          <SearchHighlight
                                            text={client.name}
                                            searchTerm={searchQuery}
                                            highlightClassName="bg-sky-100 text-sky-900 px-1 rounded font-medium"
                                          />
                                        </span>
                                        {index < (expandedCompanies.has(agency.id) ? agency.clients.length - 1 : Math.min(2, agency.clients.length - 1)) && (
                                          <span className="text-muted-foreground">,</span>
                                        )}
                                      </div>
                                    ))}
                                    {agency.clients && agency.clients.length > 3 && (
                                      <button
                                        onClick={() => toggleCompanyExpansion(agency.id)}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                      >
                                        {expandedCompanies.has(agency.id)
                                          ? 'Show less'
                                          : `+${agency.clients.length - 3} teams`
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

            {/* Advertisers Tab */}
            {activeTab === 'advertisers' && (
              <div className="w-full">
                {/* Stats Bar */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
                          <Globe className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Advertisers</p>
                          <p className="text-2xl font-bold text-foreground">{filteredAdvertisers.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                          <p className="text-2xl font-bold text-foreground">
                            {filteredAdvertisers.reduce((total, adv) => total + adv.teamCount, 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Verified Rate</p>
                          <p className="text-2xl font-bold text-foreground">
                            {filteredAdvertisers.length > 0
                              ? Math.round((filteredAdvertisers.filter(a => a.verified).length / filteredAdvertisers.length) * 100)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Filter Toggle */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center space-x-2 px-4 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors duration-200"
                    >
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Filters</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <ComprehensiveAdvertiserFilterPanel
                    filterState={filterState}
                    setFilterState={setFilterState}
                    filteredCount={filteredAdvertisers.length}
                    totalCount={advertisers.length}
                    onClose={() => setShowFilters(false)}
                  />
                )}

                {/* Advertisers List */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-muted">
                    <h3 className="text-lg font-semibold text-foreground">
                      {searchQuery ? `Search Results (${filteredAdvertisers.length})` : 'Advertiser Directory'}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4">
                      {filteredAdvertisers.map((advertiser) => (
                        <div key={advertiser.id} className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-border transition-all duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <CompanyLogo
                                logoUrl={advertiser.logoUrl}
                                companyName={advertiser.name}
                                size="lg"
                                className="rounded-xl"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <Link href={`/companies/${advertiser.id}`} className="group">
                                      <h3 className="text-lg font-semibold text-foreground group-hover:text-green-600 transition-colors">
                                        {advertiser.name}
                                      </h3>
                                    </Link>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${INDUSTRY_COLORS[advertiser.industry] || 'bg-muted text-muted-foreground'}`}>
                                        {advertiser.industry}
                                      </span>
                                      {(advertiser.city || advertiser.state) && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                          <MapPin className="w-3 h-3 mr-1" />
                                          {`${advertiser.city || ''}, ${advertiser.state || ''}`.replace(/^,\s*|\s*,$/g, '')}
                                        </span>
                                      )}
                                      {advertiser.verified && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Verified
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span>{advertiser.teamCount} people</span>
                                  </div>
                                </div>
                                {/* Agency Partners */}
                                {advertiser.agencies && advertiser.agencies.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Agency Partners:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {advertiser.agencies.slice(0, expandedCompanies.has(advertiser.id) ? undefined : 3).map((agency, index) => (
                                        <span
                                          key={index}
                                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                        >
                                          {agency.name}
                                          {agency.isAOR && ' (AOR)'}
                                        </span>
                                      ))}
                                      {advertiser.agencies.length > 3 && (
                                        <button
                                          onClick={() => toggleCompanyExpansion(advertiser.id)}
                                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:bg-muted transition-colors"
                                        >
                                          {expandedCompanies.has(advertiser.id)
                                            ? 'Show less'
                                            : `+${advertiser.agencies.length - 3} more`
                                          }
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
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

            {/* People Tab */}
            {activeTab === 'people' && (
              <div className="w-full">
                {/* Stats Bar */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total People</p>
                          <p className="text-2xl font-bold text-foreground">{filteredContacts.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Companies</p>
                          <p className="text-2xl font-bold text-foreground">
                            {new Set(filteredContacts.map(c => c.company.id)).size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Decision Makers</p>
                          <p className="text-2xl font-bold text-foreground">
                            {filteredContacts.filter(c => c.isDecisionMaker).length}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Filter Toggle */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center space-x-2 px-4 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors duration-200"
                    >
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Filters</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <ComprehensivePeopleFilterPanel
                    filterState={filterState}
                    setFilterState={setFilterState}
                    filteredCount={filteredContacts.length}
                    totalCount={contacts.length}
                    onClose={() => setShowFilters(false)}
                  />
                )}

                {/* People List */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-muted">
                    <h3 className="text-lg font-semibold text-foreground">
                      {searchQuery ? `Search Results (${filteredContacts.length})` : 'People Directory'}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4">
                      {filteredContacts.map((contact) => (
                        <div key={contact.id} className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-border transition-all duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                {contact.firstName[0]}{contact.lastName[0]}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <Link href={`/people/${contact.id}`} className="group">
                                      <h3 className="text-lg font-semibold text-foreground group-hover:text-purple-600 transition-colors">
                                        {contact.fullName}
                                      </h3>
                                    </Link>
                                    <p className="text-sm text-muted-foreground">{contact.title}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Link
                                        href={`/companies/${contact.company.id}`}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                                      >
                                        <Building2 className="w-3 h-3 mr-1" />
                                        {contact.company.name}
                                      </Link>
                                      {contact.seniority && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                          {contact.seniority}
                                        </span>
                                      )}
                                      {contact.isDecisionMaker && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Decision Maker
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end space-y-1 text-xs text-muted-foreground">
                                    <span className="flex items-center">
                                      <Network className="w-3 h-3 mr-1" />
                                      {contact.interactionCount} interactions
                                    </span>
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

            {activeTab === 'industries' && (
              <div className="w-full">
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-muted">
                    <h3 className="text-lg font-semibold text-foreground">
                      {INDUSTRIES_DATA.length} Industries
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Browse industries and explore associated posts
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {INDUSTRIES_DATA.filter(industry =>
                        industry.name.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((industry) => (
                        <Link
                          key={industry.name}
                          href={`/industries/${encodeURIComponent(industry.name)}`}
                          className="group bg-white border border-border rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-foreground group-hover:text-blue-600 transition-colors truncate">
                                {industry.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {industry.posts.toLocaleString()} {industry.posts === 1 ? 'Post' : 'Posts'}
                              </p>
                            </div>
                            <Briefcase className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors ml-2 flex-shrink-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Publishers Tab */}
            {activeTab === 'publisher' && (
              <div className="w-full">
                {/* Stats Bar */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-red-50 rounded-lg">
                        <Monitor className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Publishers</p>
                        <p className="text-2xl font-bold text-foreground">{filteredPublishers.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Verified</p>
                        <p className="text-2xl font-bold text-foreground">
                          {filteredPublishers.filter(p => p.verified).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Publishers List */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-muted">
                    <h3 className="text-lg font-semibold text-foreground">Publisher Directory</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4">
                      {filteredPublishers.map((publisher) => (
                        <div key={publisher.id} className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-border transition-all duration-200">
                          <div className="flex items-start space-x-4">
                            <CompanyLogo
                              logoUrl={publisher.logoUrl}
                              companyName={publisher.name}
                              size="lg"
                              className="rounded-xl"
                            />
                            <div className="flex-1">
                              <Link href={`/companies/${publisher.id}`}>
                                <h3 className="text-lg font-semibold text-foreground hover:text-red-600 transition-colors">
                                  {publisher.name}
                                </h3>
                              </Link>
                              <div className="flex items-center space-x-2 mt-1">
                                {(publisher.city || publisher.state) && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {`${publisher.city || ''}, ${publisher.state || ''}`.replace(/^,\s*|\s*,$/g, '')}
                                  </span>
                                )}
                                {publisher.verified && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </span>
                                )}
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

            {/* DSP/SSP Tab */}
            {activeTab === 'dsp-ssp' && (
              <div className="w-full">
                {/* Stats Bar */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-lg">
                        <Satellite className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Platforms</p>
                        <p className="text-2xl font-bold text-foreground">{filteredPlatforms.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
                        <Network className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Partnerships</p>
                        <p className="text-2xl font-bold text-foreground">
                          {filteredPlatforms.reduce((sum, p) => sum + p.partnerCount, 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Verified</p>
                        <p className="text-2xl font-bold text-foreground">
                          {filteredPlatforms.filter(p => p.verified).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platforms List */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-muted">
                    <h3 className="text-lg font-semibold text-foreground">DSP/SSP Directory</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4">
                      {filteredPlatforms.map((platform) => (
                        <div key={platform.id} className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-border transition-all duration-200">
                          <div className="flex items-start space-x-4">
                            <CompanyLogo
                              logoUrl={platform.logoUrl}
                              companyName={platform.name}
                              size="lg"
                              className="rounded-xl"
                            />
                            <div className="flex-1">
                              <Link href={`/companies/${platform.id}`}>
                                <h3 className="text-lg font-semibold text-foreground hover:text-indigo-600 transition-colors">
                                  {platform.name}
                                </h3>
                              </Link>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${platform.type === 'DSP' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'}`}>
                                  {platform.type}
                                </span>
                                {(platform.city || platform.state) && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {`${platform.city || ''}, ${platform.state || ''}`.replace(/^,\s*|\s*,$/g, '')}
                                  </span>
                                )}
                                {platform.verified && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </span>
                                )}
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

            {/* Adtech Tab */}
            {activeTab === 'adtech' && (
              <div className="w-full">
                {/* Stats Bar */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-pink-50 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Adtech</p>
                        <p className="text-2xl font-bold text-foreground">{filteredAdtech.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
                        <Network className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Partnerships</p>
                        <p className="text-2xl font-bold text-foreground">
                          {filteredAdtech.reduce((sum, c) => sum + c.partnerCount, 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Verified</p>
                        <p className="text-2xl font-bold text-foreground">
                          {filteredAdtech.filter(c => c.verified).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adtech List */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-muted">
                    <h3 className="text-lg font-semibold text-foreground">Adtech Directory</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4">
                      {filteredAdtech.map((company) => (
                        <div key={company.id} className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-border transition-all duration-200">
                          <div className="flex items-start space-x-4">
                            <CompanyLogo
                              logoUrl={company.logoUrl}
                              companyName={company.name}
                              size="lg"
                              className="rounded-xl"
                            />
                            <div className="flex-1">
                              <Link href={`/companies/${company.id}`}>
                                <h3 className="text-lg font-semibold text-foreground hover:text-pink-600 transition-colors">
                                  {company.name}
                                </h3>
                              </Link>
                              <div className="flex items-center space-x-2 mt-1">
                                {(company.city || company.state) && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {`${company.city || ''}, ${company.state || ''}`.replace(/^,\s*|\s*,$/g, '')}
                                  </span>
                                )}
                                {company.verified && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </span>
                                )}
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
          </div>
        </div>
      </div>
    </MainLayout>
    </AuthGuard>
  );
}