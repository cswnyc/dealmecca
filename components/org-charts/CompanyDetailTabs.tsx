'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Building2,
  Users,
  MapPin,
  Globe,
  Phone,
  Mail,
  Calendar,
  Edit,
  Plus,
  ExternalLink,
  ArrowLeft,
  Briefcase,
  MessageSquare,
  UserCheck,
  ClipboardList,
  Contact,
  Crown,
  Shield,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

type TabType = 'overview' | 'teams' | 'posts' | 'people' | 'contributions' | 'duties' | 'contact';

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  companyType: string;
  agencyType?: string;
  industry: string;
  description?: string;
  website?: string;
  city?: string;
  state?: string;
  employeeCount: string;
  revenueRange: string;
  parentCompany?: {
    id: string;
    name: string;
    slug: string;
  };
  subsidiaries: {
    id: string;
    name: string;
    slug: string;
    companyType: string;
    _count: {
      contacts: number;
    };
  }[];
  contacts: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    title: string;
    email?: string;
    department?: string;
    seniority?: string;
    primaryRole?: string;
  }[];
}

interface CompanyDetailTabsProps {
  company: CompanyData;
}

export function CompanyDetailTabs({ company }: CompanyDetailTabsProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const isAdmin = session?.user && ['ADMIN', 'TEAM'].includes(session.user.role as string);

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: <Building2 className="w-4 h-4" /> },
    { id: 'teams' as TabType, label: 'Teams', icon: <Users className="w-4 h-4" /> },
    { id: 'posts' as TabType, label: 'Posts', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'people' as TabType, label: 'People', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'contributions' as TabType, label: 'Contributions', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'duties' as TabType, label: 'Duties', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'contact' as TabType, label: 'Contact Info', icon: <Contact className="w-4 h-4" /> },
  ];

  function SeniorityIcon({ seniority }: { seniority?: string }) {
    if (seniority === 'C_LEVEL') return <Crown className="h-4 w-4 text-yellow-600" />;
    if (seniority === 'VP') return <Shield className="h-4 w-4 text-blue-600" />;
    if (seniority === 'DIRECTOR') return <Shield className="h-4 w-4 text-green-600" />;
    return <User className="h-4 w-4 text-gray-600" />;
  }

  function SeniorityBadge({ seniority }: { seniority?: string }) {
    const colors: Record<string, string> = {
      'C_LEVEL': 'bg-yellow-100 text-yellow-800',
      'VP': 'bg-blue-100 text-blue-800',
      'DIRECTOR': 'bg-green-100 text-green-800',
      'MANAGER': 'bg-purple-100 text-purple-800',
      'SENIOR': 'bg-orange-100 text-orange-800',
      'JUNIOR': 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      'C_LEVEL': 'C-Level',
      'VP': 'VP',
      'DIRECTOR': 'Director',
      'MANAGER': 'Manager',
      'SENIOR': 'Senior',
      'JUNIOR': 'Junior',
    };

    if (!seniority) return null;

    return (
      <Badge variant="secondary" className={colors[seniority] || 'bg-gray-100 text-gray-800'}>
        {labels[seniority] || seniority}
      </Badge>
    );
  }

  function DepartmentBadge({ department }: { department?: string }) {
    const colors: Record<string, string> = {
      'LEADERSHIP': 'bg-purple-100 text-purple-800',
      'MEDIA_PLANNING': 'bg-blue-100 text-blue-800',
      'STRATEGY': 'bg-green-100 text-green-800',
      'FINANCE': 'bg-yellow-100 text-yellow-800',
      'OPERATIONS': 'bg-orange-100 text-orange-800',
      'BUSINESS_DEVELOPMENT': 'bg-pink-100 text-pink-800',
    };

    if (!department) return null;

    const label = department.replace('_', ' ');

    return (
      <Badge variant="outline" className={colors[department] || ''}>
        {label}
      </Badge>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                      <p className="text-sm text-gray-600">{company.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Industry</p>
                    <p className="text-sm text-gray-600">{company.industry}</p>
                  </div>

                  {company.city && company.state && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Location</p>
                      <p className="text-sm text-gray-600">{company.city}, {company.state}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Company Type</p>
                    <Badge variant="secondary">{company.companyType.replace('_', ' ')}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Key Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Team Members</span>
                    <Badge variant="secondary">{company.contacts.length}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Subsidiaries</span>
                    <Badge variant="secondary">{company.subsidiaries.length}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Employee Range</span>
                    <Badge variant="outline">{company.employeeCount.replace('_', '-')}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Revenue Range</span>
                    <Badge variant="outline">{company.revenueRange}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Relationships */}
            {(company.parentCompany || company.subsidiaries.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Corporate Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company.parentCompany && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Parent Company</p>
                      <Badge variant="outline" className="mr-2">
                        <Building2 className="w-3 h-3 mr-1" />
                        {company.parentCompany.name}
                      </Badge>
                    </div>
                  )}

                  {company.subsidiaries.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Portfolio Companies ({company.subsidiaries.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {company.subsidiaries.slice(0, 6).map((sub) => (
                          <Badge key={sub.id} variant="outline">
                            <Building2 className="w-3 h-3 mr-1" />
                            {sub.name}
                          </Badge>
                        ))}
                        {company.subsidiaries.length > 6 && (
                          <Badge variant="secondary">
                            +{company.subsidiaries.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'teams':
      case 'people':
        const cLevelContacts = company.contacts.filter(c => c.seniority === 'C_LEVEL');
        const vpContacts = company.contacts.filter(c => c.seniority === 'VP');
        const otherContacts = company.contacts.filter(c => c.seniority && !['C_LEVEL', 'VP'].includes(c.seniority));

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Organization Chart ({company.contacts.length} people)</h3>
              {isAdmin && (
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              )}
            </div>

            {/* C-Level Leadership */}
            {cLevelContacts.length > 0 && (
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center">
                  <Crown className="h-4 w-4 mr-2 text-yellow-600" />
                  Executive Leadership
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cLevelContacts.map((contact) => (
                    <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <SeniorityIcon seniority={contact.seniority} />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-sm truncate">{contact.fullName}</h5>
                            <p className="text-xs text-gray-600 truncate">{contact.title}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          <SeniorityBadge seniority={contact.seniority} />
                          <DepartmentBadge department={contact.department} />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex space-x-1">
                            {contact.email && (
                              <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
                                <Mail className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          {isAdmin && (
                            <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* VP Level */}
            {vpContacts.length > 0 && (
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-600" />
                  Vice Presidents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vpContacts.map((contact) => (
                    <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <SeniorityIcon seniority={contact.seniority} />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-sm truncate">{contact.fullName}</h5>
                            <p className="text-xs text-gray-600 truncate">{contact.title}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          <SeniorityBadge seniority={contact.seniority} />
                          <DepartmentBadge department={contact.department} />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex space-x-1">
                            {contact.email && (
                              <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
                                <Mail className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          {isAdmin && (
                            <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Other Team Members */}
            {otherContacts.length > 0 && (
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-600" />
                  Team Members
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherContacts.map((contact) => (
                    <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <SeniorityIcon seniority={contact.seniority} />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-sm truncate">{contact.fullName}</h5>
                            <p className="text-xs text-gray-600 truncate">{contact.title}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          <SeniorityBadge seniority={contact.seniority} />
                          <DepartmentBadge department={contact.department} />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex space-x-1">
                            {contact.email && (
                              <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
                                <Mail className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          {isAdmin && (
                            <Button size="sm" variant="ghost" className="p-1 h-6 w-6">
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'contact':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Website</p>
                    <a 
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
              )}

              {company.city && company.state && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Address</p>
                    <p className="text-sm text-gray-600">{company.city}, {company.state}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Company Type</p>
                  <p className="text-sm text-gray-600">{company.companyType.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Employee Range</p>
                  <p className="text-sm text-gray-600">{company.employeeCount.replace('_', '-')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Coming Soon</h3>
            <p className="mt-1 text-sm text-gray-500">
              This section is currently under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 overflow-x-auto px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}