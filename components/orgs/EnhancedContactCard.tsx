'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mail, 
  Phone, 
  Linkedin, 
  Bookmark, 
  Clock,
  Building2,
  Star
} from 'lucide-react';

interface Contact {
  id: string;
  fullName?: string;
  name?: string; // Support both naming conventions
  title?: string;
  role?: string; // Support both naming conventions
  company?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
    companyType?: string;
    logoUrl?: string;
    verified?: boolean;
  };
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  avatar?: string;
  lastActive?: string;
  seniority?: string;
  department?: string;
  verified?: boolean;
  roles?: string[];
}

interface EnhancedContactCardProps {
  contact: Contact;
  variant?: 'grid' | 'list';
}

export function EnhancedContactCard({ contact, variant = 'grid' }: EnhancedContactCardProps) {
  const getSeniorityColor = (seniority?: string) => {
    if (!seniority) return 'bg-muted text-muted-foreground border-border';
    
    const seniorityLower = seniority.toLowerCase().replace(/_/g, ' ');
    
    if (seniorityLower.includes('c-level') || seniorityLower.includes('ceo') || seniorityLower.includes('cto') || seniorityLower.includes('cfo')) {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    if (seniorityLower.includes('vp') || seniorityLower.includes('vice president')) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (seniorityLower.includes('director')) {
      return 'bg-green-100 text-green-700 border-green-200';
    }
    if (seniorityLower.includes('manager')) {
      return 'bg-orange-100 text-orange-700 border-orange-200';
    }
    return 'bg-muted text-muted-foreground border-border';
  };

  const handleAction = (action: string, value?: string) => {
    if (!value) return;
    
    switch (action) {
      case 'email':
        window.location.href = `mailto:${value}`;
        break;
      case 'phone':
        window.location.href = `tel:${value}`;
        break;
      case 'linkedin':
        window.open(value, '_blank');
        break;
    }
  };

  const displayName = contact.fullName || contact.name || 'Unknown';
  const displayRole = contact.title || contact.role || 'No title';
  const displaySeniority = contact.seniority || 'Unknown Level';
  const displayLastActive = contact.lastActive || 'Recently';
  
  // Get company location
  const companyLocation = contact.company?.city && contact.company?.state 
    ? `${contact.company.city}, ${contact.company.state}`
    : contact.company?.city || 'Location not specified';

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-gradient-to-r from-card to-primary/5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-14 h-14 ring-2 ring-background shadow-md">
              <AvatarImage src={contact.avatar} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-lg">
                {displayName.split(' ').map(n => n.charAt(0)).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-foreground text-lg">
                  {displayName}
                </h3>
                {contact.verified && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
              </div>
              <p className="text-muted-foreground font-medium mb-1">{displayRole}</p>
              {contact.company && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building2 className="w-3 h-3 mr-1" />
                  {contact.company.name}
                  {contact.company.verified && (
                    <Star className="w-3 h-3 ml-1 text-yellow-500 fill-current" />
                  )}
                </div>
              )}
            </div>
          </div>
          <Badge className={getSeniorityColor(contact.seniority)}>
            {displaySeniority.replace(/_/g, ' ')}
          </Badge>
        </div>

        {/* Company Location */}
        {contact.company && (
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <Building2 className="w-3 h-3 mr-1" />
            <span>{companyLocation}</span>
          </div>
        )}

        {/* Department Badge */}
        {contact.department && (
          <div className="mb-4">
            <Badge variant="outline" className="text-xs">
              {contact.department.replace(/_/g, ' ')}
            </Badge>
          </div>
        )}

        {/* Last Activity */}
        <div className="flex items-center text-xs text-muted-foreground mb-4">
          <Clock className="w-3 h-3 mr-1" />
          Last active: {displayLastActive}
        </div>

        {/* Action Buttons Row */}
        <div className="flex space-x-2">
          {contact.email && (
            <Button
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => handleAction('email', contact.email)}
            >
              <Mail className="w-3 h-3 mr-2" />
              Email
            </Button>
          )}
          
          {contact.phone && (
            <Button 
              size="sm" 
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => handleAction('phone', contact.phone)}
            >
              <Phone className="w-3 h-3 mr-1" />
              Call
            </Button>
          )}
          
          {contact.linkedinUrl && (
            <Button
              size="sm"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => handleAction('linkedin', contact.linkedinUrl)}
            >
              <Linkedin className="w-3 h-3 mr-1" />
              LinkedIn
            </Button>
          )}
          
          <Button size="sm" variant="outline" className="px-3">
            <Bookmark className="w-3 h-3" />
          </Button>
        </div>

        {/* Contact roles/tags if available */}
        {contact.roles && contact.roles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {contact.roles.slice(0, 3).map((role, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {role.replace(/_/g, ' ')}
              </Badge>
            ))}
            {contact.roles.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{contact.roles.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
