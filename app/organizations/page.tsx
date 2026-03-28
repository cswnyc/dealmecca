'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Building2, Users, Search, Upload, FileText, CheckCircle, XCircle, Network, Filter, Plus, MapPin, ChevronDown, X, Globe, User, Briefcase, BarChart3, Tv, Satellite, Monitor, SlidersHorizontal, ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageFrame, PageHeader, PageContent, PageCard, PageGrid } from '@/components/layout/PageFrame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BrandTabs } from '@/components/ui/BrandTabs';
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
import { StatsBar } from '@/components/orgs/StatsBar';
import { OrgListItem, RelatedItems } from '@/components/orgs/OrgListItem';
import { TeamChip, MoreTeamsLink } from '@/components/orgs/TeamChip';
import { Linkedin } from 'lucide-react';
import { CompactHeader, FilterDrawer, ActiveFilterPills, type Filter as FilterType } from '@/components/organizations';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { LogoMark } from '@/components/ui/Logo';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useDarkMode } from '@/hooks/useDarkMode';

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
  clientTeams: Array<{
    id: string
    name: string
    logoUrl?: string
    color: string
  }>
  totalTeams: number
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
  agencyTeams: Array<{
    id: string
    name: string
    logoUrl?: string
    color: string
  }>
  totalTeams: number
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
  teams: Array<{
    id: string
    name: string
    logoUrl?: string
    color: string
  }>
  handles?: string[]
  verificationCount: number
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
  'TECHNOLOGY': 'bg-primary/10 text-primary dark:bg-primary/20',
  'AEROSPACE': 'bg-secondary/10 text-secondary dark:bg-secondary/20',
  'FOOD_DELIVERY': 'bg-accent/10 text-accent dark:bg-accent/20',
  'E_COMMERCE': 'bg-primary/10 text-primary dark:bg-primary/20',
  'INSURANCE': 'bg-destructive/10 text-destructive dark:bg-destructive/20',
  'FOOD_BEVERAGE': 'bg-accent/10 text-accent dark:bg-accent/20',
  'EDUCATION': 'bg-secondary/10 text-secondary dark:bg-secondary/20',
  'TRAVEL': 'bg-accent/10 text-accent dark:bg-accent/20',
  'ENTERTAINMENT_MEDIA': 'bg-secondary/10 text-secondary dark:bg-secondary/20',
  'RETAIL': 'bg-primary/10 text-primary dark:bg-primary/20',
  'SPORTS_APPAREL': 'bg-accent/10 text-accent dark:bg-accent/20',
  'PERSONAL_CARE': 'bg-primary/10 text-primary dark:bg-primary/20',
  'AUTOMOTIVE': 'bg-muted text-muted-foreground',
  'CONSUMER_GOODS': 'bg-accent/10 text-accent dark:bg-accent/20',
  'FINANCIAL_SERVICES': 'bg-primary/10 text-primary dark:bg-primary/20',
  'ELECTRONICS': 'bg-primary/10 text-primary dark:bg-primary/20',
  'BEVERAGES': 'bg-accent/10 text-accent dark:bg-accent/20',
  'HEALTHCARE': 'bg-secondary/10 text-secondary dark:bg-secondary/20',
  'TELECOMMUNICATIONS': 'bg-secondary/10 text-secondary dark:bg-secondary/20',
  'BEAUTY': 'bg-accent/10 text-accent dark:bg-accent/20',
  'GAMING': 'bg-secondary/10 text-secondary dark:bg-secondary/20',
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

  // New enhancement state and hooks
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [sortBy, setSortBy] = useState<string>('recently-active');
  const [drawerFilters, setDrawerFilters] = useState({
    agencyTypes: [] as string[],
    locations: [] as string[],
    clients: [] as string[],
    clientIndustries: [] as string[],
    duties: [] as string[],
    verified: null as boolean | null,
    teamSize: null as string | null,
  });
  const { showCompactHeader, scrollProgress, scrollToTop } = useScrollPosition(300);
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

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
    industry: [] as string[],

    // Geography filter (for publishers, platforms, adtech)
    geography: 'all' as string
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  
  // Expansion state for relationship chips
  const [expandedAgencies, setExpandedAgencies] = useState<Set<string>>(new Set());
  const [expandedAdvertisers, setExpandedAdvertisers] = useState<Set<string>>(new Set());
  const [copiedContactEmail, setCopiedContactEmail] = useState<string | null>(null);

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
      case 'HOLDING_COMPANY': return 'bg-secondary/10 text-secondary dark:bg-secondary/20';
      case 'MEDIA_HOLDING_COMPANY': return 'bg-primary/10 text-primary dark:bg-primary/20';
      case 'HOLDING_COMPANY_AGENCY': return 'bg-primary/10 text-primary dark:bg-primary/20';
      case 'INDEPENDENT_AGENCY': return 'bg-accent/10 text-accent dark:bg-accent/20';
      case 'NETWORK_AGENCY': return 'bg-accent/10 text-accent dark:bg-accent/20';
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

  // Filter management helpers
  const handleRemoveFilter = (filterId: string) => {
    // Parse filter ID to determine category and value, then update drawer filters
    const dashIndex = filterId.indexOf('-');
    const prefix = filterId.substring(0, dashIndex);
    const value = filterId.substring(dashIndex + 1);

    const updatedDrawerFilters = { ...drawerFilters };
    switch (prefix) {
      case 'type':
        updatedDrawerFilters.agencyTypes = drawerFilters.agencyTypes.filter(v => v !== value);
        break;
      case 'loc':
        updatedDrawerFilters.locations = drawerFilters.locations.filter(v => v !== value);
        break;
      case 'client':
        updatedDrawerFilters.clients = drawerFilters.clients.filter(v => v !== value);
        break;
      case 'industry':
        updatedDrawerFilters.clientIndustries = drawerFilters.clientIndustries.filter(v => v !== value);
        break;
      case 'duty':
        updatedDrawerFilters.duties = drawerFilters.duties.filter(v => v !== value);
        break;
    }

    handleDrawerFilterChange(updatedDrawerFilters);
  };

  const handleClearAllFilters = () => {
    setActiveFilters([]);
    setDrawerFilters({
      agencyTypes: [],
      locations: [],
      clients: [],
      clientIndustries: [],
      duties: [],
      verified: null,
      teamSize: null,
    });
    // Also clear filterState
    setFilterState(prev => ({
      ...prev,
      holdingCompany: [],
      states: [],
      cities: [],
      regions: [],
      client: [],
      clientIndustry: [],
      role: [],
      mediaTypes: [],
      goals: [],
      audiences: [],
    }));
  };

  const handleDrawerFilterChange = (newFilters: typeof drawerFilters) => {
    setDrawerFilters(newFilters);

    // Convert drawer filters to active filter pills
    const newActiveFilters: FilterType[] = [];
    newFilters.agencyTypes.forEach(type => {
      newActiveFilters.push({ id: `type-${type}`, label: type, value: type, type: 'Agency Type' });
    });
    newFilters.locations.forEach(loc => {
      newActiveFilters.push({ id: `loc-${loc}`, label: loc, value: loc, type: 'Location' });
    });
    newFilters.clients.forEach(client => {
      newActiveFilters.push({ id: `client-${client}`, label: client, value: client, type: 'Client' });
    });
    newFilters.clientIndustries.forEach(industry => {
      newActiveFilters.push({ id: `industry-${industry}`, label: industry, value: industry, type: 'Industry' });
    });
    newFilters.duties.forEach(duty => {
      newActiveFilters.push({ id: `duty-${duty}`, label: duty, value: duty, type: 'Duty' });
    });
    setActiveFilters(newActiveFilters);

    // Also update filterState so actual filtering works
    setFilterState(prev => ({
      ...prev,
      holdingCompany: newFilters.agencyTypes,
      states: newFilters.locations.filter(loc =>
        ['New York', 'California', 'Illinois', 'Texas', 'New Jersey', 'Massachusetts', 'Georgia', 'Washington', 'Ohio', 'Pennsylvania'].includes(loc)
      ),
      cities: newFilters.locations.filter(loc => loc.includes(', ')), // Cities have format "City, ST"
      regions: newFilters.locations.filter(loc =>
        ['USA', 'Northeast', 'West', 'Midwest', 'Southeast', 'Southwest', 'Mid-Atlantic', 'Europe', 'Canada', 'United Kingdom'].includes(loc)
      ),
      client: newFilters.clients,
      clientIndustry: newFilters.clientIndustries,
      // Duty section includes multiple subsection types - we'll filter by all of them
      role: newFilters.duties.filter(d => ['Buying', 'Planning', 'Strategy', 'Creative', 'AOR', 'PR', 'Analytics', 'CRM', 'Innovation', 'League Partnerships'].includes(d)),
      mediaTypes: newFilters.duties.filter(d => ['Digital', 'OOH', 'Programmatic', 'TV', 'Video', 'Print', 'Social Media', 'Event Sponsorship', 'Mobile', 'Display'].includes(d)),
      goals: newFilters.duties.filter(d => ['Direct Response', 'Branding', 'Lead Gen', 'Demand Gen', 'Lower-Funnel', 'Upper-Funnel', 'Mid-Funnel', 'Partnerships', 'Expansion Projects', 'Consumer Growth'].includes(d)),
      audiences: newFilters.duties.filter(d => ['Holiday', 'Hispanic', 'Multicultural', 'Female', 'Back-to-School', 'Male', 'Millennials', 'Generation Z', 'Local', 'National'].includes(d)),
    }));
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

    // Holding company filter (from drawer)
    if (filterState.holdingCompany.length > 0) {
      filtered = filtered.filter(agency => {
        // Check for "Independent Agency" type match
        if (filterState.holdingCompany.includes('Independent Agency') && agency.type === 'INDEPENDENT_AGENCY') {
          return true;
        }
        // Check if agency name matches any selected holding company/network
        return filterState.holdingCompany.some(hc =>
          hc !== 'Independent Agency' && agency.name.toLowerCase().includes(hc.toLowerCase())
        );
      });
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

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'most-people':
          return (b.teamCount || 0) - (a.teamCount || 0);
        case 'most-clients':
          return (b.clients?.length || 0) - (a.clients?.length || 0);
        case 'recently-active':
        default:
          // Parse lastActivity dates and sort descending (most recent first)
          const dateA = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
          const dateB = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
          return dateB - dateA;
      }
    });

    setFilteredAgencies(filtered);
  }, [searchQuery, agencies, filterState.agencyType, filterState.holdingCompany, filterState.states, filterState.cities, filterState.client, filterState.clientIndustry, sortBy]);

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
      <AuthGuard>
        <PageFrame maxWidth="7xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-lg">Loading...</p>
            </div>
          </div>
        </PageFrame>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      {/* Compact Header - appears on scroll (outside PageFrame for proper sticky) */}
      <CompactHeader
        visible={showCompactHeader}
        activeCategory={activeTab as 'agencies' | 'advertisers' | 'people' | 'industries' | 'publishers' | 'dsp-ssp' | 'adtech'}
        onCategoryChange={(category) => setActiveTab(category as typeof activeTab)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onOpenFilters={() => setFilterDrawerOpen(true)}
        stats={{ filtered: filteredAgencies.length, total: agencies.length }}
        scrollProgress={scrollProgress}
      />

      <PageFrame maxWidth="7xl">
        <div className="flex items-center justify-between -mt-5">
          <div className="flex items-center gap-3">
            {/* Mobile Logo - animated circle icon */}
            <div className="lg:hidden">
              <LogoMark size={52} animated={true} />
            </div>
            <div>
              <h1 className="text-2xl md:text-[28px] font-bold text-[#162B54] dark:text-[#EAF0FF] tracking-tight leading-tight">Organizations</h1>
              <p className="hidden lg:block text-[15px] text-[#64748B] dark:text-[#9AA7C2] mt-2">Explore deal connections and partnership opportunities</p>
            </div>
          </div>
          <DarkModeToggle isDark={isDark} onToggle={toggleDarkMode} />
        </div>

        <PageContent className="pb-20 lg:pb-0 mt-6">
          {/* Tab Navigation */}
          <BrandTabs
            tabs={[
              { id: 'agencies', label: 'Agencies', icon: Building2 },
              { id: 'advertisers', label: 'Advertisers', icon: Globe },
              { id: 'people', label: 'People', icon: User },
              { id: 'industries', label: 'Industries', icon: Briefcase },
              { id: 'publisher', label: 'Publisher', icon: Monitor },
              { id: 'dsp-ssp', label: 'DSP/SSP', icon: Satellite },
              { id: 'adtech', label: 'Adtech', icon: BarChart3 }
            ]}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            className="mb-4"
          />

          {/* Search Bar and Action Buttons */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA7C2]" />
              <input
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
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border rounded-xl text-sm text-[#162B54] dark:text-[#EAF0FF] placeholder-[#9AA7C2] focus:outline-none focus:ring-2 focus:ring-[#2575FC]/20 focus:border-[#2575FC] dark:focus:ring-[#5B8DFF]/20 dark:focus:border-[#5B8DFF] transition-all"
              />
            </div>
            {/* Filter Button */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border rounded-xl text-sm text-[#162B54] dark:text-[#EAF0FF] hover:border-[#2575FC] dark:hover:border-[#5B8DFF] transition-all"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilters.length > 0 && (
                <span className="ml-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white rounded-full brand-gradient">
                  {activeFilters.length}
                </span>
              )}
            </button>
            {activeTab === 'advertisers' && (
              <button
                onClick={() => {
                  setSelectedEntityType('advertiser');
                  setShowAddEntityModal(true);
                }}
                className="text-white px-5 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}
              >
                <Plus className="w-5 h-5" />
                Add Advertiser
              </button>
            )}
            {activeTab === 'people' && (
              <button
                onClick={() => {
                  setSelectedEntityType('person');
                  setShowAddEntityModal(true);
                }}
                className="text-white px-5 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}
              >
                <Plus className="w-5 h-5" />
                Add Person
              </button>
            )}
          </div>

          {/* Active Filter Pills */}
          {activeFilters.length > 0 && (
            <div className="mb-6">
              <ActiveFilterPills
                filters={activeFilters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
              />
            </div>
          )}

          {/* Agencies Tab */}
          {activeTab === 'agencies' && (
            <div className="space-y-6">
              {/* Stats Row - horizontal bar */}
              <div className="px-4 lg:px-6 py-3 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-gray-800 dark:to-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden">
                {/* Left side - Stats */}
                <div className="flex items-center gap-4 lg:gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-[#2575FC]" />
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Showing</span>
                      <span className="font-bold text-gray-900 dark:text-white ml-1">{filteredAgencies.length.toLocaleString()}</span>
                      <span className="text-gray-500 dark:text-gray-400 mx-1">of</span>
                      <span className="font-bold text-gray-900 dark:text-white">{agencies.length.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-600" />

                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Team Members</span>
                      <span className="font-bold text-gray-900 dark:text-white ml-1">{filteredAgencies.reduce((total, agency) => total + agency.teamCount, 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right side - Sort + Add (hidden on mobile) */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#2575FC] focus:border-[#2575FC] outline-none cursor-pointer"
                    >
                      <option value="recently-active">Recently Active</option>
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="most-people">Most People</option>
                      <option value="most-clients">Most Clients</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedEntityType('agency');
                      setShowAddEntityModal(true);
                    }}
                    className="px-4 py-1.5 brand-gradient text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Agency
                  </button>
                </div>
              </div>

              {/* Agencies List */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 lg:p-6 overflow-hidden">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-[#162B54] dark:text-[#EAF0FF]">
                    {searchQuery ? `Search Results (${filteredAgencies.length})` : 'Agency Directory'}
                  </h2>
                  <p className="text-sm text-[#64748B] dark:text-[#9AA7C2]">
                    {searchQuery ? `Found ${filteredAgencies.length} agencies matching your search` : 'Discover and connect with leading agencies'}
                  </p>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  {filteredAgencies.map((agency) => {
                    const isExpanded = expandedAgencies.has(agency.id);
                    const displayedTeams = isExpanded ? agency.clientTeams : agency.clientTeams?.slice(0, 3) || [];
                    
                    return (
                      <OrgListItem
                        key={agency.id}
                        id={agency.id}
                        name={agency.name}
                        logoUrl={agency.logoUrl}
                        type={getAgencyTypeLabel(agency.type)}
                        location={{ city: agency.city, state: agency.state }}
                        verified={agency.verified}
                        teamCount={agency.teamCount}
                        searchQuery={searchQuery}
                      >
                        {agency.clientTeams && agency.clientTeams.length > 0 && (
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {displayedTeams.map(team => (
                                <TeamChip
                                  key={team.id}
                                  name={team.name}
                                  logo={team.logoUrl}
                                  color={team.color}
                                  href={`/companies/${team.id}`}
                                />
                              ))}
                              {agency.totalTeams > 3 && (
                                <MoreTeamsLink 
                                  count={agency.totalTeams - 3}
                                  expanded={isExpanded}
                                  onToggle={() => {
                                    setExpandedAgencies(prev => {
                                      const next = new Set(prev);
                                      if (next.has(agency.id)) {
                                        next.delete(agency.id);
                                      } else {
                                        next.add(agency.id);
                                      }
                                      return next;
                                    });
                                  }}
                                />
                              )}
                            </div>
                            <p className="text-xs text-[#9AA7C2]">Last activity: {agency.lastActivity}</p>
                          </div>
                        )}
                      </OrgListItem>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Advertisers Tab */}
          {activeTab === 'advertisers' && (
            <div className="space-y-6">
              {/* Stats Bar */}
              <StatsBar
                stats={[
                  { icon: Globe, label: 'Total Advertisers', value: filteredAdvertisers.length, colorClass: 'bg-[#8B5CF6]/10 text-[#8B5CF6]' },
                  { icon: Users, label: 'Team Members', value: filteredAdvertisers.reduce((total, adv) => total + adv.teamCount, 0), colorClass: 'bg-[#2575FC]/10 dark:bg-[#5B8DFF]/10 text-[#2575FC] dark:text-[#5B8DFF]' },
                  { icon: CheckCircle, label: 'Verified Rate', value: `${filteredAdvertisers.length > 0 ? Math.round((filteredAdvertisers.filter(a => a.verified).length / filteredAdvertisers.length) * 100) : 0}%`, colorClass: 'bg-green-500/10 text-green-500' }
                ]}
              />

              {/* Advertisers List */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 lg:p-6 overflow-hidden">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-[#162B54] dark:text-[#EAF0FF]">
                    {searchQuery ? `Search Results (${filteredAdvertisers.length})` : 'Advertiser Directory'}
                  </h2>
                  <p className="text-sm text-[#64748B] dark:text-[#9AA7C2]">Discover and connect with leading advertisers</p>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  {filteredAdvertisers.map((advertiser) => {
                    const isExpanded = expandedAdvertisers.has(advertiser.id);
                    const displayedTeams = isExpanded ? advertiser.agencyTeams : advertiser.agencyTeams?.slice(0, 3) || [];
                    
                    return (
                      <OrgListItem
                        key={advertiser.id}
                        id={advertiser.id}
                        name={advertiser.name}
                        logoUrl={advertiser.logoUrl}
                        type={advertiser.industry}
                        location={{ city: advertiser.city, state: advertiser.state }}
                        verified={advertiser.verified}
                        teamCount={advertiser.teamCount}
                        searchQuery={searchQuery}
                        showOrgChart={false}
                      >
                        {advertiser.agencyTeams && advertiser.agencyTeams.length > 0 && (
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {displayedTeams.map(team => (
                                <TeamChip
                                  key={team.id}
                                  name={team.name}
                                  logo={team.logoUrl}
                                  color={team.color}
                                  href={`/companies/${team.id}`}
                                />
                              ))}
                              {advertiser.totalTeams > 3 && (
                                <MoreTeamsLink 
                                  count={advertiser.totalTeams - 3}
                                  expanded={isExpanded}
                                  onToggle={() => {
                                    setExpandedAdvertisers(prev => {
                                      const next = new Set(prev);
                                      if (next.has(advertiser.id)) {
                                        next.delete(advertiser.id);
                                      } else {
                                        next.add(advertiser.id);
                                      }
                                      return next;
                                    });
                                  }}
                                />
                              )}
                            </div>
                            <p className="text-xs text-[#9AA7C2]">Last activity: {advertiser.lastActivity}</p>
                          </div>
                        )}
                      </OrgListItem>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* People Tab */}
          {activeTab === 'people' && (
            <div className="space-y-6">
              {/* Stats Bar */}
              <StatsBar
                stats={[
                  { icon: User, label: 'Total People', value: filteredContacts.length, colorClass: 'bg-[#8B5CF6]/10 text-[#8B5CF6]' },
                  { icon: Building2, label: 'Companies', value: new Set(filteredContacts.map(c => c.company.id)).size, colorClass: 'bg-[#2575FC]/10 dark:bg-[#5B8DFF]/10 text-[#2575FC] dark:text-[#5B8DFF]' },
                  { icon: CheckCircle, label: 'Decision Makers', value: filteredContacts.filter(c => c.isDecisionMaker).length, colorClass: 'bg-green-500/10 text-green-500' }
                ]}
              />

              {/* People List */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 lg:p-6 overflow-hidden">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-[#162B54] dark:text-[#EAF0FF]">
                    {searchQuery ? `Search Results (${filteredContacts.length})` : 'People Directory'}
                  </h2>
                  <p className="text-sm text-[#64748B] dark:text-[#9AA7C2]">Connect with industry professionals</p>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  {filteredContacts.map((contact) => (
                    <div key={contact.id} className="p-4 lg:p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full icon-gradient-bg flex items-center justify-center text-[#2575FC] dark:text-[#5B8DFF] font-bold text-lg flex-shrink-0">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link href={`/people/${contact.id}`} className="group">
                                <h3 className="text-sm font-semibold text-[#162B54] dark:text-[#EAF0FF] group-hover:text-[#2575FC] dark:group-hover:text-[#5B8DFF] transition-colors">
                                  {contact.fullName}
                                </h3>
                              </Link>
                              {contact.linkedinUrl && (
                                <a 
                                  href={contact.linkedinUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[#0A66C2] hover:text-[#004182] transition-colors"
                                >
                                  <Linkedin className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-[#64748B] dark:text-[#9AA7C2] mb-2">
                              {contact.title} @ {contact.company.name}
                            </p>
                            
                            {/* Team Associations */}
                            {contact.teams && contact.teams.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                {contact.teams.map(team => (
                                  <TeamChip
                                    key={team.id}
                                    name={team.name}
                                    logo={team.logoUrl}
                                    color={team.color}
                                    href={`/companies/${team.id}`}
                                  />
                                ))}
                              </div>
                            )}
                            
                            {/* Handles */}
                            {contact.handles && contact.handles.length > 0 && (
                              <div className="mb-2">
                                <span className="text-xs font-medium text-[#64748B] dark:text-[#9AA7C2]">Handles: </span>
                                <span className="text-xs text-[#9AA7C2]">
                                  {contact.handles.join(', ')}
                                </span>
                              </div>
                            )}
                            
                            {/* Email */}
                            {contact.email && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(contact.email);
                                  setCopiedContactEmail(contact.email);
                                  setTimeout(() => setCopiedContactEmail(null), 2000);
                                }}
                                className="text-sm text-[#2575FC] dark:text-[#5B8DFF] hover:underline mb-2 text-left transition-all relative group"
                                title={copiedContactEmail === contact.email ? 'Copied!' : 'Click to copy'}
                              >
                                {contact.email}
                                <span className="absolute left-0 -bottom-6 px-2 py-1 bg-[#162B54] dark:bg-[#EAF0FF] text-white dark:text-[#162B54] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  {copiedContactEmail === contact.email ? 'Copied!' : 'Click to copy'}
                                </span>
                              </button>
                            )}
                            
                            <div className="flex items-center flex-wrap gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-[#2575FC]/10 text-[#2575FC] dark:bg-[#5B8DFF]/10 dark:text-[#5B8DFF] rounded text-xs font-medium">
                                {contact.company.name}
                              </span>
                              {contact.seniority && (
                                <span className="text-xs text-[#64748B] dark:text-[#9AA7C2]">
                                  {contact.seniority}
                                </span>
                              )}
                              {contact.isDecisionMaker && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs font-medium">
                                  <CheckCircle className="w-3 h-3" />
                                  Decision Maker
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#9AA7C2] mt-1">Last activity: {contact.lastActivity}</p>
                          </div>
                        </div>
                        
                        {/* Verification Badge */}
                        {contact.verificationCount > 0 && (
                          <div className="flex items-center gap-1 ml-4">
                            <button className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors rounded-lg flex items-center gap-1">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-xs font-medium">{contact.verificationCount}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Industries Tab */}
          {activeTab === 'industries' && (
            <div className="bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E6EAF2] dark:border-dark-border">
                <h2 className="text-lg font-semibold text-[#162B54] dark:text-[#EAF0FF]">
                  {INDUSTRIES_DATA.length} Industries
                </h2>
                <p className="text-sm text-[#64748B] dark:text-[#9AA7C2]">
                  Browse industries and explore associated posts
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {INDUSTRIES_DATA.filter(industry =>
                    industry.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((industry) => (
                    <Link
                      key={industry.name}
                      href={`/industries/${encodeURIComponent(industry.name)}`}
                      className="group bg-card border border-border rounded-lg p-4 hover:shadow-md hover:border-[#2575FC] dark:hover:border-[#5B8DFF] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[#162B54] dark:text-[#EAF0FF] group-hover:text-[#2575FC] dark:group-hover:text-[#5B8DFF] transition-colors truncate">
                            {industry.name}
                          </h4>
                          <p className="text-xs text-[#64748B] dark:text-[#9AA7C2] mt-1">
                            {industry.posts.toLocaleString()} {industry.posts === 1 ? 'Post' : 'Posts'}
                          </p>
                        </div>
                        <Briefcase className="h-5 w-5 text-[#64748B] dark:text-[#9AA7C2] group-hover:text-[#2575FC] dark:group-hover:text-[#5B8DFF] transition-colors ml-2 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Publisher Tab */}
          {activeTab === 'publisher' && (
            <div className="space-y-6">
              {/* Stats Bar */}
              <StatsBar
                stats={[
                  { icon: Monitor, label: 'Total Publishers', value: filteredPublishers.length, colorClass: 'bg-[#2575FC]/10 dark:bg-[#5B8DFF]/10 text-[#2575FC] dark:text-[#5B8DFF]' },
                  { icon: CheckCircle, label: 'Verified', value: filteredPublishers.filter(p => p.verified).length, colorClass: 'bg-green-500/10 text-green-500' }
                ]}
              />

              {/* Publishers List */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 lg:p-6 overflow-hidden">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-[#162B54] dark:text-[#EAF0FF]">Publisher Directory</h2>
                  <p className="text-sm text-[#64748B] dark:text-[#9AA7C2]">Discover media publishers</p>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  {filteredPublishers.map((publisher) => (
                    <OrgListItem
                      key={publisher.id}
                      id={publisher.id}
                      name={publisher.name}
                      logoUrl={publisher.logoUrl}
                      type={publisher.type}
                      location={{ city: publisher.city, state: publisher.state }}
                      verified={publisher.verified}
                      searchQuery={searchQuery}
                      showOrgChart={false}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Adtech Tab */}
          {activeTab === 'adtech' && (
            <div className="space-y-6">
              {/* Stats Bar */}
              <StatsBar
                stats={[
                  { icon: BarChart3, label: 'Total Adtech', value: filteredAdtech.length, colorClass: 'bg-[#8B5CF6]/10 text-[#8B5CF6]' },
                  { icon: Network, label: 'Total Partnerships', value: filteredAdtech.reduce((sum, c) => sum + c.partnerCount, 0), colorClass: 'bg-[#2575FC]/10 dark:bg-[#5B8DFF]/10 text-[#2575FC] dark:text-[#5B8DFF]' },
                  { icon: CheckCircle, label: 'Verified', value: filteredAdtech.filter(c => c.verified).length, colorClass: 'bg-green-500/10 text-green-500' }
                ]}
              />

              {/* Adtech List */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 lg:p-6 overflow-hidden">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-[#162B54] dark:text-[#EAF0FF]">Adtech Directory</h2>
                  <p className="text-sm text-[#64748B] dark:text-[#9AA7C2]">Discover advertising technology platforms</p>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  {filteredAdtech.map((company) => (
                    <OrgListItem
                      key={company.id}
                      id={company.id}
                      name={company.name}
                      logoUrl={company.logoUrl}
                      type={company.type}
                      location={{ city: company.city, state: company.state }}
                      verified={company.verified}
                      searchQuery={searchQuery}
                      showOrgChart={false}
                    />
                  ))}
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
                // Refresh the companies list if needed
                if (selectedEntityType === 'agency') {
                  window.location.reload();
                }
              }}
            />
          )}

          {/* Filter Drawer */}
          <FilterDrawer
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            filters={drawerFilters}
            onFilterChange={handleDrawerFilterChange}
            onClearAll={handleClearAllFilters}
            resultCount={
              activeTab === 'agencies' ? filteredAgencies.length :
              activeTab === 'advertisers' ? filteredAdvertisers.length :
              activeTab === 'people' ? filteredContacts.length :
              activeTab === 'publisher' ? filteredPublishers.length :
              activeTab === 'dsp-ssp' ? filteredPlatforms.length :
              activeTab === 'adtech' ? filteredAdtech.length :
              0
            }
            clientOptions={advertisers.map(a => a.name).sort()}
          />

          {/* Floating Action Buttons - appear with compact header on scroll (mobile & desktop) */}
          <div
            className={`fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-30 flex flex-col gap-3 transition-all duration-300 ${
              showCompactHeader
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              className="w-12 h-12 bg-white dark:bg-gray-800 text-[#162B54] dark:text-[#EAF0FF] rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </button>

            {/* Filter FAB */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="relative w-14 h-14 brand-gradient text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all animate-pulse-ring"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="w-6 h-6" />
              {activeFilters.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>
        </PageContent>
      </PageFrame>
    </AuthGuard>
  );
}