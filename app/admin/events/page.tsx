'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authedFetch } from '@/lib/authedFetch';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Users,
  Clock,
  Globe,
  CheckSquare,
  XSquare,
  AlertCircle,
  Star,
  MoreHorizontal
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  slug: string;
  status: string;
  startDate: string;
  endDate: string;
  location?: string;
  isVirtual: boolean;
  maxAttendees?: number;
  registrationDeadline?: string;
  price?: number;
  currency: string;
  category: string;
  tags: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    attendees: number;
    ratings: number;
    discussions: number;
  };
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    upcoming: 0,
    past: 0
  });

  const router = useRouter();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter })
      });

      const response = await authedFetch(`/api/admin/events?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');

      const data = await response.json();
      setEvents(data.events || []);
      setTotalPages(Math.ceil(data.total / 20));
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Show empty state for now
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentPage, sortBy, statusFilter, categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents();
  };

  const handleBulkAction = async (action: string) => {
    if (selectedEvents.length === 0) return;

    try {
      const response = await authedFetch('/api/admin/events/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          eventIds: selectedEvents
        })
      });

      if (response.ok) {
        alert(`${action} applied to ${selectedEvents.length} events`);
        setSelectedEvents([]);
        fetchEvents();
      }
    } catch (error) {
      alert('Bulk action failed');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'PUBLISHED': 'bg-green-100 text-green-800',
      'DRAFT': 'bg-gray-100 text-gray-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'POSTPONED': 'bg-yellow-100 text-yellow-800'
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800';
  };

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  const isPast = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                Events Management
              </h1>
              <p className="text-muted-foreground mt-1">Manage events, registrations, and community gatherings</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/admin/events/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Event
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View Events
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="flex items-center">
              <CheckSquare className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-semibold text-foreground">{stats.published}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="flex items-center">
              <Edit className="w-8 h-8 text-muted-foreground" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-2xl font-semibold text-foreground">{stats.draft}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-semibold text-foreground">{stats.upcoming}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Past</p>
                <p className="text-2xl font-semibold text-foreground">{stats.past}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-0">
              <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">
                Search Events
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, description, or location..."
                  className="pl-9 w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="POSTPONED">Postponed</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
                Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="networking">Networking</option>
                <option value="webinar">Webinar</option>
                <option value="trade-show">Trade Show</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-foreground mb-1">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="startDate">Start Date</option>
                <option value="created">Created</option>
                <option value="title">Title</option>
                <option value="attendees">Attendees</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Bulk Actions */}
        {selectedEvents.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('unpublish')}
                  className="text-xs px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Unpublish
                </button>
                <button
                  onClick={() => handleBulkAction('feature')}
                  className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Feature
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Events Table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectedEvents.length === events.length && events.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEvents(events.map(e => e.id));
                        } else {
                          setSelectedEvents([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Attendees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Organizer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">No events found</p>
                      <p className="mt-1">Events management has been restored.</p>
                      <Link
                        href="/admin/events/new"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Create Your First Event
                      </Link>
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-muted">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEvents([...selectedEvents, event.id]);
                            } else {
                              setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="flex items-start space-x-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {event.name}
                                {event.avgOverallRating && (
                                  <Star className="inline w-4 h-4 ml-1 text-yellow-500" />
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {event.description?.substring(0, 100)}...
                              </p>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                {event.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">
                          <div className="flex items-center mb-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            {event.isVirtual ? (
                              <Globe className="w-4 h-4 mr-1" />
                            ) : (
                              <MapPin className="w-4 h-4 mr-1" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {event.isVirtual ? 'Virtual' : event.location || 'TBD'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
                          {event.status}
                        </span>
                        {isUpcoming(event.startDate) && (
                          <span className="block mt-1 text-xs text-purple-600">Upcoming</span>
                        )}
                        {isPast(event.endDate) && (
                          <span className="block mt-1 text-xs text-muted-foreground">Past</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {event._count?.attendees || 0}
                          {event.capacity && (
                            <span className="text-muted-foreground">/{event.capacity}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">{event.creator?.name || event.organizerName || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{event.creator?.email || event.organizerUrl || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/events/${event.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}/attendees`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <Users className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this event?')) {
                                try {
                                  const response = await authedFetch(`/api/admin/events/${event.id}`, {
                                    method: 'DELETE',
                                  });
                                  if (response.ok) {
                                    alert('Event deleted successfully');
                                    fetchEvents();
                                  } else {
                                    alert('Failed to delete event');
                                  }
                                } catch (error) {
                                  alert('Error deleting event');
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-foreground">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}