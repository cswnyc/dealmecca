'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Building2, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  ExternalLink,
  MessageSquare,
  FileText,
  Award,
  Briefcase,
  Target,
  AlertCircle
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'job_change' | 'promotion' | 'contact_update' | 'company_change' | 'interaction' | 'verification';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    previousValue?: string;
    newValue?: string;
    companyId?: string;
    companyName?: string;
    changeType?: string;
  };
}

interface CompanyChange {
  id: string;
  previousCompany: {
    id: string;
    name: string;
    title: string;
    startDate: string;
    endDate: string;
  };
  currentCompany: {
    id: string;
    name: string;
    title: string;
    startDate: string;
  };
  changeDate: string;
  changeType: 'promotion' | 'lateral_move' | 'company_switch' | 'title_change';
}

interface Contact {
  id: string;
  fullName: string;
  recentActivity: ActivityItem[];
  companyHistory: CompanyChange[];
  interactionHistory?: {
    totalInteractions: number;
    lastInteraction?: string;
    interactionTypes: {
      emails: number;
      calls: number;
      meetings: number;
      linkedin_messages: number;
    };
  };
}

interface ContactActivityProps {
  contact: Contact;
  loading?: boolean;
}

export function ContactActivity({ contact, loading = false }: ContactActivityProps) {
  const [activeTab, setActiveTab] = useState('recent');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'job_change':
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'promotion':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'contact_update':
        return <User className="w-4 h-4 text-orange-500" />;
      case 'company_change':
        return <ArrowRight className="w-4 h-4 text-purple-500" />;
      case 'interaction':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'verification':
        return <Award className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'job_change':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'promotion':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'contact_update':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'company_change':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'interaction':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'verification':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else if (diffInHours < 24 * 30) {
      return `${Math.floor(diffInHours / (24 * 7))}w ago`;
    } else {
      return `${Math.floor(diffInHours / (24 * 30))}mo ago`;
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'promotion':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'lateral_move':
        return <ArrowRight className="w-4 h-4 text-blue-500" />;
      case 'company_switch':
        return <Building2 className="w-4 h-4 text-purple-500" />;
      case 'title_change':
        return <Briefcase className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Activity & History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="history">Company History</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
          </TabsList>

          {/* Recent Activity Tab */}
          <TabsContent value="recent" className="space-y-4 mt-4">
            {contact.recentActivity && contact.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {contact.recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
                        <Badge variant="outline" className={`text-xs ${getActivityTypeColor(activity.type)}`}>
                          {activity.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      
                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="text-xs text-gray-500 space-y-1">
                          {activity.metadata.previousValue && activity.metadata.newValue && (
                            <div className="flex items-center space-x-2">
                              <span className="line-through">{activity.metadata.previousValue}</span>
                              <ArrowRight className="w-3 h-3" />
                              <span className="font-medium">{activity.metadata.newValue}</span>
                            </div>
                          )}
                          {activity.metadata.companyName && (
                            <div className="flex items-center space-x-1">
                              <Building2 className="w-3 h-3" />
                              <span>{activity.metadata.companyName}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex-shrink-0">
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Activity will appear here when we detect changes to this contact.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Company History Tab */}
          <TabsContent value="history" className="space-y-4 mt-4">
            {contact.companyHistory && contact.companyHistory.length > 0 ? (
              <div className="space-y-4">
                {contact.companyHistory.map((change, index) => (
                  <div key={change.id} className="relative">
                    {/* Timeline line */}
                    {index < contact.companyHistory.length - 1 && (
                      <div className="absolute left-4 top-12 w-0.5 h-full bg-gray-200"></div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 flex-shrink-0">
                        {getChangeTypeIcon(change.changeType)}
                      </div>
                      
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className={getActivityTypeColor(change.changeType)}>
                            {change.changeType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          <span className="text-sm text-gray-500">{change.changeDate}</span>
                        </div>
                        
                        {/* Previous Position */}
                        <div className="mb-3 p-3 bg-white rounded border border-gray-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{change.previousCompany.name}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{change.previousCompany.title}</p>
                          <p className="text-xs text-gray-500">
                            {change.previousCompany.startDate} - {change.previousCompany.endDate}
                          </p>
                        </div>
                        
                        {/* Arrow */}
                        <div className="flex justify-center mb-3">
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        {/* Current Position */}
                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-900">{change.currentCompany.name}</span>
                          </div>
                          <p className="text-sm text-blue-700 mb-1">{change.currentCompany.title}</p>
                          <p className="text-xs text-blue-600">
                            {change.currentCompany.startDate} - Present
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No company history</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Company changes and job history will appear here.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="space-y-4 mt-4">
            {contact.interactionHistory ? (
              <div className="space-y-4">
                {/* Interaction Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Mail className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900">
                      {contact.interactionHistory.interactionTypes.emails}
                    </p>
                    <p className="text-sm text-blue-600">Emails</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <Phone className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900">
                      {contact.interactionHistory.interactionTypes.calls}
                    </p>
                    <p className="text-sm text-green-600">Calls</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-900">
                      {contact.interactionHistory.interactionTypes.meetings}
                    </p>
                    <p className="text-sm text-purple-600">Meetings</p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    <MessageSquare className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-indigo-900">
                      {contact.interactionHistory.interactionTypes.linkedin_messages}
                    </p>
                    <p className="text-sm text-indigo-600">LinkedIn</p>
                  </div>
                </div>
                
                {/* Total Interactions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Total Interactions</p>
                        <p className="text-sm text-gray-600">All recorded touchpoints</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{contact.interactionHistory.totalInteractions}</p>
                      {contact.interactionHistory.lastInteraction && (
                        <p className="text-sm text-gray-500">
                          Last: {formatTimeAgo(contact.interactionHistory.lastInteraction)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No interaction history</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Interactions and touchpoints will be tracked here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}