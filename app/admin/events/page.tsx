'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  Settings,
  Trash2,
  ArrowLeft,
  Eye,
  Copy,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Breadcrumb } from '@/components/admin/Breadcrumb';

interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  venue?: string;
  category: string;
  status: string;
  capacity?: number;
  registrationDeadline?: string;
  isVirtual: boolean;
  isHybrid: boolean;
  attendeesCount: number;
  ratingsCount: number;
  creator?: {
    id: string;
    name: string;
  };
  capacityStatus: {
    isAtCapacity: boolean;
    isNearCapacity: boolean;
    isRegistrationClosed: boolean;
    availableSpots: number | null;
    fillPercentage: number;
  };
  createdAt: string;
}

export default function EventsAdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);
  const [companiesWithAttendees, setCompaniesWithAttendees] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, statusFilter, categoryFilter, companyFilter]);

  useEffect(() => {
    fetchCompaniesWithAttendees();
  }, []);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (companyFilter) params.append('company', companyFilter);
      
      // Admin can see all statuses
      const response = await fetch(`/api/events?${params}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompaniesWithAttendees = async () => {
    try {
      const response = await fetch('/api/events/companies-with-attendees');
      const data = await response.json();
      setCompaniesWithAttendees(data.companies || []);
    } catch (error) {
      console.error('Failed to fetch companies with attendees:', error);
    }
  };

  const updateEventStatus = async (eventId: string, newStatus: string) => {
    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchEvents();
    } catch (error) {
      console.error('Failed to update event status:', error);
    }
  };

  const duplicateEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      const duplicateData = {
        name: `${event.name} (Copy)`,
        description: event.description,
        location: event.location,
        venue: event.venue,
        category: event.category,
        isVirtual: event.isVirtual,
        isHybrid: event.isHybrid,
        capacity: event.capacity,
        status: 'DRAFT',
        // Set dates to next month
        startDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1, new Date().getDate() + 1)).toISOString()
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      });

      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Failed to duplicate event:', error);
    }
  };

  // Bulk selection functions
  const toggleEventSelection = (eventId: string) => {
    const newSelection = new Set(selectedEventIds);
    if (newSelection.has(eventId)) {
      newSelection.delete(eventId);
    } else {
      newSelection.add(eventId);
    }
    setSelectedEventIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedEventIds.size === events.length) {
      setSelectedEventIds(new Set());
    } else {
      setSelectedEventIds(new Set(events.map(e => e.id)));
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      setBulkOperationLoading(true);
      const eventIds = Array.from(selectedEventIds);
      
      await Promise.all(
        eventIds.map(id => 
          fetch(`/api/events/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          })
        )
      );

      await fetchEvents();
      setSelectedEventIds(new Set());
    } catch (error) {
      console.error('Failed to bulk update events:', error);
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return <CheckCircle className="w-4 h-4" />;
      case 'DRAFT': return <Edit className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'SUSPENDED': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasSelectedEvents = selectedEventIds.size > 0;
  const selectedCount = selectedEventIds.size;

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
            { label: 'Events', icon: Calendar }
          ]} />
        </div>
        <div className="flex gap-3">
          <Link href="/admin/events/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
        <p className="text-gray-600">Manage events, attendees, and capacity</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events by name, location, organizer..."
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
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="CONFERENCE">Conference</SelectItem>
                  <SelectItem value="TRADE_SHOW">Trade Show</SelectItem>
                  <SelectItem value="SUMMIT">Summit</SelectItem>
                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  <SelectItem value="NETWORKING">Networking</SelectItem>
                  <SelectItem value="WEBINAR">Webinar</SelectItem>
                </SelectContent>
              </Select>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Companies</SelectItem>
                  {companiesWithAttendees.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {events.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedEventIds.size === events.length && events.length > 0}
                    indeterminate={selectedEventIds.size > 0 && selectedEventIds.size < events.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-gray-600">
                    {hasSelectedEvents ? (
                      `${selectedCount} event${selectedCount > 1 ? 's' : ''} selected`
                    ) : (
                      'Select all'
                    )}
                  </span>
                </div>
              </div>
              
              {hasSelectedEvents && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('PUBLISHED')}
                    disabled={bulkOperationLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Publish Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('DRAFT')}
                    disabled={bulkOperationLoading}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Set to Draft
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

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedEventIds.has(event.id)}
                    onCheckedChange={() => toggleEventSelection(event.id)}
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{event.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(event.startDate)} - {formatDate(event.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <Badge className={getStatusColor(event.status)} variant="outline">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(event.status)}
                      <span>{event.status}</span>
                    </div>
                  </Badge>
                  {event.capacityStatus.isAtCapacity && (
                    <Badge variant="destructive" className="text-xs">
                      FULL
                    </Badge>
                  )}
                  {event.capacityStatus.isRegistrationClosed && (
                    <Badge variant="secondary" className="text-xs">
                      CLOSED
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {event.isVirtual ? 'Virtual Event' : event.location}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {event.attendeesCount} attendees
                    {event.capacity && ` / ${event.capacity}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <Badge variant="outline" className="text-xs">
                    {event.category}
                  </Badge>
                </div>
                {event.creator && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs">Created by {event.creator.name}</span>
                  </div>
                )}
                <p className="text-xs">📅 Created {formatDate(event.createdAt)}</p>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Link href={`/admin/events/${event.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Link href={`/admin/events/${event.id}/attendees`}>
                  <Button variant="outline" size="sm">
                    <Users className="w-3 h-3 mr-1" />
                    Attendees
                  </Button>
                </Link>
                {event.status === 'DRAFT' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateEventStatus(event.id, 'PUBLISHED')}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Publish
                  </Button>
                )}
                {event.status === 'PUBLISHED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateEventStatus(event.id, 'CANCELLED')}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateEvent(event.id)}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Duplicate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first event.
          </p>
          <div className="mt-6">
            <Link href="/admin/events/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 