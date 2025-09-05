'use client';

import { useState } from 'react';
import { 
  Mail, 
  Phone, 
  Linkedin, 
  MapPin, 
  Building2, 
  Crown, 
  Star,
  Calendar,
  TrendingUp,
  Users,
  MessageCircle,
  Eye,
  Follow,
  Share,
  MoreHorizontal,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ContactIntelligence {
  id: string;
  fullName: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  company: {
    name: string;
    logoUrl?: string;
    verified: boolean;
  };
  department: string;
  seniority: 'ENTRY' | 'MID' | 'SENIOR' | 'DIRECTOR' | 'VP' | 'EXECUTIVE' | 'C_LEVEL';
  location?: string;
  decisionMakingPower: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTIMATE';
  reportsTo?: {
    name: string;
    title: string;
    id: string;
  };
  directReports: number;
  lastActivity?: string;
  responseRate?: number;
  preferredContact: 'EMAIL' | 'PHONE' | 'LINKEDIN' | 'UNKNOWN';
  intelligence: {
    budgetInfluence: number; // 1-10
    approvalLevel: 'RECOMMENDER' | 'DECISION_MAKER' | 'FINAL_APPROVER';
    buyingSignals: string[];
    recentChanges: string[];
    personalNotes: string[];
    connectionStrength: number; // 1-5
    lastContacted?: string;
    responseHistory: 'RESPONSIVE' | 'SLOW' | 'UNRESPONSIVE' | 'NO_DATA';
  };
  verified: boolean;
  verificationSource: 'USER_SUBMITTED' | 'AI_VERIFIED' | 'OFFICIAL' | 'CROWD_SOURCED';
  contributedBy?: {
    name: string;
    gems: number;
    isAnonymous: boolean;
  };
}

interface ContactIntelligenceCardProps {
  contact: ContactIntelligence;
  onFollow?: (contactId: string) => void;
  onMessage?: (contactId: string) => void;
  onUpdate?: (contactId: string, updates: Partial<ContactIntelligence>) => void;
  showActions?: boolean;
  expanded?: boolean;
}

const SENIORITY_COLORS = {
  'C_LEVEL': 'bg-red-600',
  'EXECUTIVE': 'bg-purple-600',
  'VP': 'bg-blue-600',
  'DIRECTOR': 'bg-green-600',
  'SENIOR': 'bg-yellow-500',
  'MID': 'bg-gray-500',
  'ENTRY': 'bg-gray-400'
};

const DECISION_POWER_COLORS = {
  'ULTIMATE': 'text-red-600',
  'HIGH': 'text-orange-600',
  'MEDIUM': 'text-yellow-600',
  'LOW': 'text-gray-600'
};

export function ContactIntelligenceCard({ 
  contact, 
  onFollow, 
  onMessage, 
  onUpdate,
  showActions = true,
  expanded = false 
}: ContactIntelligenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [following, setFollowing] = useState(false);

  const handleFollow = () => {
    setFollowing(!following);
    if (onFollow) {
      onFollow(contact.id);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getBudgetInfluenceColor = (influence: number) => {
    if (influence >= 8) return 'text-red-600';
    if (influence >= 6) return 'text-orange-600';
    if (influence >= 4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getConnectionStrengthBadge = (strength: number) => {
    const colors = ['bg-gray-400', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const labels = ['No Connection', 'Weak', 'Limited', 'Good', 'Strong'];
    return {
      color: colors[strength - 1] || colors[0],
      label: labels[strength - 1] || labels[0]
    };
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={contact.avatarUrl} />
              <AvatarFallback className="bg-blue-600 text-white font-semibold">
                {getInitials(contact.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{contact.fullName}</h3>
                {contact.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                )}
                <Badge 
                  className={`${SENIORITY_COLORS[contact.seniority]} text-white text-xs`}
                >
                  {contact.seniority.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm">{contact.title}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  {contact.company.logoUrl && (
                    <img 
                      src={contact.company.logoUrl} 
                      alt={contact.company.name}
                      className="w-4 h-4"
                    />
                  )}
                  <span className="text-sm text-gray-700">{contact.company.name}</span>
                  {contact.company.verified && (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2">
              <Button
                variant={following ? "default" : "outline"}
                size="sm"
                onClick={handleFollow}
              >
                <Users className="w-4 h-4 mr-1" />
                {following ? 'Following' : 'Follow'}
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Quick Intelligence Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className={`font-semibold ${DECISION_POWER_COLORS[contact.decisionMakingPower]}`}>
              {contact.decisionMakingPower}
            </div>
            <div className="text-xs text-gray-600">Decision Power</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className={`font-semibold ${getBudgetInfluenceColor(contact.intelligence.budgetInfluence)}`}>
              {contact.intelligence.budgetInfluence}/10
            </div>
            <div className="text-xs text-gray-600">Budget Influence</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-blue-600">
              {contact.directReports}
            </div>
            <div className="text-xs text-gray-600">Direct Reports</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <Badge 
              className={`${getConnectionStrengthBadge(contact.intelligence.connectionStrength).color} text-white text-xs`}
            >
              {getConnectionStrengthBadge(contact.intelligence.connectionStrength).label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contact.email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-gray-500" />
              <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                {contact.email}
              </a>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-gray-500" />
              <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                {contact.phone}
              </a>
            </div>
          )}
          {contact.linkedinUrl && (
            <div className="flex items-center space-x-2 text-sm">
              <Linkedin className="w-4 h-4 text-blue-700" />
              <a href={contact.linkedinUrl} target="_blank" className="text-blue-600 hover:underline">
                LinkedIn Profile
              </a>
            </div>
          )}
          {contact.location && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{contact.location}</span>
            </div>
          )}
        </div>

        {/* Expanded Intelligence Details */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            {/* Reporting Structure */}
            {contact.reportsTo && (
              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Reports To
                </h5>
                <div className="bg-gray-50 rounded p-2">
                  <div className="font-medium text-sm">{contact.reportsTo.name}</div>
                  <div className="text-xs text-gray-600">{contact.reportsTo.title}</div>
                </div>
              </div>
            )}

            {/* Recent Changes */}
            {contact.intelligence.recentChanges.length > 0 && (
              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Recent Changes
                </h5>
                <div className="space-y-2">
                  {contact.intelligence.recentChanges.map((change, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-2">
                      <div className="text-sm text-yellow-800">{change}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buying Signals */}
            {contact.intelligence.buyingSignals.length > 0 && (
              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-1 text-green-600" />
                  Buying Signals
                </h5>
                <div className="flex flex-wrap gap-2">
                  {contact.intelligence.buyingSignals.map((signal, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {signal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Notes */}
            {contact.intelligence.personalNotes.length > 0 && (
              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Intelligence Notes
                </h5>
                <div className="space-y-2">
                  {contact.intelligence.personalNotes.map((note, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="text-sm text-blue-800">{note}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact History */}
            <div className="grid grid-cols-2 gap-4">
              {contact.intelligence.lastContacted && (
                <div>
                  <h5 className="font-medium text-sm mb-1">Last Contacted</h5>
                  <div className="text-sm text-gray-600">
                    {new Date(contact.intelligence.lastContacted).toLocaleDateString()}
                  </div>
                </div>
              )}
              <div>
                <h5 className="font-medium text-sm mb-1">Response Pattern</h5>
                <Badge 
                  variant={contact.intelligence.responseHistory === 'RESPONSIVE' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {contact.intelligence.responseHistory.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Data Source & Contributor */}
        <div className="flex items-center justify-between pt-3 border-t text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>Source: {contact.verificationSource.replace('_', ' ')}</span>
            {contact.contributedBy && !contact.contributedBy.isAnonymous && (
              <span>• Contributed by {contact.contributedBy.name}</span>
            )}
            {contact.contributedBy?.isAnonymous && (
              <span>• Anonymously contributed</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex space-x-2 pt-2">
            <Button 
              size="sm" 
              onClick={() => onMessage?.(contact.id)}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-1" />
              Message
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              View Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}