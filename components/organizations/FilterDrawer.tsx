'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Types
interface FilterSubsection {
  title?: string;
  options: string[];
}

interface FilterSection {
  id: string;
  title: string;
  placeholder: string;
  subsections: FilterSubsection[];
}

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: {
    agencyTypes: string[];
    locations: string[];
    clients: string[];
    verified: boolean | null;
    teamSize: string | null;
  };
  onFilterChange: (filters: FilterDrawerProps['filters']) => void;
  onClearAll: () => void;
  resultCount: number;
  className?: string;
}

// Icons
const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Filter sections configuration
const filterSections: FilterSection[] = [
  {
    id: 'agencyType',
    title: 'By Agency Type',
    placeholder: 'Find partner...',
    subsections: [
      {
        title: 'Holding/Parent Co.',
        options: [
          'Independent Agency',
          'Omnicom Group',
          'Publicis Groupe',
          'WPP',
          'dentsu',
          'Spark Foundry',
          'OMD',
          'Mindshare',
          'EssenceMediacom',
          'Starcom Worldwide',
          'Horizon Media'
        ]
      }
    ]
  },
  {
    id: 'geography',
    title: 'By Geography',
    placeholder: 'Find any region, state, or city...',
    subsections: [
      {
        title: 'Regions',
        options: ['USA', 'Northeast', 'West', 'Midwest', 'Southeast', 'Southwest', 'Mid-Atlantic', 'Europe', 'Canada', 'United Kingdom']
      },
      {
        title: 'States',
        options: ['New York', 'California', 'Illinois', 'Texas', 'New Jersey', 'Massachusetts', 'Georgia', 'Washington', 'Ohio', 'Pennsylvania']
      },
      {
        title: 'Cities',
        options: ['New York City, NY', 'Chicago, IL', 'Los Angeles, CA', 'San Francisco, CA', 'Atlanta, GA', 'Boston, MA', 'Dallas, TX', 'Minneapolis, MN', 'Seattle, WA', 'Cincinnati, OH']
      }
    ]
  },
  {
    id: 'client',
    title: 'By Client',
    placeholder: 'Find client...',
    subsections: []
  },
  {
    id: 'clientIndustry',
    title: 'By Client Industry',
    placeholder: 'Find industry...',
    subsections: [
      {
        options: ['CPG', 'Consumer Goods', 'Retail', 'Health', 'Media / Entertainment', 'Technology', 'Telecom / Cable', 'Financial Services', 'Travel', 'Internet']
      }
    ]
  },
  {
    id: 'duty',
    title: 'By Duty',
    placeholder: 'Find duty...',
    subsections: [
      {
        title: 'Role',
        options: ['Buying', 'Planning', 'Strategy', 'Creative', 'AOR', 'PR', 'Analytics', 'CRM', 'Innovation', 'League Partnerships']
      },
      {
        title: 'Media Types',
        options: ['Digital', 'OOH', 'Programmatic', 'TV', 'Video', 'Print', 'Social Media', 'Event Sponsorship', 'Mobile', 'Display']
      },
      {
        title: 'Goals',
        options: ['Direct Response', 'Branding', 'Lead Gen', 'Demand Gen', 'Lower-Funnel', 'Upper-Funnel', 'Mid-Funnel', 'Partnerships', 'Expansion Projects', 'Consumer Growth']
      },
      {
        title: 'Geographies',
        options: ['United States', 'Canada', 'Texas', 'United Kingdom', 'Puerto Rico', 'Mexico', 'New York', 'Australia', 'Illinois', 'Arizona']
      },
      {
        title: 'Audiences',
        options: ['Holiday', 'Hispanic', 'Multicultural', 'Female', 'Back-to-School', 'Male', 'Millennials', 'Generation Z', 'Local', 'National']
      }
    ]
  }
];

export function FilterDrawer({
  open,
  onClose,
  filters,
  onFilterChange,
  onClearAll,
  resultCount,
  className,
}: FilterDrawerProps) {
  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    agencyType: true,
    geography: true,
    client: false,
    clientIndustry: false,
    duty: false,
  });

  // Track selected options per section
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({
    agencyType: [],
    geography: [],
    client: [],
    clientIndustry: [],
    duty: [],
  });

  // Track search queries per section
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({
    agencyType: '',
    geography: '',
    client: '',
    clientIndustry: '',
    duty: '',
  });

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleOption = (sectionId: string, option: string) => {
    setSelectedOptions(prev => {
      const current = prev[sectionId] || [];
      const isSelected = current.includes(option);
      return {
        ...prev,
        [sectionId]: isSelected
          ? current.filter(o => o !== option)
          : [...current, option]
      };
    });
  };

  // Sync selected options to parent when they change
  useEffect(() => {
    onFilterChange({
      ...filters,
      agencyTypes: selectedOptions.agencyType || [],
      locations: selectedOptions.geography || [],
      clients: selectedOptions.client || [],
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptions]);

  const isSelected = (sectionId: string, option: string) => {
    return (selectedOptions[sectionId] || []).includes(option);
  };

  const getSelectedCount = (sectionId: string) => {
    return (selectedOptions[sectionId] || []).length;
  };

  const getTotalSelectedCount = () => {
    return Object.values(selectedOptions).flat().length;
  };

  const handleClearAll = () => {
    setSelectedOptions({
      agencyType: [],
      geography: [],
      client: [],
      clientIndustry: [],
      duty: [],
    });
    setSearchQueries({
      agencyType: '',
      geography: '',
      client: '',
      clientIndustry: '',
      duty: '',
    });
    onClearAll();
  };

  const updateSearchQuery = (sectionId: string, query: string) => {
    setSearchQueries(prev => ({
      ...prev,
      [sectionId]: query
    }));
  };

  // Filter options based on search query
  const getFilteredOptions = (sectionId: string, options: string[]) => {
    const query = searchQueries[sectionId]?.toLowerCase() || '';
    if (!query) return options;
    return options.filter(option => option.toLowerCase().includes(query));
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
      >
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <h3 id="filter-drawer-title" className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
            Filter
          </h3>
          <div className="flex items-center gap-3 lg:gap-4">
            {getTotalSelectedCount() > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-[#2575FC] dark:text-[#5B8DFF] font-medium hover:underline"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close filters"
            >
              <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto">
          {filterSections.map((section, sectionIndex) => (
            <div key={section.id}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 lg:px-6 py-4"
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#2575FC] dark:text-[#5B8DFF]">
                    {getSelectedCount(section.id) > 0
                      ? `${getSelectedCount(section.id)} selected`
                      : `Any ${section.title.replace('By ', '').toLowerCase()}`}
                  </span>
                  <ChevronUpIcon
                    className={cn(
                      "w-5 h-5 text-gray-400 transition-transform duration-200",
                      !expandedSections[section.id] && "rotate-180"
                    )}
                  />
                </div>
              </button>

              {/* Section Content */}
              {expandedSections[section.id] && (
                <div className="px-4 lg:px-6 pb-4">
                  {/* Search Input */}
                  <div className="relative mb-4">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={section.placeholder}
                      value={searchQueries[section.id] || ''}
                      onChange={(e) => updateSearchQuery(section.id, e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-0 focus:ring-2 focus:ring-[#2575FC] dark:focus:ring-[#5B8DFF] outline-none"
                    />
                  </div>

                  {/* Subsections */}
                  {section.subsections.map((subsection, subIndex) => {
                    const filteredOptions = getFilteredOptions(section.id, subsection.options);

                    if (filteredOptions.length === 0) return null;

                    return (
                      <div key={subIndex} className="mb-4">
                        {/* Subsection Title */}
                        {subsection.title && (
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            {subsection.title}
                          </h4>
                        )}

                        {/* Pill Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {filteredOptions.map((option) => (
                            <button
                              key={option}
                              onClick={() => toggleOption(section.id, option)}
                              className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                isSelected(section.id, option)
                                  ? "bg-[#2575FC] dark:bg-[#5B8DFF] text-white"
                                  : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#2575FC] dark:hover:border-[#5B8DFF] hover:text-[#2575FC] dark:hover:text-[#5B8DFF]"
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty state for sections with no options */}
                  {section.subsections.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No options available
                    </p>
                  )}
                </div>
              )}

              {/* Section Divider */}
              {sectionIndex < filterSections.length - 1 && (
                <div className="border-t border-gray-200 dark:border-gray-700 mx-4 lg:mx-6" />
              )}
            </div>
          ))}
        </div>

        {/* Apply Button */}
        <div className="p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 safe-bottom">
          <button
            onClick={onClose}
            className="w-full py-3.5 lg:py-4 brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-base"
          >
            Show {resultCount.toLocaleString()} Results
          </button>
        </div>
      </div>
    </>
  );
}
