'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Users, 
  ChevronRight,
  Mail,
  Phone,
  Building2,
  ArrowLeft,
  Crown,
  Shield,
  Target,
  Settings,
  Code,
  TrendingUp,
  Briefcase,
  Linkedin
} from 'lucide-react';

interface Contact {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  profileImage?: string;
}

interface Position {
  id: string;
  title: string;
  department?: string;
  level: number;
  contact?: Contact;
  children: Position[];
}

interface MobileOrgChartProps {
  companyName: string;
  positions: Position[];
  loading?: boolean;
}

export function MobileOrgChart({ companyName, positions, loading = false }: MobileOrgChartProps) {
  const [currentView, setCurrentView] = useState<'overview' | 'department' | 'person'>('overview');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Position | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getDepartmentIcon = (deptName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      'Executive': Crown,
      'Marketing': Target,
      'Sales': Shield,
      'Operations': Settings,
      'Technology': Code,
      'Finance': TrendingUp,
      'HR': Users,
      'Human Resources': Users,
      'General': Briefcase
    };
    return iconMap[deptName] || Briefcase;
  };

  const getLevelBadgeColor = (level: number): string => {
    const colors = {
      1: 'bg-primary/10 text-primary border-primary/20',
      2: 'bg-secondary/10 text-secondary border-secondary/20',
      3: 'bg-accent/10 text-accent border-accent/20',
      4: 'bg-secondary/5 text-secondary/80 border-secondary/10',
      5: 'bg-neutral-100 text-neutral-700 border-neutral-200'
    };
    return colors[level as keyof typeof colors] || colors[5];
  };

  const getLevelTitle = (level: number): string => {
    const titles = {
      1: 'C-Level',
      2: 'VP', 
      3: 'Director',
      4: 'Manager',
      5: 'Individual'
    };
    return titles[level as keyof typeof titles] || 'Team Member';
  };

  // Group positions by department
  const departments = React.useMemo(() => {
    const groups: { [key: string]: Position[] } = {};
    
    positions.forEach(position => {
      const dept = position.department || 'General';
      if (!groups[dept]) {
        groups[dept] = [];
      }
      groups[dept].push(position);
    });

    return Object.entries(groups).map(([name, deptPositions]) => ({
      name,
      positions: deptPositions.sort((a, b) => a.level - b.level),
      icon: getDepartmentIcon(name)
    })).sort((a, b) => {
      if (a.name === 'Executive') return -1;
      if (b.name === 'Executive') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [positions]);
  
  const getPositionsByDepartment = (dept: string) => {
    return positions.filter(pos => (pos.department || 'General') === dept);
  };

  const filteredPositions = positions.filter(pos => 
    pos.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pos.contact?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pos.department || 'General').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="bg-card border-b p-4">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Overview View - Department List
  if (currentView === 'overview') {
    return (
      <div className="min-h-screen bg-muted pb-20">
        {/* Mobile Header */}
        <div className="bg-card border-b sticky top-0 z-10 shadow-sm">
          <div className="p-4">
            <h1 className="text-lg font-semibold text-foreground mb-3">
              {companyName}
            </h1>
            <p className="text-sm text-muted-foreground mb-3">
              {departments.length} departments • {positions.length} positions
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search people, roles, departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full bg-muted border-border"
              />
            </div>
          </div>
        </div>

        {/* Department Cards */}
        <div className="p-4 space-y-3">
          {departments.map((dept) => {
            const Icon = dept.icon;
            const filledPositions = dept.positions.filter(pos => pos.contact);
            
            return (
              <Card 
                key={dept.name} 
                className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
                onClick={() => {
                  setSelectedDepartment(dept.name);
                  setCurrentView('department');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{dept.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {filledPositions.length} of {dept.positions.length} filled
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {dept.positions.length}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  {/* Team Preview Avatars */}
                  <div className="flex items-center mt-3 -space-x-2">
                    {filledPositions.slice(0, 4).map((pos, index) => (
                      <Avatar key={index} className="w-8 h-8 ring-2 ring-white border">
                        <AvatarImage src={pos.contact?.profileImage} alt={pos.contact?.fullName} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                          {pos.contact?.fullName?.split(' ').map(n => n.charAt(0)).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {filledPositions.length > 4 && (
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center ring-2 ring-white text-xs text-muted-foreground font-medium">
                        +{filledPositions.length - 4}
                      </div>
                    )}
                    {filledPositions.length === 0 && (
                      <div className="text-xs text-muted-foreground italic">No team members yet</div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Team Progress</span>
                      <span>{Math.round((filledPositions.length / dept.positions.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(filledPositions.length / dept.positions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Department View - Position List
  if (currentView === 'department' && selectedDepartment) {
    const deptPositions = getPositionsByDepartment(selectedDepartment);
    const DeptIcon = getDepartmentIcon(selectedDepartment);
    
    return (
      <div className="min-h-screen bg-muted pb-20">
        {/* Department Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('overview')}
                className="p-2 text-white hover:bg-white/20 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm opacity-90">Back to Departments</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <DeptIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{selectedDepartment}</h1>
                <p className="text-white/90">
                  {deptPositions.filter(p => p.contact).length} team members • {deptPositions.length} total positions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Position List */}
        <div className="p-4 space-y-3">
          {deptPositions
            .sort((a, b) => a.level - b.level) // Sort by seniority
            .map((position) => (
              <Card 
                key={position.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
                onClick={() => {
                  setSelectedPerson(position);
                  setCurrentView('person');
                }}
              >
                <CardContent className="p-4">
                  {position.contact ? (
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
                        <AvatarImage src={position.contact.profileImage} alt={position.contact.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {position.contact.fullName.split(' ').map(n => n.charAt(0)).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{position.contact.fullName}</h3>
                        <p className="text-sm text-muted-foreground truncate">{position.title}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Badge className={`text-xs ${getLevelBadgeColor(position.level)}`}>
                            {getLevelTitle(position.level)}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center border-2 border-dashed border-border">
                        <Users className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-muted-foreground">{position.title}</h3>
                        <p className="text-sm text-muted-foreground/70">Open Position</p>
                        <Badge className={`text-xs mt-1 ${getLevelBadgeColor(position.level)}`}>
                          {getLevelTitle(position.level)}
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle suggest contact
                        }}
                      >
                        Suggest
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  // Person Detail View
  if (currentView === 'person' && selectedPerson) {
    return (
      <div className="min-h-screen bg-muted pb-20">
        {/* Person Header */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('department')}
                className="p-2 text-white hover:bg-white/20 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm opacity-90">Back to {selectedDepartment}</span>
            </div>
            
            {selectedPerson.contact ? (
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 ring-4 ring-white/30">
                  <AvatarImage src={selectedPerson.contact.profileImage} alt={selectedPerson.contact.fullName} />
                  <AvatarFallback className="bg-white/20 text-white font-bold text-lg">
                    {selectedPerson.contact.fullName.split(' ').map(n => n.charAt(0)).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold">{selectedPerson.contact.fullName}</h1>
                  <p className="text-white/90">{selectedPerson.title}</p>
                  <div className="flex items-center mt-2">
                    <Badge className="bg-white/20 text-white border-white/30">
                      {getLevelTitle(selectedPerson.level)}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-bold">{selectedPerson.title}</h1>
                <p className="text-white/90">Open Position</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Actions */}
        {selectedPerson.contact && (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {selectedPerson.contact.email && (
                <Button 
                  className="flex flex-col items-center py-4 h-auto bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.location.href = `mailto:${selectedPerson.contact?.email}`}
                >
                  <Mail className="w-5 h-5 mb-1" />
                  <span className="text-xs">Email</span>
                </Button>
              )}
              
              {selectedPerson.contact.phone && (
                <Button 
                  variant="outline"
                  className="flex flex-col items-center py-4 h-auto"
                  onClick={() => window.location.href = `tel:${selectedPerson.contact?.phone}`}
                >
                  <Phone className="w-5 h-5 mb-1" />
                  <span className="text-xs">Call</span>
                </Button>
              )}
              
              {selectedPerson.contact.linkedinUrl && (
                <Button 
                  variant="outline"
                  className="flex flex-col items-center py-4 h-auto"
                  onClick={() => window.open(selectedPerson.contact?.linkedinUrl, '_blank')}
                >
                  <Linkedin className="w-5 h-5 mb-1" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
              )}
              
              {/* Fill remaining space if less than 3 actions */}
              {(!selectedPerson.contact.email || !selectedPerson.contact.phone || !selectedPerson.contact.linkedinUrl) && (
                <Button 
                  variant="outline"
                  className="flex flex-col items-center py-4 h-auto"
                >
                  <Users className="w-5 h-5 mb-1" />
                  <span className="text-xs">Connect</span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Additional Info Cards */}
        <div className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Position Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{selectedPerson.department || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seniority Level:</span>
                  <span className="font-medium">{getLevelTitle(selectedPerson.level)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Direct Reports:</span>
                  <span className="font-medium">{selectedPerson.children?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedPerson.contact && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {selectedPerson.contact.email && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium truncate ml-2">{selectedPerson.contact.email}</span>
                    </div>
                  )}
                  {selectedPerson.contact.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{selectedPerson.contact.phone}</span>
                    </div>
                  )}
                  {selectedPerson.contact.linkedinUrl && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">LinkedIn:</span>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-blue-600"
                        onClick={() => window.open(selectedPerson.contact?.linkedinUrl, '_blank')}
                      >
                        View Profile
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return null;
}
