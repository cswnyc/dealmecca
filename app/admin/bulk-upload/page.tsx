'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Play,
  RefreshCw
} from 'lucide-react';
import { AdminPageLayout } from '@/components/navigation/PageLayout';

// Valid company types and industries from Prisma schema
const VALID_COMPANY_TYPES = [
  'INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY', 'MEDIA_HOLDING_COMPANY',
  'NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER', 'ADTECH_VENDOR', 'MARTECH_VENDOR',
  'MEDIA_OWNER', 'BROADCASTER', 'PUBLISHER', 'CONSULTANCY', 'PRODUCTION_COMPANY',
  'ADVERTISER', 'AGENCY', 'MEDIA_COMPANY', 'TECH_VENDOR'
];

const VALID_INDUSTRIES = [
  'AUTOMOTIVE', 'CPG_FOOD_BEVERAGE', 'CPG_PERSONAL_CARE', 'CPG_HOUSEHOLD',
  'FINANCIAL_SERVICES', 'HEALTHCARE_PHARMA', 'RETAIL_ECOMMERCE', 'TECHNOLOGY',
  'ENTERTAINMENT_MEDIA', 'TRAVEL_HOSPITALITY', 'TELECOM', 'FASHION_BEAUTY',
  'SPORTS_FITNESS', 'EDUCATION', 'REAL_ESTATE', 'ENERGY', 'GOVERNMENT_NONPROFIT',
  'GAMING', 'CRYPTOCURRENCY', 'INSURANCE', 'B2B_SERVICES', 'STARTUPS', 'NONPROFIT'
];

const VALID_EMPLOYEE_RANGES = [
  'STARTUP_1_10', 'SMALL_11_50', 'MEDIUM_51_200', 'LARGE_201_1000',
  'ENTERPRISE_1001_5000', 'MEGA_5000_PLUS'
];

const REQUIRED_COLUMNS = ['name', 'description', 'companyType'];
const OPTIONAL_COLUMNS = ['website', 'industry', 'city', 'state', 'employeeCount'];

interface CompanyRow {
  name: string;
  description: string;
  companyType: string;
  website?: string;
  industry?: string;
  city?: string;
  state?: string;
  employeeCount?: string;
  [key: string]: any;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface UploadResult {
  success: number;
  failed: number;
  duplicates: number;
  errors: string[];
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CompanyRow[]>([]);
  const [previewData, setPreviewData] = useState<CompanyRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    if (csvFile && csvFile.type === 'text/csv') {
      setFile(csvFile);
      parseCSV(csvFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const parseCSV = (file: File) => {
    setIsValidating(true);
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CompanyRow[];
        setCsvData(data);
        setPreviewData(data.slice(0, 10)); // Show first 10 rows
        validateData(data);
        setShowPreview(true);
        setIsValidating(false);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setIsValidating(false);
      }
    });
  };

  const validateData = (data: CompanyRow[]) => {
    const errors: ValidationError[] = [];
    
    // Check if required columns exist
    if (data.length > 0) {
      const firstRow = data[0];
      const columns = Object.keys(firstRow);
      
      for (const required of REQUIRED_COLUMNS) {
        if (!columns.includes(required)) {
          errors.push({
            row: 0,
            field: required,
            message: `Required column '${required}' is missing`
          });
        }
      }
    }

    // Validate each row
    data.forEach((row, index) => {
      // Check required fields
      if (!row.name || row.name.toString().trim() === '') {
        errors.push({
          row: index + 1,
          field: 'name',
          message: 'Name is required'
        });
      }

      if (!row.description || row.description.toString().trim() === '') {
        errors.push({
          row: index + 1,
          field: 'description',
          message: 'Description is required'
        });
      }

      if (!row.companyType || !VALID_COMPANY_TYPES.includes(row.companyType)) {
        errors.push({
          row: index + 1,
          field: 'companyType',
          message: `Invalid company type. Must be one of: ${VALID_COMPANY_TYPES.join(', ')}`
        });
      }

      // Validate optional fields if provided
      if (row.industry && !VALID_INDUSTRIES.includes(row.industry)) {
        errors.push({
          row: index + 1,
          field: 'industry',
          message: `Invalid industry. Must be one of: ${VALID_INDUSTRIES.join(', ')}`
        });
      }

      if (row.employeeCount && !VALID_EMPLOYEE_RANGES.includes(row.employeeCount)) {
        errors.push({
          row: index + 1,
          field: 'employeeCount',
          message: `Invalid employee count. Must be one of: ${VALID_EMPLOYEE_RANGES.join(', ')}`
        });
      }

      if (row.website && row.website.toString().trim() !== '' && !isValidUrl(row.website.toString())) {
        errors.push({
          row: index + 1,
          field: 'website',
          message: 'Invalid website URL format'
        });
      }
    });

    setValidationErrors(errors);
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const downloadTemplate = () => {
    const headers = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].join(',');
    const sampleRow = 'Example Corp,"Media and entertainment company",ENTERTAINMENT_MEDIA,https://example.com,ENTERTAINMENT_MEDIA,"New York",NY,MEDIUM_51_200';
    const csvContent = `${headers}\n${sampleRow}\n"Sample LLC","Digital marketing agency",INDEPENDENT_AGENCY,https://sample.com,TECHNOLOGY,"Los Angeles",CA,SMALL_11_50`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'company_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const processUpload = async () => {
    if (validationErrors.length > 0) {
      alert('Please fix validation errors before uploading');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    // Declare progressInterval outside try block
    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Simulate progress updates
      progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/admin/bulk-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companies: csvData })
      });

      if (progressInterval) clearInterval(progressInterval);
      setProcessingProgress(100);

      const result = await response.json();
      setUploadResult(result);
      
      if (result.success > 0) {
        // Reset form on success
        setTimeout(() => {
          resetForm();
        }, 5000);
      }
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      console.error('Upload error:', error);
      setUploadResult({
        success: 0,
        failed: csvData.length,
        duplicates: 0,
        errors: ['Upload failed due to server error']
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setCsvData([]);
    setPreviewData([]);
    setValidationErrors([]);
    setShowPreview(false);
    setUploadResult(null);
    setProcessingProgress(0);
  };

  return (
    <AdminPageLayout
      title="Bulk Company Upload"
      description="Upload multiple companies via CSV file"
      currentPage="Bulk Upload"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              
              {/* Template Download */}
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-blue-900">Download CSV Template</h3>
                  <p className="text-sm text-blue-700">
                    Use this template to ensure your data is formatted correctly
                  </p>
                </div>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              {/* File Drop Zone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600">Drop the CSV file here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag & drop a CSV file here, or click to select
                    </p>
                    <p className="text-sm text-gray-400">
                      CSV files only. Maximum 1000 companies per upload.
                    </p>
                  </div>
                )}
              </div>

              {file && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                    <Badge variant="secondary">{csvData.length} rows</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validation Status */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validationErrors.length === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                Validation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">{csvData.length}</div>
                    <div className="text-sm text-green-700">Total Rows</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded">
                    <div className="text-2xl font-bold text-red-600">{validationErrors.length}</div>
                    <div className="text-sm text-red-700">Errors</div>
                  </div>
                </div>

                {validationErrors.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <h4 className="font-medium text-red-900">Validation Errors:</h4>
                    {validationErrors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-400">
                        <strong>Row {error.row}, {error.field}:</strong> {error.message}
                      </div>
                    ))}
                    {validationErrors.length > 10 && (
                      <p className="text-sm text-red-600">
                        ... and {validationErrors.length - 10} more errors
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Table */}
        {showPreview && previewData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Data Preview (First 10 Rows)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Industry</th>
                      <th className="text-left p-2">Location</th>
                      <th className="text-left p-2">Website</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{row.name}</td>
                        <td className="p-2 max-w-xs truncate">{row.description}</td>
                        <td className="p-2">
                          <Badge variant={VALID_COMPANY_TYPES.includes(row.companyType) ? "default" : "destructive"}>
                            {row.companyType}
                          </Badge>
                        </td>
                        <td className="p-2">{row.industry || '-'}</td>
                        <td className="p-2">{row.city && row.state ? `${row.city}, ${row.state}` : '-'}</td>
                        <td className="p-2">
                          {row.website ? (
                            <a href={row.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {row.website.length > 30 ? `${row.website.substring(0, 30)}...` : row.website}
                            </a>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Process Upload Button */}
        {showPreview && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Ready to Upload</h3>
                  <p className="text-sm text-gray-600">
                    {validationErrors.length === 0 
                      ? `${csvData.length} companies will be uploaded`
                      : `Please fix ${validationErrors.length} errors before uploading`
                    }
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetForm} disabled={isProcessing}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button 
                    onClick={processUpload} 
                    disabled={validationErrors.length > 0 || isProcessing}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Upload Companies'}
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Processing companies...</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload Results */}
        {uploadResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Upload Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">{uploadResult.success}</div>
                  <div className="text-sm text-green-700">Successful</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded">
                  <div className="text-2xl font-bold text-red-600">{uploadResult.failed}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded">
                  <div className="text-2xl font-bold text-yellow-600">{uploadResult.duplicates}</div>
                  <div className="text-sm text-yellow-700">Duplicates Skipped</div>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-900">Errors:</h4>
                  {uploadResult.errors.map((error, index) => (
                    <div key={index} className="text-sm bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button onClick={resetForm}>
                  Upload Another File
                </Button>
                <Button variant="outline" asChild>
                  <a href="/admin/orgs/companies">
                    View Companies
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminPageLayout>
  );
} 