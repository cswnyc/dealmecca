'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Plus,
  Building2,
  Edit3,
  Trash2,
  X,
  Search,
  Filter
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  companyId: string;
  description?: string;
  type: string;
  isActive: boolean;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    companyType: string;
  };
  _count: {
    ContactTeam: number;
    PartnershipTeam: number;
  };
}

const teamTypes = [
  { value: 'AGENCY_TEAM', label: 'Agency Team' },
  { value: 'ADVERTISER_TEAM', label: 'Advertiser Team' },
  { value: 'INTERNAL_TEAM', label: 'Internal Team' },
  { value: 'PROJECT_TEAM', label: 'Project Team' }
];

export default function TeamsAdminPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [companies, setCompanies] = useState<any[]>([]);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    description: '',
    type: 'INTERNAL_TEAM'
  });

  useEffect(() => {
    fetchTeams();
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterTeams();
  }, [teams, searchTerm, selectedType]);

  useEffect(() => {
    // Filter companies for searchable dropdown
    if (companySearchTerm) {
      const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
        c.city?.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
        c.state?.toLowerCase().includes(companySearchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [companies, companySearchTerm]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orgs/teams');
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/orgs/companies?limit=10000');
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const filterTeams = () => {
    let filtered = teams;

    if (searchTerm) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(team => team.type === selectedType);
    }

    setFilteredTeams(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingTeam ? `/api/orgs/teams/${editingTeam.id}` : '/api/orgs/teams';
      const method = editingTeam ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save team');
      }

      await fetchTeams();
      resetForm();
    } catch (error: any) {
      console.error('Error saving team:', error);
      alert(`Failed to save team: ${error.message}`);
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const response = await fetch(`/api/orgs/teams/${teamId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete team');
      }

      await fetchTeams();
    } catch (error: any) {
      console.error('Error deleting team:', error);
      alert(`Failed to delete team: ${error.message}`);
    }
  };

  const startEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      companyId: team.companyId,
      description: team.description || '',
      type: team.type
    });
    // Set company search term to the company name for editing
    const company = companies.find(c => c.id === team.companyId);
    if (company) {
      setCompanySearchTerm(company.name);
    }
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      companyId: '',
      description: '',
      type: 'INTERNAL_TEAM'
    });
    setEditingTeam(null);
    setShowCreateForm(false);
    setCompanySearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teams Management</h1>
              <p className="text-gray-600 mt-1">Create and manage teams across organizations</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search teams or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-48">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {teamTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingTeam ? 'Edit Team' : 'Create New Team'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Team Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Facebook Team"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="companySearch">Search Company *</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="companySearch"
                        value={companySearchTerm}
                        onChange={(e) => setCompanySearchTerm(e.target.value)}
                        placeholder="Search by company name, city, or state..."
                        className="pl-10"
                      />
                    </div>
                    {companySearchTerm && (
                      <div className="mt-2 max-h-48 overflow-y-auto border rounded-md bg-white">
                        {filteredCompanies.length > 0 ? (
                          filteredCompanies.slice(0, 50).map(company => (
                            <div
                              key={company.id}
                              onClick={() => {
                                setFormData({...formData, companyId: company.id});
                                setCompanySearchTerm(company.name);
                              }}
                              className={`p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 ${
                                formData.companyId === company.id ? 'bg-blue-50' : ''
                              }`}
                            >
                              <p className="font-medium text-sm">{company.name}</p>
                              <p className="text-xs text-gray-500">
                                {company.city && company.state
                                  ? `${company.city}, ${company.state}`
                                  : company.city || company.state || 'Location not specified'}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="p-3 text-sm text-gray-500">No companies found</p>
                        )}
                      </div>
                    )}
                    {!companySearchTerm && formData.companyId && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {companies.find(c => c.id === formData.companyId)?.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="type">Team Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {teamTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe the team's purpose and responsibilities..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTeam ? 'Update Team' : 'Create Team'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Teams List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading teams...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No teams found</p>
            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create First Team
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Actions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Members
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeams.map(team => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(team)}
                          className="text-blue-600 hover:text-blue-700 h-8 w-8 p-0"
                          title="Edit team"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(team.id)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                          title="Delete team"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                      {team.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs" title={team.description}>
                          {team.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/companies/${team.company.id}`}
                        className="text-sm text-gray-600 hover:text-blue-600"
                      >
                        {team.company.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">
                        {team.type.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{team._count.ContactTeam}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
