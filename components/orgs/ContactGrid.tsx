'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Building2, MapPin, Mail, Phone, LinkedinIcon, Shield, Star } from 'lucide-react';

interface Contact {
  id: string;
  fullName: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  seniority: string;
  department?: string;
  roles: string[];
  verified: boolean;
  company: {
    id: string;
    name: string;
    city?: string;
    state?: string;
    companyType: string;
    logoUrl?: string;
    verified: boolean;
  };
}

interface ContactGridProps {
  contacts: Contact[];
  loading: boolean;
}

export function ContactGrid({ contacts, loading }: ContactGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Add comprehensive null safety checks
  const safeContacts = (() => {
    if (!contacts) {
      return [];
    }
    if (!Array.isArray(contacts)) {
      console.error('ContactGrid: contacts prop is not an array:', typeof contacts, contacts);
      return [];
    }
    return contacts;
  })();

  if (loading && safeContacts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (safeContacts.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filters to find the right professionals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 text-center sm:text-left">
          Showing {safeContacts.length} contacts
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="flex-1 sm:flex-none min-h-[44px]"
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex-1 sm:flex-none min-h-[44px]"
          >
            List
          </Button>
        </div>
      </div>

      {/* Contact Grid */}
      <div className={`${viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
        : "space-y-4"
      } mobile-scroll-optimize`}
      >
        {safeContacts.map((contact) => (
          <ContactCard 
            key={contact.id} 
            contact={contact} 
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Mobile scroll optimization styles */}
      <style jsx>{`
        .mobile-scroll-optimize {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        
        /* Improve touch responsiveness */
        @media (max-width: 768px) {
          .mobile-scroll-optimize > * {
            touch-action: manipulation;
          }
        }
      `}</style>
    </div>
  );
}

function ContactCard({ contact, viewMode }: { contact: Contact; viewMode: 'grid' | 'list' }) {
  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'C_LEVEL': return 'bg-red-600 text-white';
      case 'SVP': case 'VP': return 'bg-purple-100 text-purple-800';
      case 'DIRECTOR': case 'SENIOR_DIRECTOR': return 'bg-blue-100 text-blue-800';
      case 'MANAGER': case 'SENIOR_MANAGER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
              {/* Avatar */}
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {getInitials(contact.fullName)}
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                  <Link href={`/contacts/${contact.id}`} className="group">
                    <h3 className="font-semibold text-lg truncate group-hover:text-blue-600 group-hover:underline">
                      {contact.fullName}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-center sm:justify-start">
                    {contact.verified && (
                      <Shield className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-2 truncate">{contact.title}</p>

                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 mb-3">
                  {contact.company ? (
                    <>
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <Building2 className="w-3 h-3" />
                        <Link href={`/orgs/companies/${contact.company.id}`} className="hover:text-blue-600 truncate">
                          {contact.company.name}
                        </Link>
                      </div>
                      
                      {contact.company.city && contact.company.state && (
                        <div className="flex items-center justify-center sm:justify-start space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{contact.company.city}, {contact.company.state}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center sm:justify-start space-x-1">
                      <Building2 className="w-3 h-3" />
                      <span className="text-gray-400">No company information</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Badge className={getSeniorityColor(contact.seniority)}>
                    {contact.seniority.replace(/_/g, ' ')}
                  </Badge>
                  {contact.department && (
                    <Badge variant="outline" className="text-xs">
                      {contact.department.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto min-h-[44px]"
                asChild
              >
                <Link href={`/contacts/${contact.id}`}>
                  <User className="w-4 h-4 mr-2" />
                  View
                </Link>
              </Button>
              
              {contact.email && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto min-h-[44px]"
                  asChild
                >
                  <a href={`mailto:${contact.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {getInitials(contact.fullName)}
            </div>
            
            {/* Name & Title */}
            <div className="flex-1 min-w-0">
              <Link href={`/contacts/${contact.id}`} className="group">
                <h3 className="font-semibold text-lg truncate group-hover:text-blue-600 group-hover:underline cursor-pointer">
                  {contact.fullName}
                </h3>
              </Link>
              <p className="text-sm text-gray-600 truncate">
                {contact.title}
              </p>
            </div>
          </div>

          {/* Verification Badge */}
          {contact.verified && (
            <Badge className="flex items-center space-x-1 bg-green-100 text-green-800">
              <Shield className="w-3 h-3" />
              <span>Verified</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Company Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            {contact.company ? (
              <>
                {contact.company.logoUrl ? (
                  <img 
                    src={contact.company.logoUrl} 
                    alt={contact.company.name}
                    className="w-6 h-6 rounded object-cover"
                  />
                ) : (
                  <Building2 className="w-4 h-4 text-gray-500" />
                )}
                <Link href={`/orgs/companies/${contact.company.id}`} className="text-sm font-medium hover:text-blue-600 truncate">
                  {contact.company.name}
                </Link>
                {contact.company.verified && (
                  <Shield className="w-3 h-3 text-green-600" />
                )}
              </>
            ) : (
              <div className="text-sm font-medium text-gray-500 truncate">No company information</div>
            )}
          </div>
          
          {contact.company?.city && contact.company?.state && (
            <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{contact.company.city}, {contact.company.state}</span>
            </div>
          )}
        </div>

        {/* Professional Details */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className={getSeniorityColor(contact.seniority)}>
              {contact.seniority.replace(/_/g, ' ')}
            </Badge>
            {contact.department && (
              <Badge variant="outline">
                {contact.department.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>

          {/* Roles */}
          {contact.roles && contact.roles.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Roles</div>
              <div className="flex flex-wrap gap-1">
                {contact.roles.slice(0, 3).map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role.replace(/_/g, ' ')}
                  </Badge>
                ))}
                {contact.roles.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{contact.roles.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Contact Methods */}
          <div className="flex space-x-2 pt-2">
            {contact.email && (
              <Button variant="outline" size="sm" asChild className="flex-1">
                <a href={`mailto:${contact.email}`}>
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </a>
              </Button>
            )}
            {contact.linkedinUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <LinkedinIcon className="w-3 h-3" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 