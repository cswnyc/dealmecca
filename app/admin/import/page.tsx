'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Upload,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  Loader2,
  RefreshCw,
  Database
} from 'lucide-react';

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
  logFile?: string;
}

interface PreviewData {
  preview: any[];
  headers: string[];
  totalRows: number;
  validation: {
    valid: number;
    invalid: number;
    errors: Array<{
      row: number;
      errors: string[];
    }>;
  };
  fieldMapping: Array<{
    source: string;
    suggested?: string;
    required: boolean;
  }>;
  expectedFields: string[];
}

interface ImportLog {
  filename: string;
  size: number;
  created: string;
  modified: string;
}

export default function ImportPage() {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'companies' | 'contacts'>('companies');
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  
  // Check admin access
  if (!session || session.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Admin access required to view this page.</p>
        </div>
      </div>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewData(null);
      setImportResult(null);
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    setIsPreviewing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', importType);

      const response = await fetch('/api/admin/import/preview', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Preview failed');
      }

      const data = await response.json();
      setPreviewData(data);
    } catch (error) {
      console.error('Preview error:', error);
      alert(error instanceof Error ? error.message : 'Preview failed');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !previewData) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', importType);

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Import failed');
      }

      const result = await response.json();
      setImportResult(result);
      
      // Reset form
      setSelectedFile(null);
      setPreviewData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh logs
      fetchImportLogs();

    } catch (error) {
      console.error('Import error:', error);
      alert(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const fetchImportLogs = async () => {
    try {
      const response = await fetch('/api/admin/import');
      if (response.ok) {
        const data = await response.json();
        setImportLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch import logs:', error);
    }
  };

  const downloadSampleTemplate = (type: 'companies' | 'contacts') => {
    const headers = type === 'companies' 
      ? ['name', 'website', 'companyType', 'industry', 'city', 'state', 'description', 'employeeCount', 'foundedYear', 'verified']
      : ['firstName', 'lastName', 'title', 'email', 'phone', 'department', 'seniority', 'companyName', 'isDecisionMaker', 'verified'];
    
    const sampleData = type === 'companies' 
      ? {
          name: 'Example Media Agency',
          website: 'https://example.com',
          companyType: 'INDEPENDENT_AGENCY',
          industry: 'ENTERTAINMENT_MEDIA',
          city: 'New York',
          state: 'NY',
          description: 'A leading media agency',
          employeeCount: 'MEDIUM_51_200',
          foundedYear: '2010',
          verified: 'false'
        }
      : {
          firstName: 'John',
          lastName: 'Doe',
          title: 'Media Director',
          email: 'john.doe@example.com',
          phone: '+1-555-0123',
          department: 'MEDIA',
          seniority: 'DIRECTOR',
          companyName: 'Example Media Agency',
          isDecisionMaker: 'true',
          verified: 'false'
        };

    const csv = [headers.join(','), Object.values(sampleData).join(',')].join('\\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Database className="w-8 h-8 mr-3 text-blue-600" />
            Bulk Data Import
          </h1>
          <p className="text-gray-600 mt-2">
            Import companies and contacts in bulk from CSV or JSON files.
          </p>
        </div>

        {/* Import Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Import Data</h2>
              
              {/* Import Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Import Type
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setImportType('companies')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      importType === 'companies'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Companies
                  </button>
                  <button
                    onClick={() => setImportType('contacts')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      importType === 'contacts'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Contacts
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileText className="w-8 h-8 text-gray-500 mx-auto" />
                      <div className="text-sm font-medium text-gray-900">{selectedFile.name}</div>
                      <div className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Choose different file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <div className="text-gray-600">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Click to upload
                        </button>
                        {' '}or drag and drop
                      </div>
                      <div className="text-xs text-gray-500">
                        CSV or JSON files only
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handlePreview}
                  disabled={!selectedFile || isPreviewing}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPreviewing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span>{isPreviewing ? 'Loading...' : 'Preview Data'}</span>
                </button>

                <button
                  onClick={handleImport}
                  disabled={!previewData || isImporting || previewData.validation.valid === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isImporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{isImporting ? 'Importing...' : 'Start Import'}</span>
                </button>
              </div>

              {/* Template Download */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Need a template?</h3>
                <p className="text-xs text-blue-800 mb-3">
                  Download sample CSV templates to see the expected format.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadSampleTemplate('companies')}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Companies Template</span>
                  </button>
                  <button
                    onClick={() => downloadSampleTemplate('contacts')}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Contacts Template</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Data */}
            {previewData && (
              <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Preview</h3>
                
                {/* Validation Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-green-900">{previewData.validation.valid}</div>
                    <div className="text-xs text-green-700">Valid Rows</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-red-900">{previewData.validation.invalid}</div>
                    <div className="text-xs text-red-700">Invalid Rows</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-blue-900">{previewData.totalRows}</div>
                    <div className="text-xs text-blue-700">Total Rows</div>
                  </div>
                </div>

                {/* Field Mapping */}
                {previewData.fieldMapping.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Field Mapping</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {previewData.fieldMapping.map((mapping, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded text-xs ${
                            mapping.suggested
                              ? 'bg-green-50 border border-green-200 text-green-800'
                              : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                          }`}
                        >
                          <div className="font-medium">{mapping.source}</div>
                          {mapping.suggested ? (
                            <div>→ {mapping.suggested}</div>
                          ) : (
                            <div>→ No mapping found</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validation Errors */}
                {previewData.validation.errors.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                      Validation Errors (showing first 5)
                    </h4>
                    <div className="space-y-2">
                      {previewData.validation.errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                          <div className="font-medium text-red-900">Row {error.row}</div>
                          <ul className="list-disc list-inside text-red-700 mt-1">
                            {error.errors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample Data Table */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Sample Data</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          {previewData.headers.map((header, index) => (
                            <th key={index} className="px-2 py-1 border-b border-gray-200 text-left font-medium text-gray-700">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.preview.slice(0, 5).map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {previewData.headers.map((header, colIndex) => (
                              <td key={colIndex} className="px-2 py-1 border-b border-gray-200 text-gray-900">
                                {String(row[header] || '').substring(0, 50)}
                                {String(row[header] || '').length > 50 && '...'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Import Results */}
            {importResult && (
              <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  {importResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  )}
                  Import Results
                </h3>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-900">{importResult.imported}</div>
                    <div className="text-xs text-green-700">Imported</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-semibold text-yellow-900">{importResult.skipped}</div>
                    <div className="text-xs text-yellow-700">Skipped</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-lg font-semibold text-red-900">{importResult.errors.length}</div>
                    <div className="text-xs text-red-700">Errors</div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Import Errors (first 10)</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {importResult.errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                          <div className="font-medium text-red-900">Row {error.row}</div>
                          <div className="text-red-700">{error.error}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Import Logs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Imports</h3>
                <button
                  onClick={fetchImportLogs}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              
              {importLogs.length > 0 ? (
                <div className="space-y-2">
                  {importLogs.slice(0, 5).map((log, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                      <div className="font-medium text-gray-900">{log.filename}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(log.created).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(log.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No import logs found</div>
              )}
            </div>

            {/* Import Guidelines */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Guidelines</h3>
              
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">File Formats</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>CSV files with headers</li>
                    <li>JSON files with array of objects</li>
                    <li>Maximum file size: 10MB</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data Quality</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Duplicates are automatically skipped</li>
                    <li>Invalid data is reported but not imported</li>
                    <li>Data is normalized during import</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Required Fields</h4>
                  <div className="text-xs">
                    <div className="font-medium">Companies:</div>
                    <div>name, companyType</div>
                    <div className="font-medium mt-2">Contacts:</div>
                    <div>firstName, lastName, title, companyName</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}