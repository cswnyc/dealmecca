'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Search, 
  Building2, 
  Mail, 
  Phone,
  Download,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  ExternalLink,
  Shield
} from 'lucide-react';
import { Breadcrumb } from '@/components/admin/Breadcrumb';

interface Attendee {
  id: string;
  status: string;
  isGoing: boolean;
  hasAttended: boolean;
  registeredAt: string;
  user: {
    id: string;
    name: string;
    subscriptionTier: string;
  };
  company?: {
    id: string;
    name: string;
    companyType: string;
    industry: string;
    location: string;
    logoUrl?: string;
    verified: boolean;
    website?: string;
  };
  contact?: {
    id: string;
    name: string;
    title: string;
    department: string;
    seniority: string;
  };
  createdAt: string;
}

interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity?: number;
  status: string;
  capacityStatus: {
    isAtCapacity: boolean;
    isNearCapacity: boolean;
    isRegistrationClosed: boolean;
    availableSpots: number | null;
    fillPercentage: number;
  };
}

export default function EventAttendeesPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<Set<string>>(new Set());
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventAndAttendees();
    }
  }, [eventId, searchQuery, statusFilter, companyFilter]);

  const fetchEventAndAttendees = async () => {
    try {
      setLoading(true);
      
      // Fetch event details
      const eventResponse = await fetch(`/api/events/${eventId}`);
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        setEvent(eventData.event);
      }

      // Fetch attendees
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (companyFilter) params.append('company', companyFilter);
      
      const attendeesResponse = await fetch(`/api/events/${eventId}/attendees?${params}`);
      if (attendeesResponse.ok) {
        const attendeesData = await attendeesResponse.json();
        setAttendees(attendeesData.attendees || []);
      }
    } catch (error) {
      console.error('Failed to fetch event and attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendeeStatus = async (attendeeId: string, newStatus: string) => {
    try {
      await fetch(`/api/events/${eventId}/attendees`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          attendeeId,
          status: newStatus
        })
      });
      fetchEventAndAttendees();
    } catch (error) {
      console.error('Failed to update attendee status:', error);
    }
  };

  // Bulk selection functions
  const toggleAttendeeSelection = (attendeeId: string) => {
    const newSelection = new Set(selectedAttendeeIds);
    if (newSelection.has(attendeeId)) {
      newSelection.delete(attendeeId);
    } else {
      newSelection.add(attendeeId);
    }
    setSelectedAttendeeIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedAttendeeIds.size === attendees.length) {
      setSelectedAttendeeIds(new Set());
    } else {
      setSelectedAttendeeIds(new Set(attendees.map(a => a.id)));
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      setBulkOperationLoading(true);
      const attendeeIds = Array.from(selectedAttendeeIds);
      
      await Promise.all(
        attendeeIds.map(id => 
          fetch(`/api/events/${eventId}/attendees`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              attendeeId: id,
              status: newStatus
            })
          })
        )
      );

      await fetchEventAndAttendees();
      setSelectedAttendeeIds(new Set());
    } catch (error) {
      console.error('Failed to bulk update attendees:', error);
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const handleExportAttendees = async () => {
    try {
      setBulkOperationLoading(true);
      const attendeeIds = selectedAttendeeIds.size > 0 
        ? Array.from(selectedAttendeeIds)
        : attendees.map(a => a.id);
      
      const response = await fetch(`/api/events/${eventId}/attendees/export?ids=${attendeeIds.join(',')}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event?.name}-attendees-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Failed to export attendees:', error);
      alert('Failed to export attendees. Please try again.');
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTERED': return 'bg-green-100 text-green-800';
      case 'ATTENDING': return 'bg-blue-100 text-blue-800';
      case 'ATTENDED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800';
      case 'WAITLISTED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'REGISTERED': return <CheckCircle className="w-4 h-4" />;
      case 'ATTENDING': return <User className="w-4 h-4" />;
      case 'ATTENDED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'NO_SHOW': return <XCircle className="w-4 h-4" />;
      case 'WAITLISTED': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
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

  const getCompanyTypeColor = (type: string) => {
    switch (type) {
      case 'INDEPENDENT_AGENCY': return 'bg-blue-100 text-blue-800';
      case 'HOLDING_COMPANY_AGENCY': return 'bg-purple-100 text-purple-800';
      case 'NATIONAL_ADVERTISER': return 'bg-green-100 text-green-800';
      case 'MEDIA_HOLDING_COMPANY': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasSelectedAttendees = selectedAttendeeIds.size > 0;
  const selectedCount = selectedAttendeeIds.size;

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

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Event not found</p>
        <Link href="/admin/events">
          <Button variant="outline">← Back to Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Link href="/admin/events" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Events
          </Link>
          <Breadcrumb items={[
            { label: 'Events', href: '/admin/events', icon: Calendar },
            { label: event.name, href: `/admin/events/${eventId}` },
            { label: 'Attendees', icon: Users }
          ]} />
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleExportAttendees}
            disabled={bulkOperationLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Event Attendees</h1>
        <p className="text-gray-600">Manage attendees for {event.name}</p>
      </div>

      {/* Event Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Event Overview</span>
            <Badge className={getStatusColor(event.status)} variant="outline">
              {event.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{event.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {attendees.length} attendees
                {event.capacity && ` / ${event.capacity}`}
              </span>
            </div>
          </div>
          
          {event.capacity && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Capacity Status</span>
                <span>{event.capacityStatus.fillPercentage}% full</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    event.capacityStatus.isAtCapacity ? 'bg-red-500' :
                    event.capacityStatus.isNearCapacity ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${event.capacityStatus.fillPercentage}%` }}
                ></div>
              </div>
              {event.capacityStatus.isAtCapacity && (
                <p className="text-sm text-red-600 mt-1">Event is at capacity</p>
              )}
              {event.capacityStatus.isRegistrationClosed && (
                <p className="text-sm text-orange-600 mt-1">Registration is closed</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search attendees by name, company, title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="REGISTERED">Registered</SelectItem>
                  <SelectItem value="ATTENDING">Attending</SelectItem>
                  <SelectItem value="ATTENDED">Attended</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                  <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Companies</SelectItem>
                  {Array.from(new Set(attendees.map(a => a.company?.name).filter(Boolean))).map((company) => (
                    <SelectItem key={company} value={company || ''}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {attendees.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedAttendeeIds.size === attendees.length && attendees.length > 0}
                    indeterminate={selectedAttendeeIds.size > 0 && selectedAttendeeIds.size < attendees.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-gray-600">
                    {hasSelectedAttendees ? (
                      `${selectedCount} attendee${selectedCount > 1 ? 's' : ''} selected`
                    ) : (
                      'Select all'
                    )}
                  </span>
                </div>
              </div>
              
              {hasSelectedAttendees && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('ATTENDING')}
                    disabled={bulkOperationLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Attending
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('ATTENDED')}
                    disabled={bulkOperationLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Attended
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('CANCELLED')}
                    disabled={bulkOperationLoading}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Selected
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendees List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendees.map((attendee) => (
          <Card key={attendee.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedAttendeeIds.has(attendee.id)}
                    onCheckedChange={() => toggleAttendeeSelection(attendee.id)}
                  />
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {attendee.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{attendee.user.name}</CardTitle>
                    {attendee.contact && (
                      <p className="text-sm text-gray-600">{attendee.contact.title}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <Badge className={getStatusColor(attendee.status)} variant="outline">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(attendee.status)}
                      <span>{attendee.status}</span>
                    </div>
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {attendee.user.subscriptionTier}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Company Affiliation Section */}
              {attendee.company && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-start space-x-3">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      {attendee.company.logoUrl ? (
                        <img 
                          src={attendee.company.logoUrl} 
                          alt={`${attendee.company.name} logo`}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link 
                          href={`/orgs/companies/${attendee.company.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700 truncate"
                          target="_blank"
                        >
                          {attendee.company.name}
                        </Link>
                        {attendee.company.verified && (
                          <Shield className="w-3 h-3 text-green-600 flex-shrink-0" />
                        )}
                        <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge className={getCompanyTypeColor(attendee.company.companyType)} variant="outline">
                          {attendee.company.companyType.replace(/_/g, ' ')}
                        </Badge>
                        {attendee.company.industry && (
                          <Badge variant="outline" className="text-xs">
                            {attendee.company.industry}
                          </Badge>
                        )}
                      </div>
                      
                      {attendee.company.location && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{attendee.company.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Details */}
              <div className="space-y-2 text-sm text-gray-600">
                {attendee.contact && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getSeniorityColor(attendee.contact.seniority)} variant="outline">
                      {attendee.contact.seniority.replace(/_/g, ' ')}
                    </Badge>
                    {attendee.contact.department && (
                      <Badge variant="outline">
                        {attendee.contact.department.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500">📅 Registered {formatDate(attendee.registeredAt)}</p>
              </div>
              
              <div className="flex space-x-2 mt-4">
                {attendee.status === 'REGISTERED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateAttendeeStatus(attendee.id, 'ATTENDING')}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Attending
                  </Button>
                )}
                {attendee.status === 'ATTENDING' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateAttendeeStatus(attendee.id, 'ATTENDED')}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Attended
                  </Button>
                )}
                {['REGISTERED', 'ATTENDING'].includes(attendee.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateAttendeeStatus(attendee.id, 'CANCELLED')}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {attendees.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No attendees found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No attendees match your current filters.
          </p>
        </div>
      )}
    </div>
  );
} 