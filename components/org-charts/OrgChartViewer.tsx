'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Search,
  Filter,
  Users,
  Building2,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Clock
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
  parentId?: string;
}

interface OrgChartViewerProps {
  companyId: string;
  chartData: Position[];
  companyName: string;
  loading?: boolean;
}

export function OrgChartViewer({ companyId, chartData, companyName, loading = false }: OrgChartViewerProps) {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'departments'>('hierarchy');

  // Auto-expand top-level positions on initial load
  useEffect(() => {
    if (chartData.length > 0 && expandedPositions.size === 0) {
      const topLevelIds = chartData.filter(pos => !pos.parentId || pos.level <= 2).map(pos => pos.id);
      setExpandedPositions(new Set(topLevelIds));
    }
  }, [chartData]);

  const getLevelColor = (level: number) => {
    const colors = {
      1: 'from-primary to-secondary',       // C-Level (DealMecca primary to secondary)
      2: 'from-secondary to-accent',        // VP (secondary to accent)
      3: 'from-accent to-secondary',        // Director (accent to secondary)
      4: 'from-secondary/80 to-primary/80', // Manager (muted brand colors)
      5: 'from-neutral-400 to-neutral-600' // Individual
    };
    return colors[level as keyof typeof colors] || colors[5];
  };

  const getLevelTitle = (level: number) => {
    const titles = {
      1: 'C-Level',
      2: 'Vice President', 
      3: 'Director',
      4: 'Manager',
      5: 'Individual Contributor'
    };
    return titles[level as keyof typeof titles] || 'Team Member';
  };

  const getLevelBadgeColor = (level: number) => {
    const colors = {
      1: 'bg-primary/10 text-primary border-primary/20',
      2: 'bg-secondary/10 text-secondary border-secondary/20',
      3: 'bg-accent/10 text-accent border-accent/20',
      4: 'bg-secondary/5 text-secondary/80 border-secondary/10',
      5: 'bg-neutral-100 text-neutral-700 border-neutral-200'
    };
    return colors[level as keyof typeof colors] || colors[5];
  };

  const toggleExpanded = (positionId: string) => {
    const newExpanded = new Set(expandedPositions);
    if (newExpanded.has(positionId)) {
      newExpanded.delete(positionId);
    } else {
      newExpanded.add(positionId);
    }
    setExpandedPositions(newExpanded);
  };

  const handleContactAction = (action: string, value: string) => {
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

  const renderPosition = (position: Position, depth: number = 0) => {
    const isExpanded = expandedPositions.has(position.id);
    const hasChildren = position.children && position.children.length > 0;
    const isSelected = selectedPosition === position.id;

    return (
      <div key={position.id} className="relative">
        {/* Position Card */}
        <Card 
          className={`mb-4 transition-all duration-300 cursor-pointer ${
            isSelected 
              ? 'ring-2 ring-blue-500 shadow-xl scale-105' 
              : 'hover:shadow-lg hover:scale-102'
          }`}
          style={{ 
            marginLeft: `${depth * 40}px`,
            transform: `scale(${zoomLevel}) ${isSelected ? 'scale(1.05)' : ''}`,
            transformOrigin: 'top left'
          }}
          onClick={() => setSelectedPosition(position.id)}
        >
          {/* Tier Indicator Bar */}
          <div className={`h-1 w-full bg-gradient-to-r ${getLevelColor(position.level)} rounded-t-lg`} />
          
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Expand/Collapse Button */}
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 hover:bg-blue-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(position.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-blue-600" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-blue-600" />
                    )}
                  </Button>
                )}
                
                {/* Position Info */}
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">
                    {position.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`text-xs ${getLevelBadgeColor(position.level)}`}>
                      {getLevelTitle(position.level)}
                    </Badge>
                    {position.department && (
                      <Badge variant="outline" className="text-xs">
                        {position.department}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Hierarchy Level Indicator */}
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Level {position.level}</div>
                {hasChildren && (
                  <div className="text-xs text-blue-600">
                    {position.children.length} {position.children.length === 1 ? 'report' : 'reports'}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Contact Information */}
          {position.contact && (
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10 ring-2 ring-white shadow-sm">
                    <AvatarImage src={position.contact.profileImage} alt={position.contact.fullName} />
                    <AvatarFallback className={`bg-gradient-to-br ${getLevelColor(position.level)} text-white font-semibold`}>
                      {position.contact.fullName.split(' ').map(n => n.charAt(0)).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{position.contact.fullName}</p>
                    <p className="text-sm text-muted-foreground truncate">{position.contact.email}</p>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="flex space-x-1">
                  {position.contact.email && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactAction('email', position.contact!.email!);
                      }}
                    >
                      <Mail className="w-3 h-3" />
                    </Button>
                  )}
                  
                  {position.contact.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactAction('phone', position.contact!.phone!);
                      }}
                    >
                      <Phone className="w-3 h-3" />
                    </Button>
                  )}
                  
                  {position.contact.linkedinUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactAction('linkedin', position.contact!.linkedinUrl!);
                      }}
                    >
                      <Linkedin className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          )}

          {/* Empty Position Indicator */}
          {!position.contact && (
            <CardContent className="pt-0">
              <div className="text-center py-3 border-2 border-dashed border-border rounded-lg">
                <div className="text-sm text-muted-foreground italic mb-2">Position Available</div>
                <Button size="sm" variant="ghost" className="text-xs text-blue-600 hover:bg-blue-50">
                  Suggest Contact
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Children Positions */}
        {hasChildren && isExpanded && (
          <div className="relative ml-4">
            {/* Connection Lines */}
            <div 
              className="absolute left-0 top-0 w-px bg-gradient-to-b from-blue-300 to-transparent"
              style={{ 
                height: `${position.children.length * 140}px`,
                marginLeft: `${depth * 40}px`
              }}
            />
            
            {position.children.map((child, index) => (
              <div key={child.id} className="relative">
                {/* Horizontal connection line */}
                <div 
                  className="absolute top-16 w-8 h-px bg-blue-300"
                  style={{ 
                    left: `${(depth * 40)}px`
                  }}
                />
                {renderPosition(child, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-1 bg-muted rounded w-full mb-4"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div>
                      <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No org chart available</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This company doesn't have an organizational chart yet.
            </p>
            <div className="mt-6">
              <Button>
                Create Org Chart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Org Chart Header */}
      <Card className="card-premium bg-gradient-to-r from-secondary/5 to-accent/5 border-secondary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-primary font-headline">
                <Building2 className="w-6 h-6 mr-3 text-secondary" />
                {companyName} - Organization Chart
              </CardTitle>
              <p className="body-medium mt-2">
                Interactive organizational hierarchy with contact information
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'hierarchy' ? 'departments' : 'hierarchy')}
                className="border-secondary/20 text-secondary hover:bg-secondary hover:text-white"
              >
                {viewMode === 'hierarchy' ? 'View by Department' : 'View Hierarchy'}
              </Button>
              <Button variant="outline" size="sm" className="border-accent/20 text-accent hover:bg-accent hover:text-white">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                  disabled={zoomLevel >= 2}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (expandedPositions.size === 0) {
                    // Expand all
                    const allIds = new Set<string>();
                    const collectIds = (positions: Position[]) => {
                      positions.forEach(pos => {
                        allIds.add(pos.id);
                        if (pos.children) collectIds(pos.children);
                      });
                    };
                    collectIds(chartData);
                    setExpandedPositions(allIds);
                  } else {
                    // Collapse all
                    setExpandedPositions(new Set());
                  }
                }}
              >
                {expandedPositions.size === 0 ? 'Expand All' : 'Collapse All'}
              </Button>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-blue-500" />
                <span>{chartData.length} positions</span>
              </div>
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-1 text-green-500" />
                <span>{chartData.filter(p => p.contact).length} filled</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Org Chart Visualization */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-auto max-h-[800px] scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-muted">
            <div className="min-w-full pb-4">
              {chartData
                .filter(position => !position.parentId) // Show only top-level positions
                .map(position => renderPosition(position))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="text-sm font-medium text-muted-foreground mr-4">Hierarchy Levels:</div>
            {[1, 2, 3, 4, 5].map(level => (
              <div key={level} className="flex items-center space-x-2">
                <div className={`w-4 h-2 rounded bg-gradient-to-r ${getLevelColor(level)}`}></div>
                <span className="text-xs text-muted-foreground">{getLevelTitle(level)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
