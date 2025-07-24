export interface SearchFilters {
  companyType?: string[];
  industry?: string[];
  location?: string[];
  seniority?: string[];
  department?: string[];
  verified?: boolean;
  [key: string]: any;
}

export function buildSearchQuery(
  searchTerm: string, 
  filters: SearchFilters,
  searchType: 'company' | 'contact'
) {
  const where: any = { AND: [] };

  // Add text search
  if (searchTerm && searchTerm.length >= 2) {
    const textSearch = searchType === 'company' 
      ? {
          OR: [
            { name: { contains: searchTerm.toLowerCase() } },
            { description: { contains: searchTerm.toLowerCase() } },
            { city: { contains: searchTerm.toLowerCase() } }
          ]
        }
      : {
          OR: [
            { fullName: { contains: searchTerm.toLowerCase() } },
            { title: { contains: searchTerm.toLowerCase() } },
            { company: { name: { contains: searchTerm.toLowerCase() } } }
          ]
        };
    
    where.AND.push(textSearch);
  }

  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value && Array.isArray(value) && value.length > 0) {
      where.AND.push({ [key]: { in: value } });
    } else if (typeof value === 'boolean') {
      where.AND.push({ [key]: value });
    }
  });

  return where;
}

export function formatSearchResults(results: any[], searchType: 'company' | 'contact') {
  return results.map(result => {
    if (searchType === 'company') {
      return {
        id: result.id,
        name: result.name,
        type: result.companyType,
        location: `${result.city}, ${result.state}`,
        contactCount: result._count?.contacts || 0,
        verified: result.verified,
        logoUrl: result.logoUrl,
        description: result.description
      };
    } else {
      return {
        id: result.id,
        name: result.fullName,
        title: result.title,
        company: result.company.name,
        location: `${result.company.city}, ${result.company.state}`,
        seniority: result.seniority,
        department: result.department,
        verified: result.verified,
        companyLogo: result.company.logoUrl
      };
    }
  });
}

export function calculateSearchRelevance(
  result: any,
  searchTerm: string,
  filters: SearchFilters
): number {
  let score = 0;
  
  // Verification bonus
  if (result.verified) score += 10;
  
  // Exact name match bonus
  if (result.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
    score += 20;
  }
  
  // Data quality bonus
  if (result.dataQuality === 'VERIFIED') score += 8;
  if (result.dataQuality === 'PREMIUM') score += 5;
  
  // Contact count bonus (for companies)
  if (result._count?.contacts) {
    score += Math.min(result._count.contacts, 10);
  }
  
  // Seniority bonus (for contacts)
  const seniorityScores = {
    'C_LEVEL': 10,
    'SVP': 8,
    'VP': 6,
    'DIRECTOR': 4,
    'MANAGER': 2
  };
  
  if (result.seniority && seniorityScores[result.seniority as keyof typeof seniorityScores]) {
    score += seniorityScores[result.seniority as keyof typeof seniorityScores];
  }
  
  return score;
}

export async function getSearchSuggestions(
  query: string,
  type: 'company' | 'contact' | 'location' | 'all' = 'all'
) {
  // This would be called from your suggestion API
  // Returns formatted suggestions for auto-complete
  const suggestions = {
    companies: [],
    contacts: [],
    locations: [],
    recent: []
  };
  
  // Implementation would go here
  return suggestions;
}

export function normalizeSearchTerm(term: string): string {
  return term.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export function buildSortOptions(searchType: 'company' | 'contact') {
  const companyOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'name', label: 'Company Name' },
    { value: 'location', label: 'Location' },
    { value: 'size', label: 'Company Size' },
    { value: 'verified', label: 'Verified First' },
    { value: 'recent', label: 'Recently Updated' }
  ];

  const contactOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'name', label: 'Name' },
    { value: 'title', label: 'Job Title' },
    { value: 'company', label: 'Company' },
    { value: 'seniority', label: 'Seniority' },
    { value: 'recent', label: 'Recently Updated' }
  ];

  return searchType === 'company' ? companyOptions : contactOptions;
}

export function generateSearchUrl(
  baseUrl: string,
  searchTerm: string,
  filters: SearchFilters,
  pagination: { limit: number; offset: number }
): string {
  const params = new URLSearchParams();
  
  if (searchTerm) params.append('q', searchTerm);
  
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    } else if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  
  params.append('limit', String(pagination.limit));
  params.append('offset', String(pagination.offset));
  
  return `${baseUrl}?${params.toString()}`;
} 