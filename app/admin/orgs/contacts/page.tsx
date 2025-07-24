'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import BulkEditModal from '@/components/admin/BulkEditModal';
import BulkDeleteModal from '@/components/admin/BulkDeleteModal';
import { 
  Plus, 
  Search, 
  Edit, 
  Shield, 
  Users, 
  Building2, 
  Mail, 
  Phone, 
  Upload,
  Download,
  Settings,
  Trash2,
  CheckSquare,
  Square,
  ArrowLeft
} from 'lucide-react';
import { Breadcrumb } from '@/components/admin/Breadcrumb';

interface Contact {
  id: string;
  fullName: string;
  title: string;
  email?: string;
  phone?: string;
  department?: string;
  seniority: string;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
  company: {
    id: string;
    name: string;
    companyType: string;
  };
}

export default function ContactsAdminPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [searchQuery]);

  const fetchContacts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      
      const response = await fetch(`/api/admin/contacts?${params}`);
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (contactId: string, verified: boolean) => {
    try {
      await fetch(`/api/admin/contacts/${contactId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !verified })
      });
      fetchContacts();
    } catch (error) {
      console.error('Failed to update verification:', error);
    }
  };

  const toggleActive = async (contactId: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });
      fetchContacts();
    } catch (error) {
      console.error('Failed to update active status:', error);
    }
  };

  // Bulk selection functions
  const toggleContactSelection = (contactId: string) => {
    const newSelection = new Set(selectedContactIds);
    if (newSelection.has(contactId)) {
      newSelection.delete(contactId);
    } else {
      newSelection.add(contactId);
    }
    setSelectedContactIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedContactIds.size === contacts.length) {
      setSelectedContactIds(new Set());
    } else {
      setSelectedContactIds(new Set(contacts.map(c => c.id)));
    }
  };

  const getSelectedContacts = () => {
    return contacts.filter(contact => selectedContactIds.has(contact.id));
  };

  // Export functionality
  const handleExportCSV = async () => {
    try {
      setBulkOperationLoading(true);
      const contactIds = Array.from(selectedContactIds);
      
      if (contactIds.length === 0) {
        alert('Please select contacts to export');
        return;
      }

      const response = await fetch(`/api/admin/contacts/bulk?ids=${contactIds.join(',')}&format=csv`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Failed to export contacts:', error);
      alert('Failed to export contacts. Please try again.');
    } finally {
      setBulkOperationLoading(false);
    }
  };

  // Bulk edit functionality
  const handleBulkEdit = async (updateData: any) => {
    try {
      setBulkOperationLoading(true);
      const contactIds = Array.from(selectedContactIds);
      
      const response = await fetch('/api/admin/contacts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'edit',
          contactIds,
          data: updateData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchContacts();
        setSelectedContactIds(new Set());
        setBulkEditModalOpen(false);
      } else {
        throw new Error(result.error || 'Bulk edit failed');
      }
    } catch (error) {
      console.error('Failed to bulk edit contacts:', error);
      alert('Failed to update contacts. Please try again.');
    } finally {
      setBulkOperationLoading(false);
    }
  };

  // Bulk delete functionality
  const handleBulkDelete = async () => {
    try {
      setBulkOperationLoading(true);
      const contactIds = Array.from(selectedContactIds);
      
      const response = await fetch('/api/admin/contacts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'delete',
          contactIds
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchContacts();
        setSelectedContactIds(new Set());
        setBulkDeleteModalOpen(false);
      } else {
        throw new Error(result.error || 'Bulk delete failed');
      }
    } catch (error) {
      console.error('Failed to bulk delete contacts:', error);
      alert('Failed to delete contacts. Please try again.');
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'C_LEVEL': return 'bg-purple-100 text-purple-800';
      case 'VP': return 'bg-blue-100 text-blue-800';
      case 'DIRECTOR': return 'bg-green-100 text-green-800';
      case 'MANAGER': return 'bg-yellow-100 text-yellow-800';
      case 'SENIOR': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasSelectedContacts = selectedContactIds.size > 0;
  const selectedCount = selectedContactIds.size;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Admin Dashboard
          </Link>
          <Breadcrumb items={[
            { label: 'Organizations', href: '/admin/orgs' },
            { label: 'Contacts', icon: Users }
          ]} />
        </div>
        <div className="flex gap-3">
          <Link href="/admin/orgs/contacts/import">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          </Link>
          <Link href="/admin/orgs/contacts/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
        <p className="text-gray-600">Manage professional contacts and relationships</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search contacts by name, title, company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {contacts.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedContactIds.size === contacts.length && contacts.length > 0}
                    indeterminate={selectedContactIds.size > 0 && selectedContactIds.size < contacts.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-gray-600">
                    {hasSelectedContacts ? (
                      `${selectedCount} contact${selectedCount > 1 ? 's' : ''} selected`
                    ) : (
                      'Select all'
                    )}
                  </span>
                </div>
              </div>
              
              {hasSelectedContacts && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    disabled={bulkOperationLoading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkEditModalOpen(true)}
                    disabled={bulkOperationLoading}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Bulk Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteModalOpen(true)}
                    disabled={bulkOperationLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedContactIds.has(contact.id)}
                    onCheckedChange={() => toggleContactSelection(contact.id)}
                  />
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {contact.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{contact.fullName}</CardTitle>
                    <p className="text-sm text-gray-600">{contact.title}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <Badge variant={contact.verified ? "default" : "secondary"}>
                    {contact.verified ? "Verified" : "Unverified"}
                  </Badge>
                  {!contact.isActive && (
                    <Badge variant="destructive">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>{contact.company.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getSeniorityColor(contact.seniority)} variant="outline">
                    {contact.seniority.replace(/_/g, ' ')}
                  </Badge>
                  {contact.department && (
                    <Badge variant="outline">
                      {contact.department.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
                {contact.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                <p>📅 Added {new Date(contact.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Link href={`/admin/orgs/contacts/${contact.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleVerification(contact.id, contact.verified)}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {contact.verified ? 'Unverify' : 'Verify'}
                </Button>
                <Button
                  variant={contact.isActive ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleActive(contact.id, contact.isActive)}
                >
                  {contact.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contacts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new contact.
          </p>
          <div className="mt-6">
            <Link href="/admin/orgs/contacts/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={bulkEditModalOpen}
        onClose={() => setBulkEditModalOpen(false)}
        selectedContacts={getSelectedContacts()}
        onBulkUpdate={handleBulkEdit}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        selectedContacts={getSelectedContacts()}
        onBulkDelete={handleBulkDelete}
      />
    </div>
  );
} 