'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { OrganizationsHeader, CategoryType, Filter } from '@/components/organizations';
import { OrgListItem } from '@/components/orgs/OrgListItem';
import { useDarkMode } from '@/hooks/useDarkMode';
import { PageFrame, PageContent } from '@/components/layout/PageFrame';

// Force dynamic rendering for user-specific content
export const dynamic = 'force-dynamic';

interface Agency {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  verified: boolean;
  logoUrl?: string;
  teamCount: number;
  lastActivity: string;
}

interface Advertiser {
  id: string;
  name: string;
  type: string;
  industry: string;
  city: string;
  state: string;
  verified: boolean;
  logoUrl?: string;
  teamCount: number;
  lastActivity: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title?: string;
  email?: string;
  phone?: string;
  isDecisionMaker: boolean;
  lastActivity: string;
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

function OrganizationsV2Content() {
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  // State
  const [activeCategory, setActiveCategory] = useState<CategoryType>('agencies');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  // Data state
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  // Counts for tabs
  const [categoryCounts, setCategoryCounts] = useState<Partial<Record<CategoryType, number>>>({});

  // Fetch data based on active category
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let endpoint = '';
        switch (activeCategory) {
          case 'agencies':
            endpoint = '/api/organizations/agencies';
            break;
          case 'advertisers':
            endpoint = '/api/organizations/advertisers';
            break;
          case 'people':
            endpoint = '/api/organizations/people';
            break;
          case 'publishers':
            endpoint = '/api/organizations/publishers';
            break;
          case 'dsp-ssp':
            endpoint = '/api/organizations/dsp-ssp';
            break;
          case 'adtech':
            endpoint = '/api/organizations/adtech';
            break;
          default:
            endpoint = '/api/organizations/agencies';
        }

        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);

        const response = await fetch(`${endpoint}?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();

          switch (activeCategory) {
            case 'agencies':
              setAgencies(data.agencies || data);
              break;
            case 'advertisers':
              setAdvertisers(data.advertisers || data);
              break;
            case 'people':
              setContacts(data.contacts || data);
              break;
          }
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCategory, searchQuery]);

  // Get current data based on active category
  const getCurrentData = () => {
    switch (activeCategory) {
      case 'agencies':
        return agencies;
      case 'advertisers':
        return advertisers;
      case 'people':
        return contacts;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  const handleRemoveFilter = (id: string) => {
    setActiveFilters((filters) => filters.filter((f) => f.id !== id));
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
  };

  const handleOpenFilters = () => {
    setShowFilters(true);
  };

  return (
    <PageFrame>
      <OrganizationsHeader
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categoryCounts={categoryCounts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearFilters={handleClearFilters}
        onOpenFilters={handleOpenFilters}
        stats={{
          filtered: currentData.length,
          total: currentData.length,
          people: contacts.length,
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
        isDarkMode={isDark}
        onToggleDarkMode={toggleDarkMode}
      />

      <PageContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : currentData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No {activeCategory} found. Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeCategory === 'agencies' &&
              agencies.map((agency) => (
                <OrgListItem
                  key={agency.id}
                  id={agency.id}
                  name={agency.name}
                  type={agency.type}
                  location={{ city: agency.city, state: agency.state }}
                  verified={agency.verified}
                  logoUrl={agency.logoUrl}
                  href={`/orgs/companies/${agency.id}`}
                  searchQuery={searchQuery}
                />
              ))}

            {activeCategory === 'advertisers' &&
              advertisers.map((advertiser) => (
                <OrgListItem
                  key={advertiser.id}
                  id={advertiser.id}
                  name={advertiser.name}
                  type={advertiser.type}
                  location={{ city: advertiser.city, state: advertiser.state }}
                  verified={advertiser.verified}
                  logoUrl={advertiser.logoUrl}
                  href={`/orgs/companies/${advertiser.id}`}
                  searchQuery={searchQuery}
                  industry={advertiser.industry}
                />
              ))}

            {activeCategory === 'people' &&
              contacts.map((contact) => (
                <OrgListItem
                  key={contact.id}
                  id={contact.id}
                  name={contact.fullName}
                  type="contact"
                  location={undefined}
                  verified={false}
                  logoUrl={contact.company?.logoUrl}
                  href={`/contacts/${contact.id}`}
                  searchQuery={searchQuery}
                  subtitle={contact.title}
                />
              ))}
          </div>
        )}
      </PageContent>
    </PageFrame>
  );
}

export default function OrganizationsV2Page() {
  return (
    <AuthGuard>
      <OrganizationsV2Content />
    </AuthGuard>
  );
}
