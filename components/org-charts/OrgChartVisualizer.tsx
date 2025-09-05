'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  Mail, 
  Phone, 
  Linkedin,
  Building2,
  Users,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Filter
} from 'lucide-react';
import { OrgChartNode, type OrgChartNodeData } from './OrgChartNode';
import { exportOrgChart, searchOrgChart, getOrgChartStats, type ExportOptions } from '@/lib/org-chart-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface OrgChartVisualizerProps {
  companyId: string;
  companyName: string;
  orgData?: OrgChartNodeData[];
  onNodeClick?: (node: OrgChartNodeData) => void;
  onNodeExpand?: (nodeId: string, expanded: boolean) => void;
  className?: string;
}

const getSeniorityColor = (seniority?: string): string => {
  switch (seniority?.toLowerCase()) {
    case 'c_level':
    case 'founder_owner':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'evp':
    case 'svp':
    case 'vp':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'director':
    case 'senior_director':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'manager':
    case 'senior_manager':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'specialist':
    case 'senior_specialist':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getDepartmentIcon = (department?: string) => {
  switch (department?.toLowerCase()) {
    case 'leadership':
      return '👑';
    case 'account_management':
      return '🤝';
    case 'creative_services':
      return '🎨';
    case 'media_planning':
    case 'media_buying':
      return '📊';
    case 'digital_marketing':
      return '💻';
    case 'analytics_insights':
      return '📈';
    case 'business_development':
      return '🚀';
    case 'operations':
      return '⚙️';
    case 'finance':
      return '💰';
    case 'human_resources':
      return '👥';
    case 'technology':
      return '🔧';
    default:
      return '📋';
  }
};

const formatSeniorityLevel = (seniority?: string): string => {
  if (!seniority) return '';
  return seniority.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatDepartment = (department?: string): string => {
  if (!department) return '';
  return department.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function OrgChartVisualizer({ 
  companyId, 
  companyName, 
  orgData = [], 
  onNodeClick, 
  onNodeExpand,
  className = '' 
}: OrgChartVisualizerProps) {
  const [data, setData] = useState<OrgChartNode[]>(orgData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedSeniority, setSelectedSeniority] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'grid' | 'list'>('hierarchy');
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrgChartData();
  }, [companyId]);

  const fetchOrgChartData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/org-charts/hierarchy/${companyId}`);
      if (response.ok) {
        const orgChartData = await response.json();
        setData(orgChartData.hierarchy || []);
      } else {
        // Use mock data if API not available
        setData(getMockOrgData());
      }
    } catch (error) {
      console.error('Failed to fetch org chart data:', error);
      setData(getMockOrgData());
    } finally {
      setLoading(false);
    }
  };

  const getMockOrgData = (): OrgChartNode[] => {
    return [
      {
        id: 'ceo-1',
        name: 'Sarah Johnson',
        title: 'Chief Executive Officer',
        email: 'sarah.johnson@company.com',
        department: 'leadership',
        seniority: 'c_level',
        level: 0,
        managerOf: 4,
        isExpanded: true,
        children: [
          {
            id: 'coo-1',
            name: 'Michael Chen',
            title: 'Chief Operating Officer',
            email: 'michael.chen@company.com',
            department: 'operations',
            seniority: 'c_level',
            level: 1,
            managerOf: 3,
            isExpanded: true,
            children: [
              {
                id: 'dir-ops-1',
                name: 'Jennifer Wu',
                title: 'Director of Operations',
                email: 'jennifer.wu@company.com',
                department: 'operations',
                seniority: 'director',
                level: 2,
                managerOf: 5,
                children: []
              }
            ]
          },
          {
            id: 'cmo-1',
            name: 'David Rodriguez',
            title: 'Chief Marketing Officer',
            email: 'david.rodriguez@company.com',
            department: 'strategy_planning',
            seniority: 'c_level',
            level: 1,
            managerOf: 6,
            isExpanded: true,
            children: [
              {
                id: 'dir-media-1',
                name: 'Lisa Thompson',
                title: 'Director of Media Planning',
                email: 'lisa.thompson@company.com',
                department: 'media_planning',
                seniority: 'director',
                level: 2,
                managerOf: 8,
                children: []
              },
              {
                id: 'dir-creative-1',
                name: 'Alex Kim',
                title: 'Creative Director',
                email: 'alex.kim@company.com',
                department: 'creative_services',
                seniority: 'director',
                level: 2,
                managerOf: 12,
                children: []
              }
            ]
          },
          {
            id: 'cto-1',
            name: 'Robert Zhang',
            title: 'Chief Technology Officer',
            email: 'robert.zhang@company.com',
            department: 'technology',
            seniority: 'c_level',
            level: 1,
            managerOf: 15,
            isExpanded: false,
            children: []
          }
        ]
      }
    ];
  };

  const handleNodeExpand = (nodeId: string) => {
    const updateNodeExpansion = (nodes: OrgChartNode[]): OrgChartNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          const newExpanded = !node.isExpanded;
          if (onNodeExpand) {
            onNodeExpand(nodeId, newExpanded);
          }
          return { ...node, isExpanded: newExpanded };
        }
        if (node.children) {
          return { ...node, children: updateNodeExpansion(node.children) };
        }
        return node;
      });
    };

    setData(updateNodeExpansion(data));
  };

  const handleNodeClick = (node: OrgChartNode) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const renderOrgNode = (node: OrgChartNode, index: number) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.isExpanded && hasChildren;

    return (
      <div key={node.id} className="relative">
        {/* Connection Lines */}
        {node.level > 0 && (
          <div className="absolute left-0 top-0 w-6 h-6 border-l-2 border-b-2 border-gray-300 -ml-6 -mt-3"></div>
        )}

        {/* Node Card */}
        <Card 
          className="mb-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm"
          onClick={() => handleNodeClick(node)}
          style={{
            marginLeft: `${node.level * 40}px`,
            transform: `scale(${zoom})`
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={node.avatarUrl} alt={node.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {node.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{node.name}</h3>
                    {node.department && (
                      <span className="text-lg" title={formatDepartment(node.department)}>
                        {getDepartmentIcon(node.department)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium text-gray-700 mb-1">{node.title}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {node.seniority && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getSeniorityColor(node.seniority)}`}
                      >
                        {formatSeniorityLevel(node.seniority)}
                      </Badge>
                    )}
                    {node.department && (
                      <Badge variant="outline" className="text-xs">
                        {formatDepartment(node.department)}
                      </Badge>
                    )}
                    {node.managerOf && node.managerOf > 0 && (
                      <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">
                        {node.managerOf} reports
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    {node.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-32">{node.email}</span>
                      </div>
                    )}
                    {node.linkedinUrl && (
                      <div className="flex items-center space-x-1">
                        <Linkedin className="h-3 w-3" />
                        <span>LinkedIn</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expand/Collapse Button */}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeExpand(node.id);
                  }}
                  className="ml-2 p-1"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Render Children */}
        {isExpanded && node.children && (
          <div className="ml-6 border-l-2 border-gray-200 pl-4">
            {node.children.map((child, childIndex) => renderOrgNode(child, childIndex))}
          </div>
        )}
      </div>
    );
  };

  const filterData = (nodes: OrgChartNode[]): OrgChartNode[] => {
    return nodes.filter(node => {
      const matchesSearch = !searchQuery || 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = !selectedDepartment || node.department === selectedDepartment;
      const matchesSeniority = !selectedSeniority || node.seniority === selectedSeniority;
      
      return matchesSearch && matchesDepartment && matchesSeniority;
    }).map(node => ({
      ...node,
      children: node.children ? filterData(node.children) : []
    }));
  };

  const filteredData = filterData(data);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border">
              <div className="flex space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls Header */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Organization Chart</h2>
            <Badge variant="outline">{companyName}</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Departments</option>
            <option value="leadership">Leadership</option>
            <option value="operations">Operations</option>
            <option value="strategy_planning">Strategy & Planning</option>
            <option value="media_planning">Media Planning</option>
            <option value="creative_services">Creative Services</option>
            <option value="technology">Technology</option>
          </select>

          <select
            value={selectedSeniority}
            onChange={(e) => setSelectedSeniority(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Levels</option>
            <option value="c_level">C-Level</option>
            <option value="director">Director</option>
            <option value="manager">Manager</option>
            <option value="specialist">Specialist</option>
          </select>
        </div>
      </div>

      {/* Org Chart Display */}
      <div 
        ref={containerRef}
        className="bg-white rounded-lg border p-6 overflow-auto"
        style={{ maxHeight: '800px' }}
      >
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map((node, index) => renderOrgNode(node, index))}
          </div>
        )}
      </div>
    </div>
  );
}