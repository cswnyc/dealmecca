'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building2, 
  Shield, 
  Star, 
  Heart, 
  Edit3, 
  ExternalLink,
  MoreVertical,
  Flag,
  Share2,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  seniority: string;
  department?: string;
  primaryRole?: string;
  verified: boolean;
  dataQuality: number;
  verificationDate?: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    verified: boolean;
    city?: string;
    state?: string;
    companyType: string;
  };
}

interface ContactHeaderProps {
  contact: Contact;
  loading?: boolean;
  onSave?: () => void;
  onFollow?: () => void;
  onEdit?: () => void;
  isFollowing?: boolean;
  isSaved?: boolean;
}

export function ContactHeader({ 
  contact, 
  loading = false, 
  onSave, 
  onFollow, 
  onEdit,
  isFollowing = false,
  isSaved = false 
}: ContactHeaderProps) {
  const [showActions, setShowActions] = useState(false);
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const getVerificationBadge = () => {
    if (contact.verified) {
      return (
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    
    if (contact.dataQuality >= 80) {
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
          <Shield className="w-3 h-3 mr-1" />
          High Quality
        </Badge>
      );
    }
    
    if (contact.dataQuality >= 60) {
      return (
        <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Moderate Quality
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200">
        <Clock className="w-3 h-3 mr-1" />
        Unverified
      </Badge>
    );
  };

  const getSeniorityBadge = () => {
    const seniorityColors: { [key: string]: string } = {
      'C_LEVEL': 'bg-purple-50 text-purple-700 border-purple-200',
      'VP_LEVEL': 'bg-blue-50 text-blue-700 border-blue-200',
      'DIRECTOR_LEVEL': 'bg-green-50 text-green-700 border-green-200',
      'MANAGER_LEVEL': 'bg-orange-50 text-orange-700 border-orange-200',
      'INDIVIDUAL_CONTRIBUTOR': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    
    const colorClass = seniorityColors[contact.seniority] || 'bg-gray-50 text-gray-700 border-gray-200';
    
    return (
      <Badge variant="outline" className={colorClass}>
        {contact.seniority.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
          {/* Left Section - Contact Info */}
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
              {contact.firstName?.[0]}{contact.lastName?.[0]}
            </div>
            
            {/* Contact Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {contact.fullName}
                </h1>
                {getVerificationBadge()}
              </div>
              
              <p className="text-lg text-gray-600 mb-2">{contact.title}</p>
              
              <div className="flex items-center space-x-2 text-gray-500">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <Link 
                  href={`/orgs/companies/${contact.company.id}`}
                  className="hover:text-blue-600 hover:underline truncate"
                >
                  {contact.company.name}
                </Link>
                {contact.company.verified && (
                  <Shield className="w-3 h-3 text-green-500 flex-shrink-0" />
                )}
              </div>
              
              {(contact.company.city || contact.company.state) && (
                <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                  <span>{contact.company.city}</span>
                  {contact.company.city && contact.company.state && <span>•</span>}
                  <span>{contact.company.state}</span>
                </div>
              )}
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {getSeniorityBadge()}
                {contact.department && (
                  <Badge variant="outline" className="text-xs">
                    {contact.department.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                )}
                {contact.primaryRole && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    {contact.primaryRole}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Section - Action Buttons */}
          <div className="flex flex-wrap lg:flex-nowrap gap-2 lg:space-x-2">
            <Button
              variant={isSaved ? "default" : "outline"}
              size="sm"
              onClick={onSave}
              className="flex items-center space-x-1 min-w-fit"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </Button>
            
            <Button
              variant={isFollowing ? "default" : "outline"}
              size="sm"
              onClick={onFollow}
              className="flex items-center space-x-1 min-w-fit"
            >
              <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isFollowing ? 'Following' : 'Follow'}</span>
            </Button>
            
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex items-center space-x-1 min-w-fit"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="p-2"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Share2 className="w-4 h-4" />
                      <span>Share Profile</span>
                    </button>
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <ExternalLink className="w-4 h-4" />
                      <span>View on LinkedIn</span>
                    </button>
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Flag className="w-4 h-4" />
                      <span>Report Issue</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Contact Quality Score */}
        {contact.dataQuality && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Data Quality Score</span>
              <span className="font-medium">{contact.dataQuality}%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  contact.dataQuality >= 80 ? 'bg-green-500' : 
                  contact.dataQuality >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${contact.dataQuality}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}