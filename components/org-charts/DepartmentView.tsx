'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Crown, 
  Shield, 
  Target,
  Briefcase,
  TrendingUp,
  Settings,
  Code,
  Mail,
  Phone,
  Linkedin,
  ChevronRight
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

interface DepartmentData {
  name: string;
  description: string;
  headCount: number;
  positions: Position[];
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DepartmentViewProps {
  positions: Position[];
  companyName: string;
  onPositionClick?: (position: Position) => void;
}

export function DepartmentView({ positions, companyName, onPositionClick }: DepartmentViewProps) {
  
  const getDepartmentIcon = (deptName: string): React.ComponentType<{ className?: string }> => {
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

  const getDepartmentColor = (deptName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Executive': 'from-primary to-secondary',
      'Marketing': 'from-secondary to-accent',
      'Sales': 'from-accent to-secondary',
      'Operations': 'from-secondary/80 to-primary/80',
      'Technology': 'from-primary/80 to-secondary',
      'Finance': 'from-secondary to-primary',
      'HR': 'from-accent/80 to-secondary/80',
      'Human Resources': 'from-accent/80 to-secondary/80',
      'General': 'from-neutral-500 to-neutral-600'
    };
    return colorMap[deptName] || colorMap['General'];
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

  // Group positions by department
  const departmentGroups = React.useMemo(() => {
    const groups: { [key: string]: Position[] } = {};
    
    positions.forEach(position => {
      const dept = position.department || 'General';
      if (!groups[dept]) {
        groups[dept] = [];
      }
      groups[dept].push(position);
    });

    // Convert to DepartmentData array and sort by seniority within each department
    return Object.entries(groups).map(([deptName, deptPositions]) => {
      const sortedPositions = [...deptPositions].sort((a, b) => a.level - b.level);
      
      return {
        name: deptName,
        description: `${deptName} team members and leadership`,
        headCount: deptPositions.length,
        positions: sortedPositions,
        color: getDepartmentColor(deptName),
        icon: getDepartmentIcon(deptName)
      };
    }).sort((a, b) => {
      // Sort departments by importance (Executive first, then alphabetically)
      if (a.name === 'Executive') return -1;
      if (b.name === 'Executive') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [positions]);

  const handleContactAction = (action: string, value: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  if (positions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No organizational data is available for this company.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Department Overview Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <Users className="w-6 h-6 mr-3 text-blue-600" />
            {companyName} - Department View
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            {departmentGroups.length} departments • {positions.length} total positions • {positions.filter(p => p.contact).length} filled roles
          </p>
        </CardHeader>
      </Card>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentGroups.map((dept) => {
          const Icon = dept.icon;
          const filledPositions = dept.positions.filter(pos => pos.contact);
          const openPositions = dept.positions.filter(pos => !pos.contact);
          
          return (
            <Card key={dept.name} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              {/* Department Header */}
              <CardHeader className={`bg-gradient-to-r ${dept.color} text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <CardTitle className="flex items-center text-white">
                    <Icon className="w-5 h-5 mr-2" />
                    {dept.name}
                  </CardTitle>
                  <p className="text-sm opacity-90 mt-1">{dept.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-1" />
                      {dept.headCount} positions
                    </div>
                    <div className="text-sm">
                      {filledPositions.length} filled • {openPositions.length} open
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {/* Department Team List */}
              <CardContent className="pt-4 max-h-80 overflow-y-auto">
                <div className="space-y-3">
                  {dept.positions.map((position) => (
                    <div 
                      key={position.id} 
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group/item"
                      onClick={() => onPositionClick?.(position)}
                    >
                      {position.contact ? (
                        <>
                          <Avatar className="w-10 h-10 ring-2 ring-white shadow-sm">
                            <AvatarImage src={position.contact.profileImage} alt={position.contact.fullName} />
                            <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                              {position.contact.fullName.split(' ').map(n => n.charAt(0)).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {position.contact.fullName}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {position.title}
                            </p>
                            <div className="flex items-center mt-1 space-x-1">
                              <Badge className={`text-xs ${getLevelBadgeColor(position.level)}`}>
                                L{position.level}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Quick Action Buttons */}
                          <div className="flex space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            {position.contact.email && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={(e) => handleContactAction('email', position.contact!.email!, e)}
                              >
                                <Mail className="w-3 h-3" />
                              </Button>
                            )}
                            {position.contact.phone && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={(e) => handleContactAction('phone', position.contact!.phone!, e)}
                              >
                                <Phone className="w-3 h-3" />
                              </Button>
                            )}
                            {position.contact.linkedinUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={(e) => handleContactAction('linkedin', position.contact!.linkedinUrl!, e)}
                              >
                                <Linkedin className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          
                          <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                            <Users className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 italic">
                              {position.title}
                            </p>
                            <p className="text-xs text-gray-400">Open Position</p>
                            <Badge className={`text-xs mt-1 ${getLevelBadgeColor(position.level)}`}>
                              L{position.level}
                            </Badge>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs opacity-0 group-hover/item:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle suggest contact action
                            }}
                          >
                            Suggest
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Department Summary */}
                {dept.positions.length > 5 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Team Completion</span>
                      <span>{Math.round((filledPositions.length / dept.positions.length) * 100)}%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 bg-gradient-to-r ${dept.color} rounded-full transition-all duration-500`}
                        style={{ width: `${(filledPositions.length / dept.positions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Department Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Department Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{departmentGroups.length}</div>
              <div className="text-sm text-gray-600">Departments</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{positions.filter(p => p.contact).length}</div>
              <div className="text-sm text-gray-600">Filled Positions</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{positions.filter(p => !p.contact).length}</div>
              <div className="text-sm text-gray-600">Open Positions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((positions.filter(p => p.contact).length / positions.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Team Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
