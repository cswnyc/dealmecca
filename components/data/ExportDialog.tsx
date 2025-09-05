'use client';

import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Filter,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  Users,
  Building,
  Search,
  BarChart3
} from 'lucide-react';

interface ExportOptions {
  type: 'contacts' | 'companies' | 'searches' | 'analytics';
  format: 'csv' | 'excel' | 'json';
  filters: Record<string, any>;
  fields: string[];
  includeMetadata: boolean;
  maxRecords: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface ExportDialogProps {
  trigger?: React.ReactNode;
  defaultType?: ExportOptions['type'];
  defaultFilters?: Record<string, any>;
  onExportComplete?: (result: any) => void;
}

const EXPORT_TYPES = [
  {
    value: 'contacts',
    label: 'Contacts',
    icon: Users,
    description: 'Export contact information and details'
  },
  {
    value: 'companies',
    label: 'Companies',
    icon: Building,
    description: 'Export company profiles and data'
  },
  {
    value: 'searches',
    label: 'Search History',
    icon: Search,
    description: 'Export your search history and analytics'
  },
  {
    value: 'analytics',
    label: 'Analytics Data',
    icon: BarChart3,
    description: 'Export detailed analytics and insights'
  }
];

const EXPORT_FORMATS = [
  {
    value: 'csv',
    label: 'CSV',
    icon: FileText,
    description: 'Comma-separated values (Excel compatible)'
  },
  {
    value: 'excel',
    label: 'Excel',
    icon: FileSpreadsheet,
    description: 'Microsoft Excel workbook (.xlsx)'
  },
  {
    value: 'json',
    label: 'JSON',
    icon: FileJson,
    description: 'JavaScript Object Notation (developer-friendly)'
  }
];

const DEFAULT_FIELDS = {
  contacts: [
    'id', 'firstName', 'lastName', 'email', 'phone', 'title', 'company',
    'linkedinUrl', 'industry', 'location', 'createdAt'
  ],
  companies: [
    'id', 'name', 'domain', 'industry', 'size', 'location', 'description',
    'website', 'founded', 'revenue', 'employeeCount', 'createdAt'
  ],
  searches: [
    'searchId', 'query', 'filters', 'totalResults', 'returnedResults',
    'loadTime', 'contactsViewed', 'emailsRevealed', 'exported', 'saved', 'timestamp'
  ],
  analytics: [
    'event', 'timestamp', 'properties', 'context', 'sessionId'
  ]
};

export default function ExportDialog({
  trigger,
  defaultType = 'contacts',
  defaultFilters = {},
  onExportComplete
}: ExportDialogProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [options, setOptions] = useState<ExportOptions>({
    type: defaultType,
    format: 'csv',
    filters: defaultFilters,
    fields: DEFAULT_FIELDS[defaultType],
    includeMetadata: true,
    maxRecords: 10000,
    dateRange: undefined
  });

  const handleExport = async () => {
    if (!user) return;

    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);
    setExportProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      // Get export metadata from headers
      const recordCount = response.headers.get('X-Export-Records');
      const filename = response.headers.get('content-disposition')
        ?.split('filename=')[1]?.replace(/"/g, '') || 'export';

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportSuccess(true);
      
      if (onExportComplete) {
        onExportComplete({
          filename,
          recordCount: parseInt(recordCount || '0'),
          type: options.type,
          format: options.format
        });
      }

      // Close dialog after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setExportSuccess(false);
        setExportProgress(0);
      }, 2000);

    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
      setExportProgress(0);
    } finally {
      setIsExporting(false);
    }
  };

  const updateOptions = (updates: Partial<ExportOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }));
  };

  const updateFields = (field: string, checked: boolean) => {
    setOptions(prev => ({
      ...prev,
      fields: checked 
        ? [...prev.fields, field]
        : prev.fields.filter(f => f !== field)
    }));
  };

  const resetToDefaults = () => {
    setOptions(prev => ({
      ...prev,
      fields: DEFAULT_FIELDS[prev.type],
      maxRecords: 10000,
      includeMetadata: true,
      dateRange: undefined
    }));
  };

  const defaultTrigger = (
    <Button variant="outline">
      <Download className="h-4 w-4 mr-2" />
      Export Data
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
          <DialogDescription>
            Choose what data to export and how you want it formatted
          </DialogDescription>
        </DialogHeader>

        {exportSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Export Completed!</h3>
            <p className="text-muted-foreground">Your file has been downloaded successfully.</p>
          </div>
        ) : (
          <Tabs value={isExporting ? 'progress' : 'config'} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config" disabled={isExporting}>Configuration</TabsTrigger>
              <TabsTrigger value="progress" disabled={!isExporting}>
                {isExporting ? 'Export Progress' : 'Ready to Export'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-6">
              {/* Export Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">What would you like to export?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EXPORT_TYPES.map(type => {
                    const Icon = type.icon;
                    const isSelected = options.type === type.value;
                    const isDisabled = type.value === 'analytics' && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN';
                    
                    return (
                      <Card 
                        key={type.value}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-blue-500' : ''
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                          if (!isDisabled) {
                            updateOptions({ 
                              type: type.value as ExportOptions['type'],
                              fields: DEFAULT_FIELDS[type.value as keyof typeof DEFAULT_FIELDS]
                            });
                          }
                        }}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <Icon className="h-4 w-4" />
                            {type.label}
                            {isDisabled && <Badge variant="outline">Admin Only</Badge>}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Export Format</Label>
                <div className="grid grid-cols-3 gap-3">
                  {EXPORT_FORMATS.map(format => {
                    const Icon = format.icon;
                    const isSelected = options.format === format.value;
                    
                    return (
                      <Card 
                        key={format.value}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => updateOptions({ format: format.value as ExportOptions['format'] })}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className="h-8 w-8 mx-auto mb-2" />
                          <div className="font-medium text-sm">{format.label}</div>
                          <div className="text-xs text-muted-foreground">{format.description}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Field Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Fields to Include</Label>
                  <Button variant="link" size="sm" onClick={resetToDefaults}>
                    Reset to Defaults
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                  {DEFAULT_FIELDS[options.type].map(field => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={options.fields.includes(field)}
                        onCheckedChange={(checked) => updateFields(field, checked as boolean)}
                      />
                      <Label
                        htmlFor={field}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {field}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxRecords">Maximum Records</Label>
                  <Input
                    id="maxRecords"
                    type="number"
                    value={options.maxRecords}
                    onChange={(e) => updateOptions({ maxRecords: parseInt(e.target.value) || 1000 })}
                    min={1}
                    max={50000}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum 50,000 records per export
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeMetadata"
                      checked={options.includeMetadata}
                      onCheckedChange={(checked) => updateOptions({ includeMetadata: checked as boolean })}
                    />
                    <Label htmlFor="includeMetadata" className="cursor-pointer">
                      Include metadata
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add export information and timestamps
                  </p>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Date Range (Optional)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={options.dateRange?.start || ''}
                      onChange={(e) => updateOptions({
                        dateRange: {
                          start: e.target.value,
                          end: options.dateRange?.end || ''
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={options.dateRange?.end || ''}
                      onChange={(e) => updateOptions({
                        dateRange: {
                          start: options.dateRange?.start || '',
                          end: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Export Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Export Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Type:</span>
                    <Badge variant="outline">{options.type}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Format:</span>
                    <Badge variant="outline">{options.format.toUpperCase()}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fields:</span>
                    <Badge variant="outline">{options.fields.length} selected</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Records:</span>
                    <Badge variant="outline">{options.maxRecords.toLocaleString()}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {exportError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{exportError}</AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExport} disabled={options.fields.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Start Export
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Preparing your export...</h3>
                  <p className="text-muted-foreground">
                    Please wait while we generate your {options.format.toUpperCase()} file
                  </p>
                </div>
                <div className="space-y-2">
                  <Progress value={exportProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    {exportProgress}% complete
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}