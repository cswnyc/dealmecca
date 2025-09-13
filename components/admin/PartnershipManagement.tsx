'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Trash2, 
  Building2, 
  Shield,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  companyType: string;
  city?: string;
  state?: string;
  logoUrl?: string;
  verified: boolean;
}

interface Partnership {
  id: string;
  relationshipType: string;
  isActive: boolean;
  contractValue?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  partner: Company;
  currentCompanyRole: 'agency' | 'advertiser';
}

interface PartnershipManagementProps {
  companyId: string;
  companyName: string;
  companyType: string;
}

const relationshipTypes = [
  { value: 'AGENCY_CLIENT', label: 'Agency Client' },
  { value: 'MEDIA_PARTNERSHIP', label: 'Media Partnership' },
  { value: 'STRATEGIC_ALLIANCE', label: 'Strategic Alliance' },
  { value: 'PREFERRED_VENDOR', label: 'Preferred Vendor' },
  { value: 'HOLDING_COMPANY_SUBSIDIARY', label: 'Holding Company Subsidiary' },
  { value: 'SISTER_AGENCY', label: 'Sister Agency' },
  { value: 'JOINT_VENTURE', label: 'Joint Venture' },
  { value: 'SUBCONTRACTOR', label: 'Subcontractor' }
];

export function PartnershipManagement({ 
  companyId, 
  companyName, 
  companyType 
}: PartnershipManagementProps) {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPartnership, setNewPartnership] = useState({
    partnerId: '',
    relationshipType: 'AGENCY_CLIENT',
    contractValue: '',
    notes: ''
  });

  // Fetch existing partnerships
  useEffect(() => {
    fetchPartnerships();
  }, [companyId]);

  const fetchPartnerships = async () => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/partnerships`);
      if (response.ok) {
        const data = await response.json();
        setPartnerships(data.partnerships || []);
      }
    } catch (error) {
      console.error('Failed to fetch partnerships:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCompanies = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/admin/companies?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current company and existing partners
        const existingPartnerIds = partnerships.map(p => p.partner.id);
        const filtered = (data.companies || []).filter((company: Company) => 
          company.id !== companyId && !existingPartnerIds.includes(company.id)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Failed to search companies:', error);
    } finally {
      setSearching(false);
    }
  };

  const createPartnership = async () => {
    if (!newPartnership.partnerId || !newPartnership.relationshipType) return;

    try {
      const isAgency = companyType.includes('AGENCY') || companyType === 'AGENCY';
      
      const response = await fetch('/api/admin/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId: isAgency ? companyId : newPartnership.partnerId,
          advertiserId: isAgency ? newPartnership.partnerId : companyId,
          relationshipType: newPartnership.relationshipType,
          contractValue: newPartnership.contractValue ? parseFloat(newPartnership.contractValue) : null,
          notes: newPartnership.notes || null
        })
      });

      if (response.ok) {
        setDialogOpen(false);
        setNewPartnership({
          partnerId: '',
          relationshipType: 'AGENCY_CLIENT',
          contractValue: '',
          notes: ''
        });
        setSearchResults([]);
        setSearchQuery('');
        fetchPartnerships(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create partnership');
      }
    } catch (error) {
      console.error('Failed to create partnership:', error);
      alert('Failed to create partnership');
    }
  };

  const deletePartnership = async (partnershipId: string) => {
    if (!confirm('Are you sure you want to delete this partnership?')) return;

    try {
      const response = await fetch(`/api/admin/partnerships/${partnershipId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPartnerships(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete partnership');
      }
    } catch (error) {
      console.error('Failed to delete partnership:', error);
      alert('Failed to delete partnership');
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const CompanyLogo = ({ company }: { company: Company }) => {
    if (company.logoUrl) {
      return (
        <img 
          src={company.logoUrl} 
          alt={`${company.name} logo`}
          className="w-8 h-8 rounded object-cover border border-gray-200"
        />
      );
    }
    return <Building2 className="w-8 h-8 text-blue-600" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Partnership Management</h3>
          <p className="text-sm text-gray-500">
            Manage {companyName}'s business partnerships and relationships
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Partnership</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Search for companies */}
              <div>
                <Label>Search for Partner Company</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchCompanies(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>
                
                {/* Search results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg bg-white">
                    {searchResults.map((company) => (
                      <div
                        key={company.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center space-x-3"
                        onClick={() => {
                          setNewPartnership({ ...newPartnership, partnerId: company.id });
                          setSearchQuery(company.name);
                          setSearchResults([]);
                        }}
                      >
                        <CompanyLogo company={company} />
                        <div className="flex-1">
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-gray-500">
                            {company.companyType.replace(/_/g, ' ')}
                            {company.city && company.state && ` • ${company.city}, ${company.state}`}
                          </div>
                        </div>
                        {company.verified && (
                          <Shield className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Partnership details */}
              <div>
                <Label>Relationship Type</Label>
                <Select
                  value={newPartnership.relationshipType}
                  onValueChange={(value) => setNewPartnership({ ...newPartnership, relationshipType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Contract Value (Optional)</Label>
                <Input
                  type="number"
                  placeholder="Enter value..."
                  value={newPartnership.contractValue}
                  onChange={(e) => setNewPartnership({ ...newPartnership, contractValue: e.target.value })}
                />
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Partnership details..."
                  value={newPartnership.notes}
                  onChange={(e) => setNewPartnership({ ...newPartnership, notes: e.target.value })}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={createPartnership} disabled={!newPartnership.partnerId}>
                  Create Partnership
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Partnerships list */}
      <div className="space-y-4">
        {partnerships.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No partnerships yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a partnership with another company.
              </p>
            </CardContent>
          </Card>
        ) : (
          partnerships.map((partnership) => (
            <Card key={partnership.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <CompanyLogo company={partnership.partner} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{partnership.partner.name}</h4>
                        {partnership.partner.verified && (
                          <Shield className="w-4 h-4 text-green-600" />
                        )}
                        <Badge variant={partnership.isActive ? "default" : "secondary"}>
                          {partnership.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {partnership.partner.companyType.replace(/_/g, ' ')}
                        {partnership.partner.city && partnership.partner.state && 
                          ` • ${partnership.partner.city}, ${partnership.partner.state}`
                        }
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {partnership.relationshipType.replace(/_/g, ' ')}
                        </span>
                        {partnership.contractValue && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>{formatCurrency(partnership.contractValue)}</span>
                          </div>
                        )}
                        {partnership.startDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Since {formatDate(partnership.startDate)}</span>
                          </div>
                        )}
                      </div>
                      {partnership.notes && (
                        <p className="text-sm text-gray-600 mt-2">{partnership.notes}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePartnership(partnership.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}