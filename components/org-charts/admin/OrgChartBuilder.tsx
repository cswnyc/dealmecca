'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Save, 
  Undo, 
  Redo,
  Users,
  Building2,
  Trash2,
  Edit,
  Check,
  X,
  Search,
  Crown,
  Shield,
  Target,
  Settings,
  Code,
  TrendingUp
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
  department: string;
  level: number;
  parentId?: string;
  contactId?: string;
  contact?: Contact;
  x?: number;
  y?: number;
  isNew?: boolean;
}

interface OrgChartBuilderProps {
  companyId: string;
  companyName: string;
  initialPositions?: Position[];
  availableContacts?: Contact[];
  onSave?: (positions: Position[]) => void;
}

export function OrgChartBuilder({ 
  companyId, 
  companyName, 
  initialPositions = [], 
  availableContacts = [],
  onSave 
}: OrgChartBuilderProps) {
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<string | null>(null);
  const [draggedPosition, setDraggedPosition] = useState<string | null>(null);
  const [history, setHistory] = useState<Position[][]>([initialPositions]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [searchContacts, setSearchContacts] = useState('');
  const [saving, setSaving] = useState(false);

  const departments = [
    'Executive',
    'Marketing', 
    'Sales',
    'Technology',
    'Operations',
    'Finance',
    'HR',
    'General'
  ];

  const levels = [
    { value: 1, label: 'C-Level', icon: Crown, color: 'from-purple-500 to-blue-600' },
    { value: 2, label: 'Vice President', icon: Shield, color: 'from-blue-500 to-teal-600' },
    { value: 3, label: 'Director', icon: Target, color: 'from-green-500 to-blue-500' },
    { value: 4, label: 'Manager', icon: Settings, color: 'from-orange-500 to-red-500' },
    { value: 5, label: 'Individual', icon: Code, color: 'from-gray-400 to-gray-600' }
  ];

  const saveToHistory = useCallback((newPositions: Position[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newPositions]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const addPosition = () => {
    const newPosition: Position = {
      id: `pos_${Date.now()}`,
      title: 'New Position',
      department: 'General',
      level: 3,
      parentId: selectedPosition || undefined,
      isNew: true
    };
    
    const newPositions = [...positions, newPosition];
    setPositions(newPositions);
    saveToHistory(newPositions);
    setSelectedPosition(newPosition.id);
    setEditingPosition(newPosition.id);
  };

  const updatePosition = (positionId: string, updates: Partial<Position>) => {
    const newPositions = positions.map(pos => 
      pos.id === positionId ? { ...pos, ...updates, isNew: false } : pos
    );
    setPositions(newPositions);
    saveToHistory(newPositions);
  };

  const deletePosition = (positionId: string) => {
    const newPositions = positions.filter(pos => pos.id !== positionId);
    setPositions(newPositions);
    saveToHistory(newPositions);
    if (selectedPosition === positionId) {
      setSelectedPosition(null);
    }
  };

  const assignContact = (positionId: string, contact: Contact) => {
    updatePosition(positionId, { 
      contactId: contact.id,
      contact: contact
    });
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPositions(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPositions(history[historyIndex + 1]);
    }
  };

  const saveOrgChart = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/companies/${companyId}/org-chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          positions: positions.map(pos => ({
            title: pos.title,
            department: pos.department,
            level: pos.level,
            parentId: pos.parentId,
            contactId: pos.contactId,
            x: pos.x || 0,
            y: pos.y || 0
          })),
          chartName: `${companyName} Organization Chart`,
          chartDescription: `Organizational structure for ${companyName}`
        })
      });
      
      if (response.ok) {
        alert('Org chart saved successfully!');
        onSave?.(positions);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save org chart. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredContacts = availableContacts.filter(contact =>
    contact.fullName.toLowerCase().includes(searchContacts.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchContacts.toLowerCase())
  );

  const selectedPos = positions.find(pos => pos.id === selectedPosition);
  const editingPos = positions.find(pos => pos.id === editingPosition);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen max-h-screen overflow-hidden">
      {/* Position Editor */}
      <Card className="flex flex-col max-h-full">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Position Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          <Button onClick={addPosition} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Position
          </Button>
          
          {selectedPos && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Selected Position</h4>
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingPosition(selectedPos.id)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => deletePosition(selectedPos.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {editingPosition === selectedPos.id ? (
                <div className="space-y-3">
                  <div>
                    <Label>Position Title</Label>
                    <Input 
                      value={editingPos?.title || ''}
                      placeholder="e.g., Senior Marketing Director"
                      onChange={(e) => updatePosition(selectedPos.id, { title: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label>Department</Label>
                    <Select 
                      value={editingPos?.department || 'General'}
                      onValueChange={(value) => updatePosition(selectedPos.id, { department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Seniority Level</Label>
                    <Select 
                      value={editingPos?.level.toString() || '3'}
                      onValueChange={(value) => updatePosition(selectedPos.id, { level: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map(level => {
                          const Icon = level.icon;
                          return (
                            <SelectItem key={level.value} value={level.value.toString()}>
                              <div className="flex items-center">
                                <Icon className="w-4 h-4 mr-2" />
                                Level {level.value} - {level.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => setEditingPosition(null)}
                      className="flex-1"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Done
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingPosition(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-gray-500">Title</Label>
                    <p className="font-medium">{selectedPos.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Department</Label>
                    <p>{selectedPos.department}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Level</Label>
                    <Badge className={`bg-gradient-to-r ${levels[selectedPos.level - 1]?.color} text-white`}>
                      Level {selectedPos.level}
                    </Badge>
                  </div>
                  {selectedPos.contact && (
                    <div>
                      <Label className="text-xs text-gray-500">Assigned To</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={selectedPos.contact.profileImage} />
                          <AvatarFallback className="text-xs">
                            {selectedPos.contact.fullName.split(' ').map(n => n.charAt(0)).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{selectedPos.contact.fullName}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Contact Assignment */}
          {selectedPos && !selectedPos.contact && (
            <div className="border-t pt-4 space-y-3">
              <Label>Assign Contact</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search contacts..."
                  value={searchContacts}
                  onChange={(e) => setSearchContacts(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {filteredContacts.map(contact => (
                  <div 
                    key={contact.id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => assignContact(selectedPos.id, contact)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={contact.profileImage} />
                      <AvatarFallback className="text-xs">
                        {contact.fullName.split(' ').map(n => n.charAt(0)).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{contact.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart Preview */}
      <Card className="lg:col-span-2 flex flex-col max-h-full">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {companyName} - Org Chart Builder
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="w-4 h-4" />
              </Button>
              <Button 
                onClick={saveOrgChart}
                disabled={saving || positions.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Chart'}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {positions.length} positions • {positions.filter(p => p.contact).length} assigned
          </p>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {positions.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start building your org chart by adding positions</p>
                <Button className="mt-4" onClick={addPosition}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Position
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {/* Render org chart preview */}
              {positions
                .filter(pos => !pos.parentId) // Show only top-level positions
                .map(position => (
                  <div key={position.id} className="space-y-2">
                    <PositionCard 
                      position={position}
                      allPositions={positions}
                      isSelected={selectedPosition === position.id}
                      isEditing={editingPosition === position.id}
                      onSelect={setSelectedPosition}
                      depth={0}
                    />
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for rendering position cards
function PositionCard({ 
  position, 
  allPositions, 
  isSelected, 
  isEditing,
  onSelect, 
  depth 
}: { 
  position: Position;
  allPositions: Position[];
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string) => void;
  depth: number;
}) {
  const children = allPositions.filter(pos => pos.parentId === position.id);
  const levelColors = [
    'from-purple-500 to-blue-600',
    'from-blue-500 to-teal-600',
    'from-green-500 to-blue-500',
    'from-orange-500 to-red-500',
    'from-gray-400 to-gray-600'
  ];

  return (
    <div className="relative">
      <Card 
        className={`cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
        } ${isEditing ? 'ring-2 ring-green-500' : ''} ${position.isNew ? 'ring-2 ring-yellow-500' : ''}`}
        style={{ marginLeft: `${depth * 20}px` }}
        onClick={() => onSelect(position.id)}
      >
        <div className={`h-1 w-full bg-gradient-to-r ${levelColors[position.level - 1]} rounded-t-lg`} />
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{position.title}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {position.department}
                </Badge>
                <Badge className="text-xs">
                  Level {position.level}
                </Badge>
              </div>
              {position.contact && (
                <div className="flex items-center space-x-2 mt-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={position.contact.profileImage} />
                    <AvatarFallback className="text-xs">
                      {position.contact.fullName.split(' ').map(n => n.charAt(0)).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">{position.contact.fullName}</span>
                </div>
              )}
            </div>
            {children.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {children.length} reports
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Render children */}
      {children.map(child => (
        <PositionCard
          key={child.id}
          position={child}
          allPositions={allPositions}
          isSelected={false}
          isEditing={false}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
