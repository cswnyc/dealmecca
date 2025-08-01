'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Users, 
  FileText, 
  Mail, 
  Phone,
  MessageSquare,
  Calendar,
  Building2,
  Target,
  Award,
  TrendingUp,
  Activity,
  ExternalLink,
  Plus,
  Edit,
  Share2
} from 'lucide-react';
import { ContactInfo } from './ContactInfo';
import { ContactActivity } from './ContactActivity';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  relationship: 'reports_to' | 'manages' | 'peer' | 'collaborates_with';
  department?: string;
  email?: string;
  imageUrl?: string;
}

interface Contribution {
  id: string;
  type: 'project' | 'initiative' | 'achievement' | 'publication' | 'award';
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in_progress' | 'planned';
  impact?: string;
  collaborators?: string[];
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  personalEmail?: string;
  seniority: string;
  department?: string;
  primaryRole?: string;
  budgetRange?: string;
  responsibilities?: string[];
  lastUpdated?: string;
  dataQuality: number;
  verified: boolean;
  verificationDate?: string;
  company: {
    id: string;
    name: string;
    city?: string;
    state?: string;
    companyType: string;
    industry?: string;
    verified: boolean;
  };
  team?: TeamMember[];
  contributions?: Contribution[];
  recentActivity: any[];
  companyHistory: any[];
  interactionHistory?: any;
}

interface ContactTabsProps {
  contact: Contact;
  loading?: boolean;
  onEditContact?: () => void;
  onShareContact?: () => void;
}

export function ContactTabs({ contact, loading = false, onEditContact, onShareContact }: ContactTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRelationshipBadge = (relationship: string) => {
    switch (relationship) {
      case 'reports_to':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reports To</Badge>;
      case 'manages':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Manages</Badge>;
      case 'peer':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Peer</Badge>;
      case 'collaborates_with':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Collaborates</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getContributionIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'initiative':
        return <Target className="w-4 h-4 text-green-500" />;
      case 'achievement':
        return <Award className="w-4 h-4 text-yellow-500" />;
      case 'publication':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'award':
        return <Award className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'planned':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Planned</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <TabsList className="grid w-full lg:w-auto grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Teams</span>
            </TabsTrigger>
            <TabsTrigger value="contributions" className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Contributions</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Contact Info</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            {onEditContact && (
              <Button variant="outline" size="sm" onClick={onEditContact}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {onShareContact && (
              <Button variant="outline" size="sm" onClick={onShareContact}>
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            )}
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data Quality</span>
                    <span className="font-medium">{contact.dataQuality}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Verification</span>
                    <Badge variant={contact.verified ? "default" : "secondary"}>
                      {contact.verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Team Size</span>
                    <span className="font-medium">{contact.team?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Contributions</span>
                    <span className="font-medium">{contact.contributions?.length || 0}</span>
                  </div>
                  {contact.interactionHistory && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Interactions</span>
                      <span className="font-medium">{contact.interactionHistory.totalInteractions}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Activity */}
            <div className="lg:col-span-2">
              <ContactActivity contact={contact} loading={loading} />
            </div>
          </div>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Team & Relationships</span>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Relationship
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contact.team && contact.team.length > 0 ? (
                <div className="space-y-4">
                  {contact.team.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.title}</p>
                          {member.department && (
                            <p className="text-xs text-gray-500">{member.department}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getRelationshipBadge(member.relationship)}
                        {member.email && (
                          <Button variant="ghost" size="sm" onClick={() => window.open(`mailto:${member.email}`)}>
                            <Mail className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No team relationships</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Team relationships and organizational connections will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contributions Tab */}
        <TabsContent value="contributions" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Contributions & Achievements</span>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Contribution
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contact.contributions && contact.contributions.length > 0 ? (
                <div className="space-y-4">
                  {contact.contributions.map((contribution) => (
                    <div key={contribution.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getContributionIcon(contribution.type)}
                          <div>
                            <h4 className="font-medium text-gray-900">{contribution.title}</h4>
                            <p className="text-sm text-gray-600 capitalize">
                              {contribution.type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(contribution.status)}
                          <span className="text-sm text-gray-500">{contribution.date}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{contribution.description}</p>
                      
                      {contribution.impact && (
                        <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
                          <p className="text-sm text-green-800">
                            <strong>Impact:</strong> {contribution.impact}
                          </p>
                        </div>
                      )}
                      
                      {contribution.collaborators && contribution.collaborators.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Collaborators:</span>
                          <div className="flex flex-wrap gap-1">
                            {contribution.collaborators.map((collaborator, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {collaborator}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No contributions recorded</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Projects, achievements, and contributions will be displayed here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="contact" className="space-y-6 mt-6">
          <ContactInfo contact={contact} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}