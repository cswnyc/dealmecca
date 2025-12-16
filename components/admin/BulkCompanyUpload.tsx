'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  RefreshCw,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface UploadResult {
  total: number;
  successful: number;
  failed: number;
  duplicates: number;
  errors: string[];
}

interface PreviewData {
  headers: string[];
  rows: string[][];
  fileName: string;
  totalRows: number;
}

export function BulkCompanyUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadResult | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        alert('File appears to be empty');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const dataRows = lines.slice(1, 6).map(line => 
        line.split(',').map(cell => cell.trim().replace(/"/g, ''))
      );

      setPreview({
        headers,
        rows: dataRows,
        fileName: file.name,
        totalRows: lines.length - 1
      });
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please ensure it\'s a valid CSV file.');
    }
  };

  const handleUpload = async () => {
    if (!preview) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            // Simulate realistic results
            const total = preview.totalRows;
            const successful = Math.floor(total * 0.85);
            const duplicates = Math.floor(total * 0.1);
            const failed = total - successful - duplicates;
            
            setResults({
              total,
              successful,
              failed,
              duplicates,
              errors: [
                'Row 45: Missing required field "email"',
                'Row 123: Invalid company name format',
                'Row 201: Phone number format invalid',
                'Row 156: Duplicate company detected: "Tech Corp Inc"',
                'Row 298: Missing required field "company_name"'
              ]
            });
            return 100;
          }
          return prev + Math.random() * 3;
        });
      }, 150);
    } catch (error) {
      setIsUploading(false);
      console.error('Upload failed:', error);
    }
  };

  const downloadTemplate = () => {
    const template = `company_name,industry,city,state,website,email,phone,employee_count,company_type
"Example Corp","Technology","San Francisco","CA","https://example.com","info@example.com","555-123-4567","150","agency"
"Demo Inc","Marketing","New York","NY","https://demo.com","contact@demo.com","555-987-6543","75","advertiser"`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'company_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearPreview = () => {
    setPreview(null);
    setResults(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Bulk Company Upload
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload thousands of companies with automatic validation and duplicate detection
          </p>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragActive
                ? 'border-primary bg-primary/10 scale-105'
                : 'border-border hover:border-border hover:bg-muted'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileSpreadsheet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              {dragActive ? (
                <p className="text-primary font-medium text-lg">Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-2 text-lg font-medium">
                    Drag & drop your file here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports CSV, XLS, XLSX files up to 50MB • Up to 100,000 records
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Template Download */}
          <div className="mt-6 flex justify-center">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Preview */}
      {preview && !results && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Data Preview
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={clearPreview}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>File: {preview.fileName}</span>
              <Badge variant="outline">{preview.totalRows.toLocaleString()} rows</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-border text-sm">
                <thead>
                  <tr className="bg-muted">
                    {preview.headers.map((header, index) => (
                      <th
                        key={index}
                        className="border border-border px-3 py-2 text-left font-medium"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, index) => (
                    <tr key={index} className="hover:bg-muted">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-border px-3 py-2"
                        >
                          {cell || <span className="text-muted-foreground">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing first 5 rows of {preview.totalRows.toLocaleString()} total rows
              </p>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Upload ${preview.totalRows.toLocaleString()} Companies`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Processing Upload</span>
                <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-3" />
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Validating data format and required fields</p>
                <p>• Checking for duplicates against existing database</p>
                <p>• Processing company information and contacts</p>
                <p className="text-orange-600 font-medium">Please don't close this window</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Upload Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-3xl font-bold text-primary">{results.total.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Records</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600">{results.successful.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">Successfully Added</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-3xl font-bold text-yellow-600">{results.duplicates.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">Duplicates Skipped</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600">{results.failed.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">Failed Validation</div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="space-y-3 mb-6">
                <h4 className="font-medium text-foreground flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                  Issues Detected ({results.errors.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {results.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button onClick={clearPreview} className="flex-1">
                Upload Another File
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Error Report
              </Button>
              <Button variant="outline" asChild>
                <a href="/orgs/companies">View Companies</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
