'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FilterPanelProps {
  filterState: {
    agencyType: string[];
    holdingCompany: string[];
    regions: string[];
    states: string[];
    cities: string[];
    client: string[];
    clientIndustry: string[];
    role: string[];
    mediaTypes: string[];
    goals: string[];
    audiences: string[];
  };
  setFilterState: React.Dispatch<React.SetStateAction<any>>;
  filteredCount: number;
  totalCount: number;
  onClose: () => void;
}

export function ComprehensiveFilterPanel({
  filterState,
  setFilterState,
  filteredCount,
  totalCount,
  onClose
}: FilterPanelProps) {
  const [agencySearchQuery, setAgencySearchQuery] = useState('');
  const [geographySearchQuery, setGeographySearchQuery] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [dutySearchQuery, setDutySearchQuery] = useState('');
  const [industrySearchQuery, setIndustrySearchQuery] = useState('');

  // Collapsible state for each section
  const [isAgencyTypeOpen, setIsAgencyTypeOpen] = useState(false);
  const [isGeographyOpen, setIsGeographyOpen] = useState(false);
  const [isClientOpen, setIsClientOpen] = useState(false);
  const [isClientIndustryOpen, setIsClientIndustryOpen] = useState(false);
  const [isDutyOpen, setIsDutyOpen] = useState(false);

  // Toggle function for multi-select filters
  const toggleFilter = (category: string, value: string) => {
    setFilterState((prev: any) => {
      const current = prev[category] as string[];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  // Mock data - these should come from your API/data
  const holdingCompanies = [
    'Independent Agency', 'Publicis Groupe', 'WPP', 'Omnicom Group',
    'Interpublic Group', 'Dentsu', 'Havas Group', 'OMD', 'EssenceMediacom',
    'Mindshare', 'Starcom Worldwide'
  ];

  const regions = ['USA', 'Northeast', 'West', 'Midwest', 'Southeast', 'Southwest', 'Mid-Atlantic', 'Europe', 'Canada', 'United Kingdom'];

  const states = [
    'New York', 'California', 'Illinois', 'Texas', 'New Jersey',
    'Massachusetts', 'Georgia', 'Washington', 'Ohio', 'Pennsylvania'
  ];

  const cities = [
    'New York City, NY', 'Chicago, IL', 'Los Angeles, CA', 'San Francisco, CA',
    'Boston, MA', 'Dallas, TX', 'Atlanta, GA', 'Minneapolis, MN',
    'Seattle, WA', 'Cincinnati, OH'
  ];

  const industries = [
    'CPG', 'Consumer Goods', 'Retail', 'Health',
    'Media / Entertainment', 'Telecom / Cable', 'Technology',
    'Financial Services', 'Travel', 'Internet'
  ];

  const roles = ['Buying', 'Planning', 'Strategy', 'Creative', 'AOR', 'PR', 'Analytics', 'CRM', 'Innovation', 'League Partnerships'];

  const mediaTypes = ['Digital', 'OOH', 'Programmatic', 'TV', 'Video', 'Print', 'Social Media', 'Mobile', 'Event Sponsorship', 'Data'];

  const goals = ['Direct Response', 'Branding', 'Lead Gen', 'Demand Gen', 'Lower-Funnel', 'Upper-Funnel', 'Mid-Funnel', 'Partnerships', 'Consumer Growth', 'Expansion Projects'];

  const geographies = ['United States', 'Canada', 'Texas', 'United Kingdom', 'Puerto Rico', 'Mexico', 'New York', 'Australia', 'Illinois', 'Arizona'];

  const audiences = ['Holiday', 'Multicultural', 'Hispanic', 'Female', 'Back-to-School', 'Male', 'Millennials', 'Generation Z', 'Local', 'Moms'];

  return (
    <div className="bg-card border border-border rounded-xl mb-6 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted">
        <h3 className="text-lg font-semibold text-foreground">Filter</h3>
      </div>

      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* By Agency Type - COLLAPSIBLE */}
        <div className="space-y-3 border-b border-border pb-4">
          <button
            onClick={() => setIsAgencyTypeOpen(!isAgencyTypeOpen)}
            className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
          >
            <label className="text-sm font-semibold text-foreground cursor-pointer">By Agency Type</label>
            {isAgencyTypeOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {isAgencyTypeOpen && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Find partner..."
                  value={agencySearchQuery}
                  onChange={(e) => setAgencySearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-foreground mb-2">Holding/Parent Co.</p>
                <div className="flex flex-wrap gap-2">
                  {holdingCompanies
                    .filter(hc => hc.toLowerCase().includes(agencySearchQuery.toLowerCase()))
                    .map((company) => (
                      <button
                        key={company}
                        onClick={() => toggleFilter('holdingCompany', company)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          filterState.holdingCompany.includes(company)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {company}
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* By Geography - COLLAPSIBLE */}
        <div className="space-y-3 border-b border-border pb-4">
          <button
            onClick={() => setIsGeographyOpen(!isGeographyOpen)}
            className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
          >
            <label className="text-sm font-semibold text-foreground cursor-pointer">By Geography</label>
            {isGeographyOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {isGeographyOpen && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Find any region, state, or city..."
                  value={geographySearchQuery}
                  onChange={(e) => setGeographySearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-foreground mb-2">Regions</p>
                <div className="flex flex-wrap gap-2">
                  {regions
                    .filter(r => r.toLowerCase().includes(geographySearchQuery.toLowerCase()))
                    .map((region) => (
                      <button
                        key={region}
                        onClick={() => toggleFilter('regions', region)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          filterState.regions.includes(region)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-foreground mb-2">States</p>
                <div className="flex flex-wrap gap-2">
                  {states
                    .filter(s => s.toLowerCase().includes(geographySearchQuery.toLowerCase()))
                    .map((state) => (
                      <button
                        key={state}
                        onClick={() => toggleFilter('states', state)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          filterState.states.includes(state)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {state}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-foreground mb-2">Cities</p>
                <div className="flex flex-wrap gap-2">
                  {cities
                    .filter(c => c.toLowerCase().includes(geographySearchQuery.toLowerCase()))
                    .map((city) => (
                      <button
                        key={city}
                        onClick={() => toggleFilter('cities', city)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          filterState.cities.includes(city)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* By Client - COLLAPSIBLE */}
        <div className="space-y-3 border-b border-border pb-4">
          <button
            onClick={() => setIsClientOpen(!isClientOpen)}
            className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
          >
            <label className="text-sm font-semibold text-foreground cursor-pointer">By Client</label>
            {isClientOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {isClientOpen && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Find client..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          )}
        </div>

        {/* By Client Industry - COLLAPSIBLE */}
        <div className="space-y-3 border-b border-border pb-4">
          <button
            onClick={() => setIsClientIndustryOpen(!isClientIndustryOpen)}
            className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
          >
            <label className="text-sm font-semibold text-foreground cursor-pointer">By Client Industry</label>
            {isClientIndustryOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {isClientIndustryOpen && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Find industry..."
                  value={industrySearchQuery}
                  onChange={(e) => setIndustrySearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {industries
                  .filter(i => i.toLowerCase().includes(industrySearchQuery.toLowerCase()))
                  .map((industry) => (
                    <button
                      key={industry}
                      onClick={() => toggleFilter('clientIndustry', industry)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        filterState.clientIndustry.includes(industry)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* By Duty - COLLAPSIBLE */}
        <div className="space-y-3">
          <button
            onClick={() => setIsDutyOpen(!isDutyOpen)}
            className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
          >
            <label className="text-sm font-semibold text-foreground cursor-pointer">By Duty</label>
            {isDutyOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {isDutyOpen && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Find duty..."
                  value={dutySearchQuery}
                  onChange={(e) => setDutySearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-foreground mb-2">Role</p>
                <div className="flex flex-wrap gap-2">
                  {roles
                    .filter(r => r.toLowerCase().includes(dutySearchQuery.toLowerCase()))
                    .map((role) => (
                      <button
                        key={role}
                        onClick={() => toggleFilter('role', role)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          filterState.role.includes(role)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-foreground mb-2">Media Types</p>
                <div className="flex flex-wrap gap-2">
                  {mediaTypes
                    .filter(mt => mt.toLowerCase().includes(dutySearchQuery.toLowerCase()))
                    .map((mediaType) => (
                      <button
                        key={mediaType}
                        onClick={() => toggleFilter('mediaTypes', mediaType)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          filterState.mediaTypes.includes(mediaType)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {mediaType}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-foreground mb-2">Goals</p>
                <div className="flex flex-wrap gap-2">
                  {goals
                    .filter(g => g.toLowerCase().includes(dutySearchQuery.toLowerCase()))
                    .map((goal) => (
                      <button
                        key={goal}
                        onClick={() => toggleFilter('goals', goal)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          filterState.goals.includes(goal)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-foreground mb-2">Geographies</p>
                <div className="flex flex-wrap gap-2">
                  {geographies
                    .filter(g => g.toLowerCase().includes(dutySearchQuery.toLowerCase()))
                    .slice(0, 10)
                    .map((geo) => (
                      <button
                        key={geo}
                        onClick={() => toggleFilter('regions', geo)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          filterState.regions.includes(geo)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {geo}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-foreground mb-2">Audiences</p>
                <div className="flex flex-wrap gap-2">
                  {audiences
                    .filter(a => a.toLowerCase().includes(dutySearchQuery.toLowerCase()))
                    .map((audience) => (
                      <button
                        key={audience}
                        onClick={() => toggleFilter('audiences', audience)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          filterState.audiences.includes(audience)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {audience}
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex items-center justify-between px-6 py-4 bg-muted border-t border-border">
        <div className="text-sm text-muted-foreground">
          Showing {filteredCount} of {totalCount} agencies
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFilterState({
              agencyType: [],
              holdingCompany: [],
              regions: [],
              states: [],
              cities: [],
              client: [],
              clientIndustry: [],
              agencyPartner: [],
              role: [],
              duty: [],
              mediaTypes: [],
              goals: [],
              audiences: [],
              company: [],
              seniority: [],
              department: [],
              industry: []
            })}
            className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
