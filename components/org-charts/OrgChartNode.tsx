'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  Mail, 
  Phone, 
  Linkedin,
  ExternalLink,
  MessageSquare,
  Calendar,
  MoreVertical,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export interface OrgChartNodeData {
  id: string;
  name: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  department?: string;
  seniority?: string;
  avatarUrl?: string;
  isExpanded?: boolean;
  children?: OrgChartNodeData[];
  level: number;
  companyName?: string;
  managerOf?: number;
  directReports?: string[];
  location?: string;
  startDate?: string;
  bio?: string;
}

interface OrgChartNodeProps {
  node: OrgChartNodeData;
  onExpand?: (nodeId: string) => void;
  onClick?: (node: OrgChartNodeData) => void;
  onContact?: (node: OrgChartNodeData, method: 'email' | 'linkedin' | 'phone') => void;
  zoom?: number;
  viewMode?: 'compact' | 'detailed' | 'card';
  showActions?: boolean;
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

const getDepartmentIcon = (department?: string): string => {
  switch (department?.toLowerCase()) {
    case 'leadership': return '👑';
    case 'account_management': return '🤝';
    case 'creative_services': return '🎨';
    case 'media_planning':
    case 'media_buying': return '📊';
    case 'digital_marketing': return '💻';
    case 'analytics_insights': return '📈';
    case 'business_development': return '🚀';
    case 'operations': return '⚙️';
    case 'finance': return '💰';
    case 'human_resources': return '👥';
    case 'technology': return '🔧';
    case 'sales': return '💼';
    case 'marketing': return '📢';
    default: return '📋';
  }
};

const formatText = (text?: string): string => {
  if (!text) return '';
  return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getAvatarFallback = (name: string): string => {
  return name.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function OrgChartNode({
  node,
  onExpand,
  onClick,
  onContact,
  zoom = 1,
  viewMode = 'detailed',
  showActions = true,
  className = ''
}: OrgChartNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = node.isExpanded && hasChildren;

  const handleNodeClick = () => {
    if (onClick) {
      onClick(node);
    }
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpand) {
      onExpand(node.id);
    }
  };

  const handleContact = (method: 'email' | 'linkedin' | 'phone') => {
    if (onContact) {
      onContact(node, method);
    }
  };

  const renderCompactView = () => (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 ${getSeniorityColor(node.seniority).includes('purple') ? 'border-l-purple-400' : 
        getSeniorityColor(node.seniority).includes('blue') ? 'border-l-blue-400' : 
        getSeniorityColor(node.seniority).includes('green') ? 'border-l-green-400' : 
        'border-l-gray-400'} ${className}`}
      onClick={handleNodeClick}
      style={{ transform: `scale(${zoom})` }}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={node.avatarUrl} alt={node.name} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                {getAvatarFallback(node.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900 truncate text-sm">{node.name}</h4>
                {node.department && (
                  <span className="text-sm">{getDepartmentIcon(node.department)}</span>
                )}
              </div>
              <p className="text-xs text-gray-600 truncate">{node.title}</p>
            </div>
          </div>

          {hasChildren && (
            <Button variant="ghost" size="sm" onClick={handleExpand} className="p-1 h-6 w-6">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDetailedView = () => (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm ${className}`}
      onClick={handleNodeClick}
      style={{ transform: `scale(${zoom})` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={node.avatarUrl} alt={node.name} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {getAvatarFallback(node.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">{node.name}</h3>
                {node.department && (
                  <span className="text-lg" title={formatText(node.department)}>
                    {getDepartmentIcon(node.department)}
                  </span>
                )}
              </div>
              
              <p className="text-sm font-medium text-gray-700 mb-2 truncate">{node.title}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {node.seniority && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getSeniorityColor(node.seniority)}`}
                  >
                    {formatText(node.seniority)}
                  </Badge>
                )}
                {node.department && (
                  <Badge variant="outline" className="text-xs">
                    {formatText(node.department)}
                  </Badge>
                )}
                {node.managerOf && node.managerOf > 0 && (
                  <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">
                    {node.managerOf} reports
                  </Badge>
                )}
                {node.location && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                    {node.location}
                  </Badge>
                )}
              </div>

              {/* Contact Information */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {node.email && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact('email');
                    }}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="h-3 w-3" />
                    <span className="truncate max-w-32">{node.email}</span>
                  </button>
                )}
                {node.phone && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact('phone');
                    }}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{node.phone}</span>
                  </button>
                )}
                {node.linkedinUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact('linkedin');
                    }}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="h-3 w-3" />
                    <span>LinkedIn</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 ml-2">
            {/* Action Buttons */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleNodeClick()}>
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  {node.email && (
                    <DropdownMenuItem onClick={() => handleContact('email')}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                  )}
                  {node.linkedinUrl && (
                    <DropdownMenuItem onClick={() => handleContact('linkedin')}>
                      <Linkedin className="h-4 w-4 mr-2" />
                      View LinkedIn
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Expand/Collapse Button */}
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpand}
                className="p-1 h-8 w-8"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Bio/Description */}
        {node.bio && viewMode === 'detailed' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 line-clamp-2">{node.bio}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderCardView = () => (
    <Card 
      className={`cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50 ${className}`}
      onClick={handleNodeClick}
      style={{ transform: `scale(${zoom})` }}
    >
      <CardContent className="p-6 text-center">
        <Avatar className="h-16 w-16 mx-auto mb-4">
          <AvatarImage src={node.avatarUrl} alt={node.name} />
          <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
            {getAvatarFallback(node.name)}
          </AvatarFallback>
        </Avatar>
        
        <h3 className="font-semibold text-gray-900 mb-1">{node.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{node.title}</p>
        
        <div className="flex justify-center mb-4">
          {node.seniority && (
            <Badge 
              variant="outline" 
              className={`text-xs ${getSeniorityColor(node.seniority)}`}
            >
              {formatText(node.seniority)}
            </Badge>
          )}
        </div>

        <div className="flex justify-center space-x-2">
          {node.email && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleContact('email');
              }}
              className="p-2"
            >
              <Mail className="h-3 w-3" />
            </Button>
          )}
          {node.linkedinUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleContact('linkedin');
              }}
              className="p-2"
            >
              <Linkedin className="h-3 w-3" />
            </Button>
          )}
          {hasChildren && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExpand}
              className="p-2"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
        
        {node.managerOf && node.managerOf > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            Manages {node.managerOf} {node.managerOf === 1 ? 'person' : 'people'}
          </p>
        )}
      </CardContent>
    </Card>
  );

  switch (viewMode) {
    case 'compact':
      return renderCompactView();
    case 'card':
      return renderCardView();
    default:
      return renderDetailedView();
  }
}