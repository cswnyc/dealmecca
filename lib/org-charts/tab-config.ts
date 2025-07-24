import { TabConfig, SortOption } from '@/types/org-charts';

// Enhanced Sort Options for each tab
export const AGENCY_SORT_OPTIONS: SortOption[] = [
  {
    key: 'latest_activity',
    label: 'Latest Activity',
    direction: 'desc',
    description: 'Recently updated agencies first'
  },
  {
    key: 'name',
    label: 'Name A-Z',
    direction: 'asc',
    description: 'Alphabetical order'
  },
  {
    key: 'size',
    label: 'Company Size',
    direction: 'desc',
    description: 'Largest agencies first'
  },
  {
    key: 'revenue',
    label: 'Revenue',
    direction: 'desc',
    description: 'Highest revenue first'
  },
  {
    key: 'verified',
    label: 'Verification Status',
    direction: 'desc',
    description: 'Verified agencies first'
  },
  {
    key: 'client_count',
    label: 'Client Count',
    direction: 'desc',
    description: 'Most clients first'
  },
  {
    key: 'location',
    label: 'Location',
    direction: 'asc',
    description: 'Grouped by location'
  }
];

export const ADVERTISER_SORT_OPTIONS: SortOption[] = [
  {
    key: 'latest_activity',
    label: 'Latest Activity',
    direction: 'desc',
    description: 'Recently updated advertisers first'
  },
  {
    key: 'name',
    label: 'Name A-Z',
    direction: 'asc',
    description: 'Alphabetical order'
  },
  {
    key: 'size',
    label: 'Company Size',
    direction: 'desc',
    description: 'Largest advertisers first'
  },
  {
    key: 'revenue',
    label: 'Revenue',
    direction: 'desc',
    description: 'Highest revenue first'
  },
  {
    key: 'agency_count',
    label: 'Agency Partners',
    direction: 'desc',
    description: 'Most agency relationships first'
  },
  {
    key: 'industry',
    label: 'Industry',
    direction: 'asc',
    description: 'Grouped by industry'
  },
  {
    key: 'verified',
    label: 'Verification Status',
    direction: 'desc',
    description: 'Verified advertisers first'
  }
];

export const CONTACT_SORT_OPTIONS: SortOption[] = [
  {
    key: 'relevance',
    label: 'Relevance',
    direction: 'desc',
    description: 'Most relevant contacts first'
  },
  {
    key: 'seniority',
    label: 'Seniority Level',
    direction: 'desc',
    description: 'Senior executives first'
  },
  {
    key: 'name',
    label: 'Name A-Z',
    direction: 'asc',
    description: 'Alphabetical by last name'
  },
  {
    key: 'title',
    label: 'Job Title',
    direction: 'asc',
    description: 'Alphabetical by title'
  },
  {
    key: 'company',
    label: 'Company Name',
    direction: 'asc',
    description: 'Alphabetical by company'
  },
  {
    key: 'verified',
    label: 'Verification Status',
    direction: 'desc',
    description: 'Verified contacts first'
  },
  {
    key: 'decision_maker',
    label: 'Decision Makers',
    direction: 'desc',
    description: 'Decision makers first'
  },
  {
    key: 'recent',
    label: 'Recently Updated',
    direction: 'desc',
    description: 'Latest updates first'
  }
];

export const INDUSTRY_SORT_OPTIONS: SortOption[] = [
  {
    key: 'company_count',
    label: 'Company Count',
    direction: 'desc',
    description: 'Most companies first'
  },
  {
    key: 'name',
    label: 'Name A-Z',
    direction: 'asc',
    description: 'Alphabetical order'
  },
  {
    key: 'revenue',
    label: 'Total Revenue',
    direction: 'desc',
    description: 'Highest revenue industries'
  },
  {
    key: 'growth',
    label: 'Growth Rate',
    direction: 'desc',
    description: 'Fastest growing industries'
  }
];

// Base Tab Configurations (counts will be populated dynamically)
export const createTabConfigurations = (analytics?: any): TabConfig[] => {
  // Safely extract counts with proper fallbacks
  const safeCount = (value: any): number => {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value);
      return !isNaN(parsed) ? parsed : 0;
    }
    return 0;
  };

  const overview = analytics?.overview || {};
  
  return [
    {
      key: 'agencies',
      label: 'Agencies',
      icon: 'Building2',
      count: safeCount(overview.totalAgencies),
      defaultSort: 'latest_activity',
      availableSorts: AGENCY_SORT_OPTIONS,
      description: 'Media agencies, creative shops, and holding companies',
      premium: false
    },
    {
      key: 'advertisers',
      label: 'Advertisers',
      icon: 'TrendingUp',
      count: safeCount(overview.totalAdvertisers),
      defaultSort: 'latest_activity',
      availableSorts: ADVERTISER_SORT_OPTIONS,
      description: 'Brands, retailers, and marketing organizations',
      premium: false
    },
    {
      key: 'contacts',
      label: 'People',
      icon: 'Users',
      count: safeCount(overview.totalContacts),
      defaultSort: 'relevance',
      availableSorts: CONTACT_SORT_OPTIONS,
      description: 'Media professionals and decision makers',
      premium: false
    },
    {
      key: 'industries',
      label: 'Industries',
      icon: 'BarChart3',
      count: safeCount(overview.totalIndustries),
      defaultSort: 'company_count',
      availableSorts: INDUSTRY_SORT_OPTIONS,
      description: 'Industry verticals and market segments',
      premium: true
    }
  ];
};

// Tab-specific filter configurations
export const TAB_FILTER_CONFIG = {
  agencies: {
    primary: ['agencyType', 'employeeCount', 'city', 'verified'],
    secondary: ['revenueRange', 'state', 'region', 'dataQuality'],
    advanced: ['hasClients', 'parentCompany', 'lastVerified']
  },
  advertisers: {
    primary: ['industry', 'employeeCount', 'city', 'verified'],
    secondary: ['revenueRange', 'state', 'region', 'dataQuality'],
    advanced: ['hasAgencies', 'parentCompany', 'lastVerified']
  },
  contacts: {
    primary: ['department', 'seniority', 'company', 'verified'],
    secondary: ['roles', 'budgetRange', 'territories', 'isDecisionMaker'],
    advanced: ['dataQuality', 'lastVerified']
  },
  industries: {
    primary: ['companyType', 'employeeCount', 'region'],
    secondary: ['revenueRange', 'verified'],
    advanced: ['dataQuality']
  }
};

// Helper functions for tab management
export const getTabByKey = (key: string, analytics?: any): TabConfig | undefined => {
  return createTabConfigurations(analytics).find(tab => tab.key === key);
};

export const getDefaultSort = (tabKey: string): string => {
  const tab = getTabByKey(tabKey);
  return tab?.defaultSort || 'relevance';
};

export const getSortOptions = (tabKey: string): SortOption[] => {
  const tab = getTabByKey(tabKey);
  return tab?.availableSorts || [];
};

export const getFilterConfig = (tabKey: string) => {
  return TAB_FILTER_CONFIG[tabKey as keyof typeof TAB_FILTER_CONFIG] || TAB_FILTER_CONFIG.agencies;
};

// Format large numbers for display
export const formatCount = (count: number | undefined | null): string => {
  // Handle undefined/null values
  if (count == null || count === undefined) {
    return '0';
  }
  
  // Ensure count is a number
  const numCount = typeof count === 'number' ? count : parseInt(String(count)) || 0;
  
  if (numCount >= 1000000) {
    return `${(numCount / 1000000).toFixed(1)}M`;
  } else if (numCount >= 1000) {
    return `${(numCount / 1000).toFixed(1)}K`;
  }
  return numCount.toLocaleString();
};

// Get tab description with dynamic data
export const getTabDescription = (tab: TabConfig, searchQuery?: string): string => {
  const label = tab?.label || 'items';
  if (searchQuery && typeof searchQuery === 'string') {
    return `${formatCount(tab.count)} ${label.toLowerCase()} matching "${searchQuery}"`;
  }
  return `${formatCount(tab.count)} ${label.toLowerCase()} in our database`;
};

// Search result type mappings
export const TAB_RESULT_MAPPING = {
  agencies: 'companies',
  advertisers: 'companies', 
  contacts: 'contacts',
  industries: 'industries'
} as const;

// Enhanced search parameters for each tab
export const getTabSpecificFilters = (tabKey: string) => {
  switch (tabKey) {
    case 'agencies':
      return {
        companyType: [
          'INDEPENDENT_AGENCY',
          'HOLDING_COMPANY_AGENCY'
        ]
      };
    case 'advertisers':
      return {
        companyType: [
          'NATIONAL_ADVERTISER',
          'LOCAL_ADVERTISER'
        ]
      };
    case 'contacts':
      return {};
    case 'industries':
      return {};
    default:
      return {};
  }
}; 