'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  Building2, 
  Shield, 
  DollarSign, 
  Users, 
  Target,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  MapPin,
  Calendar,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  verified: boolean;
  companyType: string;
  city?: string;
  state?: string;
  isCenter?: boolean;
  nodeType: 'company' | 'partner';
  role?: 'agency' | 'advertiser';
}

interface Partnership {
  id: string;
  source: string;
  target: string;
  relationshipType: string;
  contractValue?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  role: 'agency' | 'advertiser';
  strength: number;
}

interface NetworkData {
  nodes: Company[];
  edges: Partnership[];
  stats: {
    totalPartners: number;
    activePartnerships: number;
    totalContractValue: number;
    relationshipTypes: string[];
    agencyPartners: number;
    advertiserPartners: number;
  };
}

interface PartnershipNetworkVisualizerProps {
  companyId: string;
  companyName: string;
  className?: string;
}

export function PartnershipNetworkVisualizer({ 
  companyId, 
  companyName, 
  className = '' 
}: PartnershipNetworkVisualizerProps) {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'network' | 'list'>('network');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNetworkData();
  }, [companyId]);

  useEffect(() => {
    if (networkData && viewMode === 'network') {
      renderNetwork();
    }
  }, [networkData, selectedNode, hoveredNode, zoomLevel, viewMode]);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orgs/companies/${companyId}/partnerships/network`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNetworkData(data.network);
      }
    } catch (error) {
      console.error('Failed to fetch partnership network:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNetwork = () => {
    if (!networkData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    const centerNode = networkData.nodes.find(n => n.isCenter);
    const partnerNodes = networkData.nodes.filter(n => !n.isCenter);

    // Draw connections first (behind nodes)
    networkData.edges.forEach((edge, index) => {
      const angle = (index / networkData.edges.length) * 2 * Math.PI;
      const partnerX = centerX + Math.cos(angle) * radius * zoomLevel;
      const partnerY = centerY + Math.sin(angle) * radius * zoomLevel;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(partnerX, partnerY);
      
      // Style connection based on relationship strength
      const alpha = 0.3 + (edge.strength * 0.7);
      const color = edge.role === 'agency' ? '59, 130, 246' : '34, 197, 94'; // Blue for agency, Green for advertiser
      ctx.strokeStyle = `rgba(${color}, ${alpha})`;
      ctx.lineWidth = Math.max(1, edge.strength * 4 * zoomLevel);
      ctx.stroke();

      // Draw relationship type label
      const midX = centerX + (partnerX - centerX) * 0.7;
      const midY = centerY + (partnerY - centerY) * 0.7;
      
      if (zoomLevel > 0.8) {
        ctx.fillStyle = `rgba(${color}, 0.8)`;
        ctx.font = `${10 * zoomLevel}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(edge.relationshipType.replace(/_/g, ' '), midX, midY);
      }
    });

    // Draw center company node
    if (centerNode) {
      drawCompanyNode(ctx, centerNode, centerX, centerY, 60 * zoomLevel, true);
    }

    // Draw partner nodes
    partnerNodes.forEach((node, index) => {
      const angle = (index / partnerNodes.length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius * zoomLevel;
      const y = centerY + Math.sin(angle) * radius * zoomLevel;
      
      const size = 40 * zoomLevel;
      drawCompanyNode(ctx, node, x, y, size, false);
    });
  };

  const drawCompanyNode = (
    ctx: CanvasRenderingContext2D,
    node: Company,
    x: number,
    y: number,
    size: number,
    isCenter: boolean
  ) => {
    const isSelected = selectedNode === node.id;
    const isHovered = hoveredNode === node.id;
    
    // Draw selection/hover ring
    if (isSelected || isHovered) {
      ctx.beginPath();
      ctx.arc(x, y, size + 8, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)';
      ctx.fill();
    }

    // Draw company circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    
    // Set colors based on company type and role
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    if (isCenter) {
      gradient.addColorStop(0, '#3b82f6'); // Blue center
      gradient.addColorStop(1, '#1e40af');
    } else if (node.role === 'agency') {
      gradient.addColorStop(0, '#8b5cf6'); // Purple for agencies
      gradient.addColorStop(1, '#7c3aed');
    } else {
      gradient.addColorStop(0, '#10b981'); // Green for advertisers
      gradient.addColorStop(1, '#059669');
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw verification badge
    if (node.verified) {
      ctx.beginPath();
      ctx.arc(x + size * 0.6, y - size * 0.6, size * 0.2, 0, 2 * Math.PI);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
    }

    // Draw company name (if zoom level is high enough)
    if (zoomLevel > 0.6) {
      ctx.fillStyle = '#1f2937';
      ctx.font = `bold ${Math.max(10, size * 0.15)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(node.name, x, y + size + 20);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!networkData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;

    // Check center node
    const centerDistance = Math.sqrt((clickX - centerX) ** 2 + (clickY - centerY) ** 2);
    if (centerDistance <= 60 * zoomLevel) {
      setSelectedNode(networkData.nodes.find(n => n.isCenter)?.id || null);
      return;
    }

    // Check partner nodes
    const partnerNodes = networkData.nodes.filter(n => !n.isCenter);
    partnerNodes.forEach((node, index) => {
      const angle = (index / partnerNodes.length) * 2 * Math.PI;
      const nodeX = centerX + Math.cos(angle) * radius * zoomLevel;
      const nodeY = centerY + Math.sin(angle) * radius * zoomLevel;
      const nodeSize = 40 * zoomLevel;
      
      const distance = Math.sqrt((clickX - nodeX) ** 2 + (clickY - nodeY) ** 2);
      if (distance <= nodeSize) {
        setSelectedNode(node.id);
      }
    });
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getSelectedNodeData = () => {
    if (!selectedNode || !networkData) return null;
    return networkData.nodes.find(n => n.id === selectedNode);
  };

  const getSelectedPartnership = () => {
    if (!selectedNode || !networkData) return null;
    return networkData.edges.find(e => e.source === selectedNode || e.target === selectedNode);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading partnership network...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!networkData || networkData.nodes.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-12 text-center">
          <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Partnership Network</h3>
          <p className="text-gray-600 mb-6">
            {companyName} doesn't have any partnerships in our system yet.
          </p>
          <Button variant="outline">
            <Target className="w-4 h-4 mr-2" />
            Suggest Partnerships
          </Button>
        </CardContent>
      </Card>
    );
  }

  const selectedNodeData = getSelectedNodeData();
  const selectedPartnership = getSelectedPartnership();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-blue-900">
                <Network className="w-6 h-6 mr-3" />
                Partnership Network
              </CardTitle>
              <p className="text-blue-700 mt-1">
                Interactive view of {companyName}'s business relationships
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'network' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('network')}
              >
                Network View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{networkData.stats.totalPartners}</div>
              <div className="text-sm text-blue-600">Total Partners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">{networkData.stats.activePartnerships}</div>
              <div className="text-sm text-green-600">Active Partnerships</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(networkData.stats.totalContractValue)}</div>
              <div className="text-sm text-purple-600">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-900">{networkData.stats.relationshipTypes.length}</div>
              <div className="text-sm text-orange-600">Relationship Types</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'network' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Visualization */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Interactive Network Map</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
                      disabled={zoomLevel <= 0.5}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600 min-w-[50px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.2))}
                      disabled={zoomLevel >= 2}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div ref={containerRef} className="relative">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className="w-full border rounded-lg cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50"
                    onClick={handleCanvasClick}
                    onMouseMove={(e) => {
                      // Add hover detection logic here if needed
                    }}
                  />
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="text-sm font-medium mb-2">Legend</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Current Company</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span>Agency Partners</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Advertiser Partners</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Node Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedNodeData ? 'Partner Details' : 'Select a Partner'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedNodeData ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      {selectedNodeData.logoUrl ? (
                        <img 
                          src={selectedNodeData.logoUrl}
                          alt={`${selectedNodeData.name} logo`}
                          className="w-12 h-12 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center space-x-2">
                          <span>{selectedNodeData.name}</span>
                          {selectedNodeData.verified && (
                            <Shield className="w-4 h-4 text-green-600" />
                          )}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {selectedNodeData.companyType.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>

                    {selectedNodeData.city && selectedNodeData.state && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedNodeData.city}, {selectedNodeData.state}</span>
                      </div>
                    )}

                    {selectedPartnership && (
                      <div className="border-t pt-4 space-y-3">
                        <h5 className="font-medium">Partnership Details</h5>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Relationship:</span>
                            <Badge variant="outline">
                              {selectedPartnership.relationshipType.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          
                          {selectedPartnership.contractValue && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Contract Value:</span>
                              <span className="font-medium">
                                {formatCurrency(selectedPartnership.contractValue)}
                              </span>
                            </div>
                          )}
                          
                          {selectedPartnership.startDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Since:</span>
                              <span>{new Date(selectedPartnership.startDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between">
                            <span className="text-gray-600">Strength:</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all"
                                  style={{ width: `${selectedPartnership.strength * 100}%` }}
                                />
                              </div>
                              <span className="text-xs">{Math.round(selectedPartnership.strength * 100)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Link href={`/orgs/companies/${selectedNodeData.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              View Company Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">Click on a partner in the network to see details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* List View */
        <Card>
          <CardHeader>
            <CardTitle>Partnership List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {networkData.edges.map((partnership) => {
                const partner = networkData.nodes.find(n => 
                  n.id === partnership.target || n.id === partnership.source
                );
                if (!partner || partner.isCenter) return null;

                return (
                  <div key={partnership.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {partner.logoUrl ? (
                          <img 
                            src={partner.logoUrl}
                            alt={`${partner.name} logo`}
                            className="w-12 h-12 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold flex items-center space-x-2">
                            <span>{partner.name}</span>
                            {partner.verified && (
                              <Shield className="w-4 h-4 text-green-600" />
                            )}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {partnership.relationshipType.replace(/_/g, ' ')}
                            </Badge>
                            <Badge 
                              variant={partnership.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {partnership.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        {partnership.contractValue && (
                          <div className="text-sm font-medium">
                            {formatCurrency(partnership.contractValue)}
                          </div>
                        )}
                        {partnership.startDate && (
                          <div className="text-xs text-gray-500">
                            Since {new Date(partnership.startDate).toLocaleDateString()}
                          </div>
                        )}
                        <Link href={`/orgs/companies/${partner.id}`}>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}