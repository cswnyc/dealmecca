'use client';

import { useState, useEffect } from 'react';
import { authedFetch } from '@/lib/authedFetch';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Building2,
  Verified,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  TrendingUp,
  Star,
  CheckSquare,
  XSquare,
  UserCheck,
  UserX,
  MoreHorizontal
} from 'lucide-react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  logoUrl: string;
  personalEmail: string;
  department: string;
  seniority: string;
  primaryRole: string;
  companyId: string;
  territories: string;
  accounts: string;
  budgetRange: string;
  isDecisionMaker: boolean;
  verified: boolean;
  dataQuality: string;
  lastVerified: string;
  isActive: boolean;
  preferredContact: string;
  communityScore: number;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    logoUrl: string;
    companyType: string;
    industry: string;
    city: string;
    state: string;
    verified: boolean;
  };
  _count: {
    interactions: number;
    notes: number;
    connections: number;
    viewedBy: number;
  };
  engagementScore: number;
  popularityScore: number;
  completenessScore: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface AdminStats {
  totalContacts: number;
  averageCommunityScore: number;
  uniqueCompaniesCount: number;
  contactsThisMonth: number;
  verificationStats: Record<string, number>;
  qualityStats: Record<string, number>;
  departmentStats: Array<{ department: string; count: number }>;
}

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSeniority, setSelectedSeniority] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [sortBy, setSortBy] = useState('fullName');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const router = useRouter();

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy
      });

      if (search) params.append('search', search);
      if (selectedCompany) params.append('companyId', selectedCompany);
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (selectedSeniority) params.append('seniority', selectedSeniority);
      if (verifiedFilter) params.append('verified', verifiedFilter);
      if (activeFilter) params.append('isActive', activeFilter);

      const response = await authedFetch(`/api/admin/contacts?${params}`);
      const data = await response.json();

      if (response.ok) {
        setContacts(data.contacts);
        setPagination(data.pagination);
        setAdminStats(data.adminStats);
      } else {
        setError(data.error || 'Failed to fetch contacts');
      }
    } catch (err) {
      setError('Failed to fetch contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchContacts();
  }, [pagination.page, search, selectedCompany, selectedDepartment, selectedSeniority, verifiedFilter, activeFilter, sortBy]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'company':
        setSelectedCompany(value);
        break;
      case 'department':
        setSelectedDepartment(value);
        break;
      case 'seniority':
        setSelectedSeniority(value);
        break;
      case 'verified':
        setVerifiedFilter(value);
        break;
      case 'active':
        setActiveFilter(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle contact selection
  const handleContactSelect = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedContacts.length === 0) return;

    try {
      const response = await authedFetch('/api/admin/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'bulk',
          action,
          contactIds: selectedContacts
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setSelectedContacts([]);
        fetchContacts(); // Refresh the list
      } else {
        const error = await response.json();
        alert('Bulk action failed: ' + error.error);
      }
    } catch (err) {
      alert('Bulk action failed');
    }
  };

  // Delete contact
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this contact?')) return;

    try {
      const response = await fetch(`/api/orgs/contacts/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchContacts(); // Refresh the list
      } else {
        const error = await response.json();
        alert('Failed to delete contact: ' + error.message);
      }
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              Contacts Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and organize contact profiles and relationships
            </p>
          </div>
          <Link
            href="/admin/orgs/contacts/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Contact
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
              <p className="text-2xl font-bold text-foreground">{pagination.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Verified className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Verified</p>
              <p className="text-2xl font-bold text-foreground">
                {adminStats?.verificationStats?.verified || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Companies with Contacts</p>
              <p className="text-2xl font-bold text-foreground">
                {adminStats?.uniqueCompaniesCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold text-foreground">
                {adminStats?.averageCommunityScore?.toFixed(1) || '0.0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold text-foreground">
                {adminStats?.contactsThisMonth || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="bg-white p-6 rounded-lg border border-border mb-6">
        {/* Bulk Actions */}
        {selectedContacts.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('verify')}
                  className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <UserCheck className="w-3 h-3 inline mr-1" />
                  Verify
                </button>
                <button
                  onClick={() => handleBulkAction('unverify')}
                  className="text-xs px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  <UserX className="w-3 h-3 inline mr-1" />
                  Unverify
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <XSquare className="w-3 h-3 inline mr-1" />
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            <option value="MEDIA_PLANNING">Media Planning</option>
            <option value="MEDIA_BUYING">Media Buying</option>
            <option value="DIGITAL_MARKETING">Digital Marketing</option>
            <option value="PROGRAMMATIC">Programmatic</option>
            <option value="SOCIAL_MEDIA">Social Media</option>
            <option value="SEARCH_MARKETING">Search Marketing</option>
            <option value="STRATEGY_PLANNING">Strategy & Planning</option>
            <option value="ANALYTICS_INSIGHTS">Analytics & Insights</option>
            <option value="CREATIVE_SERVICES">Creative Services</option>
            <option value="ACCOUNT_MANAGEMENT">Account Management</option>
            <option value="BUSINESS_DEVELOPMENT">Business Development</option>
            <option value="OPERATIONS">Operations</option>
            <option value="TECHNOLOGY">Technology</option>
            <option value="FINANCE">Finance</option>
            <option value="LEADERSHIP">Leadership</option>
            <option value="HUMAN_RESOURCES">Human Resources</option>
            <option value="SALES">Sales</option>
            <option value="MARKETING">Marketing</option>
            <option value="PRODUCT">Product</option>
            <option value="DATA_SCIENCE">Data Science</option>
          </select>

          {/* Seniority Filter */}
          <select
            value={selectedSeniority}
            onChange={(e) => handleFilterChange('seniority', e.target.value)}
            className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Levels</option>
            <option value="INTERN">Intern</option>
            <option value="COORDINATOR">Coordinator</option>
            <option value="SPECIALIST">Specialist</option>
            <option value="SENIOR_SPECIALIST">Senior Specialist</option>
            <option value="MANAGER">Manager</option>
            <option value="SENIOR_MANAGER">Senior Manager</option>
            <option value="DIRECTOR">Director</option>
            <option value="SENIOR_DIRECTOR">Senior Director</option>
            <option value="VP">VP</option>
            <option value="SVP">SVP</option>
            <option value="EVP">EVP</option>
            <option value="C_LEVEL">C-Level</option>
            <option value="FOUNDER_OWNER">Founder/Owner</option>
          </select>

          {/* Verified Filter */}
          <select
            value={verifiedFilter}
            onChange={(e) => handleFilterChange('verified', e.target.value)}
            className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>

          {/* Active Filter */}
          <select
            value={activeFilter}
            onChange={(e) => handleFilterChange('active', e.target.value)}
            className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Contacts</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="fullName">Name</option>
            <option value="title">Title</option>
            <option value="company">Company</option>
            <option value="department">Department</option>
            <option value="seniority">Seniority</option>
            <option value="created">Date Created</option>
            <option value="verified">Verification</option>
            <option value="communityScore">Community Score</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Contacts Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No contacts found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or add a new contact.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedContacts.length === contacts.length}
                        onChange={handleSelectAll}
                        className="rounded border-input text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Company & Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-muted">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => handleContactSelect(contact.id)}
                          className="rounded border-input text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {contact.logoUrl || contact.company.logoUrl ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={contact.logoUrl || contact.company.logoUrl}
                                alt={contact.fullName}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <Users className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">
                              {contact.fullName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {contact.department} • {contact.seniority}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">{contact.company.name}</div>
                        <div className="text-sm text-muted-foreground">{contact.title}</div>
                        {contact.isDecisionMaker && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Decision Maker
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {contact.email && (
                            <div className="text-sm text-foreground flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {contact.email}
                            </div>
                          )}
                          {contact.phone && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {contact.phone}
                            </div>
                          )}
                          {contact.linkedinUrl && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Linkedin className="w-3 h-3 mr-1" />
                              LinkedIn
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">{contact._count.interactions} interactions</div>
                        <div className="text-sm text-muted-foreground">{contact._count.notes} notes</div>
                        <div className="text-xs text-muted-foreground">Score: {contact.communityScore || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {contact.verified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Verified className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                          {!contact.isActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/orgs/contacts/${contact.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/orgs/contacts/${contact.id}/edit`}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {contact.linkedinUrl && (
                            <a
                              href={contact.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-border sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-input text-sm font-medium rounded-md text-muted-foreground bg-white hover:bg-muted disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-input text-sm font-medium rounded-md text-muted-foreground bg-white hover:bg-muted disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Showing{' '}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-input bg-white text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {[...Array(Math.min(pagination.pages, 10))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.page === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-input text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-input bg-white text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}