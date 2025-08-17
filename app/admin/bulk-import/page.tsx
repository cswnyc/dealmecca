// 🚀 DealMecca Bulk Import Main Page
// Complete workflow orchestration for scaling from 17 to 5000+ companies

'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, Database, Upload, FileText, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FileUploader from './components/FileUploader';
import DataPreview from './components/DataPreview';
import ProgressTracker from './components/ProgressTracker';
import ImportResults from './components/ImportResults';

// Types for the import workflow
interface ImportStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface ParsedData {
  companies: any[];
  contacts: any[];
  preview: any[];
  summary: {
    totalCompanies: number;
    totalContacts: number;
    errors: number;
    validationErrors: any[];
    counts: {
      totalCompanies: number;
      totalContacts: number;
      totalErrors: number;
      criticalErrors: number;
      warnings: number;
    };
    quality: {
      overall: number;
      companies: number;
      contacts: number;
      mediaRelevance: number;
      completeness: number;
    };
    mediaSellerStats: {
      totalContacts: number;
      highValueContacts: number;
      cLevelContacts: number;
      decisionMakers: number;
      contactsWithEmail: number;
      contactsWithPhone: number;
      contactsWithLinkedIn: number;
    };
    readyForImport: boolean;
  };
}

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: any[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  phase?: 'uploading' | 'parsing' | 'validating' | 'importing_companies' | 'importing_contacts' | 'finalizing';
  currentOperation?: string;
  estimatedTimeRemaining?: number;
  startTime?: number;
}

interface ImportResultsData {
  success: boolean;
  results: {
    companiesCreated: number;
    companiesUpdated: number;
    companiesSkipped: number;
    contactsCreated: number;
    contactsUpdated: number;
    contactsSkipped: number;
    errors: string[];
    warnings: string[];
    processedAt: string;
    executionTime: number;
    uploadId: string;
    summary: {
      successRate: number;
      totalProcessed: number;
      successfulOperations: number;
      failedOperations: number;
      warningCount: number;
      executionTimeMs: number;
      executionTimeFormatted: string;
    };
  };
}

export default function BulkImportPage() {
  // State management
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'importing' | 'results'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [importResults, setImportResults] = useState<ImportResultsData | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [],
    status: 'pending'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Step definitions
  const steps: ImportStep[] = [
    {
      id: 'upload',
      label: 'Upload File',
      description: 'Select and upload your data file',
      icon: Upload,
      status: currentStep === 'upload' ? 'active' : 
             ['preview', 'importing', 'results'].includes(currentStep) ? 'completed' : 'pending'
    },
    {
      id: 'preview',
      label: 'Review Data',
      description: 'Validate and preview import data',
      icon: FileText,
      status: currentStep === 'preview' ? 'active' :
             ['importing', 'results'].includes(currentStep) ? 'completed' :
             currentStep === 'upload' ? 'pending' : 'pending'
    },
    {
      id: 'importing',
      label: 'Import',
      description: 'Process and import data',
      icon: Database,
      status: currentStep === 'importing' ? 'active' :
             currentStep === 'results' ? 'completed' : 'pending'
    },
    {
      id: 'results',
      label: 'Complete',
      description: 'View import results',
      icon: CheckCircle,
      status: currentStep === 'results' ? 'completed' : 'pending'
    }
  ];

  // Enhanced data processing for our API structure
  const enhanceApiData = (apiData: any): ParsedData => {
    const { companies, contacts, preview, summary } = apiData;
    
    // Calculate enhanced statistics
    const mediaSellerStats = {
      totalContacts: contacts.length,
      highValueContacts: contacts.filter((c: any) => 
        ['CMO', 'Media Director', 'Brand Manager', 'Group Agency Director'].some(role => 
          c.title?.toLowerCase().includes(role.toLowerCase())
        )
      ).length,
      cLevelContacts: contacts.filter((c: any) => 
        c.title?.toLowerCase().includes('cmo') || 
        c.title?.toLowerCase().includes('chief')
      ).length,
      decisionMakers: contacts.filter((c: any) => 
        ['director', 'manager', 'head', 'vp', 'vice president', 'chief'].some(title => 
          c.title?.toLowerCase().includes(title)
        )
      ).length,
      contactsWithEmail: contacts.filter((c: any) => c.email).length,
      contactsWithPhone: contacts.filter((c: any) => c.phone).length,
      contactsWithLinkedIn: contacts.filter((c: any) => c.linkedinUrl).length,
    };

    // Calculate quality scores
    const companyCompleteness = companies.length > 0 ? 
      companies.reduce((acc: number, c: any) => {
        let score = 0;
        if (c.name) score += 25;
        if (c.domain) score += 25;
        if (c.industry) score += 25;
        if (c.employeeCount || c.headquarters) score += 25;
        return acc + score;
      }, 0) / companies.length : 0;

    const contactCompleteness = contacts.length > 0 ? 
      contacts.reduce((acc: number, c: any) => {
        let score = 0;
        if (c.firstName && c.lastName) score += 30;
        if (c.email) score += 25;
        if (c.title) score += 25;
        if (c.phone || c.linkedinUrl) score += 20;
        return acc + score;
      }, 0) / contacts.length : 0;

    const mediaRelevance = contacts.length > 0 ? 
      (mediaSellerStats.highValueContacts / contacts.length) * 100 : 0;

    const overall = Math.round((companyCompleteness + contactCompleteness + mediaRelevance) / 3);

    const validationErrors = summary.validationErrors || [];
    const errorCounts = {
      totalCompanies: companies.length,
      totalContacts: contacts.length,
      totalErrors: validationErrors.length,
      criticalErrors: validationErrors.filter((e: any) => 
        e.message.includes('required') || e.message.includes('invalid')
      ).length,
      warnings: validationErrors.filter((e: any) => 
        !e.message.includes('required') && !e.message.includes('invalid')
      ).length,
    };

    return {
      companies,
      contacts,
      preview,
      summary: {
        ...summary,
        counts: errorCounts,
        quality: {
          overall,
          companies: Math.round(companyCompleteness),
          contacts: Math.round(contactCompleteness),
          mediaRelevance: Math.round(mediaRelevance),
          completeness: Math.round((contactCompleteness + companyCompleteness) / 2)
        },
        mediaSellerStats,
        readyForImport: errorCounts.criticalErrors === 0
      }
    };
  };

  // File upload handler
  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/bulk-import/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        const enhancedData = enhanceApiData(result.data);
        setParsedData(enhancedData);
        setCurrentStep('preview');
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear file handler
  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setParsedData(null);
    setError(null);
  }, []);

  // Import confirmation handler with progress tracking
  const handleConfirmImport = useCallback(async () => {
    if (!parsedData) return;
    
    setCurrentStep('importing');
    setError(null);
    
    const startTime = Date.now();
    const totalOperations = parsedData.companies.length + parsedData.contacts.length;
    
    // Initialize progress
    setImportProgress({
      total: totalOperations,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      status: 'processing',
      phase: 'importing_companies',
      currentOperation: 'Starting import process...',
      startTime,
      estimatedTimeRemaining: totalOperations * 50 // Rough estimate
    });
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev.status !== 'processing') return prev;
          
          const newProcessed = Math.min(prev.processed + Math.random() * 5, prev.total);
          const elapsed = Date.now() - startTime;
          const rate = newProcessed / elapsed * 1000; // operations per second
          const remaining = prev.total - newProcessed;
          const estimatedTimeRemaining = rate > 0 ? (remaining / rate) * 1000 : 0;
          
          let phase = prev.phase;
          let currentOperation = prev.currentOperation;
          
          if (newProcessed < parsedData.companies.length) {
            phase = 'importing_companies';
            currentOperation = `Importing company ${Math.floor(newProcessed) + 1} of ${parsedData.companies.length}...`;
          } else if (newProcessed < totalOperations) {
            phase = 'importing_contacts';
            const contactIndex = Math.floor(newProcessed - parsedData.companies.length) + 1;
            currentOperation = `Importing contact ${contactIndex} of ${parsedData.contacts.length}...`;
          } else {
            phase = 'finalizing';
            currentOperation = 'Finalizing import and generating summary...';
          }
          
          return {
            ...prev,
            processed: newProcessed,
            successful: Math.floor(newProcessed * 0.95), // Assume 95% success rate
            failed: Math.floor(newProcessed * 0.05),
            phase,
            currentOperation,
            estimatedTimeRemaining
          };
        });
      }, 200);

      const response = await fetch('/api/admin/bulk-import/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companies: parsedData.companies,
          contacts: parsedData.contacts,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Import failed: ${response.statusText}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      if (result.success) {
        // Calculate enhanced results
        const totalProcessed = result.results.companiesCreated + result.results.companiesUpdated + 
                              result.results.contactsCreated + result.results.contactsUpdated;
        const successfulOps = result.results.companiesCreated + result.results.companiesUpdated + 
                             result.results.contactsCreated + result.results.contactsUpdated;
        const failedOps = (result.results.errors || []).length;
        const successRate = totalProcessed > 0 ? Math.round((successfulOps / totalProcessed) * 100) : 100;

        const enhancedResults: ImportResultsData = {
          success: true,
          results: {
            ...result.results,
            companiesSkipped: 0, // API doesn't return this yet
            contactsSkipped: 0,  // API doesn't return this yet
            errors: result.results.errors || [], // Ensure errors is always an array
            warnings: result.results.warnings || [], // Ensure warnings is always an array
            processedAt: new Date().toISOString(),
            executionTime: processingTime,
            uploadId: `IMP-${Date.now()}`,
            // Import summary statistics
            summary: {
              successRate,
              totalProcessed,
              successfulOperations: successfulOps,
              failedOperations: failedOps,
              warningCount: 0,
              executionTimeMs: processingTime,
              executionTimeFormatted: processingTime > 60000 ? 
                `${Math.floor(processingTime / 60000)}m ${Math.floor((processingTime % 60000) / 1000)}s` :
                `${Math.floor(processingTime / 1000)}s`
            }
          }
        };

        setImportResults(enhancedResults);
        setImportProgress(prev => ({
          ...prev,
          processed: prev.total,
          status: 'completed',
          phase: 'finalizing',
          currentOperation: 'Import completed successfully!'
        }));
        setCurrentStep('results');
      } else {
        setError(result.error || 'Import failed');
        setImportProgress(prev => ({
          ...prev,
          status: 'failed',
          errors: [result.error || 'Import failed']
        }));
        setCurrentStep('preview');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Import failed. Please try again.';
      setError(errorMessage);
      setImportProgress(prev => ({
        ...prev,
        status: 'failed',
        errors: [errorMessage]
      }));
      setCurrentStep('preview');
    }
  }, [parsedData]);

  // Reset handler
  const handleStartNewImport = useCallback(() => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setParsedData(null);
    setImportResults(null);
    setImportProgress({
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      status: 'pending'
    });
    setIsLoading(false);
    setError(null);
  }, []);

  // Navigate to view imported data
  const handleViewData = useCallback(() => {
    router.push('/admin/companies');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/admin"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Admin</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🚀 Bulk Data Import</h1>
              <p className="text-lg text-gray-600 mt-1">
                Scale from 17 to 5000+ companies with intelligent media seller targeting
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>📊 CSV, Excel & JSON Support</span>
                <span>•</span>
                <span>🎯 Media Seller Intelligence</span>
                <span>•</span>
                <span>⚡ Batch Processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === steps.length - 1;
                
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex items-center">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${step.status === 'completed' ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200' :
                          step.status === 'active' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 animate-pulse' :
                          step.status === 'error' ? 'bg-red-500 border-red-500 text-white' :
                          'bg-gray-100 border-gray-300 text-gray-400'}
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium transition-colors ${
                          step.status === 'active' ? 'text-blue-600' :
                          step.status === 'completed' ? 'text-green-600' :
                          'text-gray-500'
                        }`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-gray-400">{step.description}</p>
                      </div>
                    </div>
                    
                    {!isLast && (
                      <div className={`flex-1 h-0.5 mx-4 transition-all duration-500 ${
                        step.status === 'completed' ? 'bg-gradient-to-r from-green-300 to-green-400' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 animate-in slide-in-from-top duration-200">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Import Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {currentStep === 'upload' && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  📤 Upload Company & Contact Data
                </h2>
                <p className="text-gray-600">
                  Import CSV, Excel, or JSON files with companies and media seller contacts
                </p>
              </div>
              <FileUploader 
                onFileSelect={handleFileSelect} 
                isLoading={isLoading}
                selectedFile={selectedFile}
                onClearFile={handleClearFile}
              />
            </div>
          )}

          {currentStep === 'preview' && parsedData && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  📋 Review & Validate Data
                </h2>
                <p className="text-gray-600">
                  Review parsed data quality and confirm import settings
                </p>
              </div>
              <DataPreview
                data={parsedData}
                onConfirmImport={handleConfirmImport}
                isImporting={false}
              />
            </div>
          )}

          {currentStep === 'importing' && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  ⚡ Processing Import...
                </h2>
                <p className="text-gray-600">
                  Importing companies and contacts into DealMecca
                </p>
              </div>
              <ProgressTracker
                progress={importProgress}
                isActive={true}
              />
            </div>
          )}

          {currentStep === 'results' && importResults && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  🎉 Import Complete
                </h2>
                <p className="text-gray-600">
                  Your data has been successfully imported into DealMecca
                </p>
              </div>
              <ImportResults
                results={importResults}
                onStartNewImport={handleStartNewImport}
                onViewData={handleViewData}
              />
            </div>
          )}
        </div>

        {/* Quick Stats Bar */}
        {parsedData && currentStep === 'preview' && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                  <p className="text-2xl font-bold text-blue-600">{parsedData.summary.totalCompanies}</p>
                </div>
                <p className="text-sm text-blue-800 font-medium">Companies</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-2xl font-bold text-green-600">{parsedData.summary.totalContacts}</p>
                </div>
                <p className="text-sm text-green-800 font-medium">Contacts</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    {parsedData.summary.mediaSellerStats?.highValueContacts || 0}
                  </p>
                </div>
                <p className="text-sm text-purple-800 font-medium">High-Value Targets</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-500 mr-2" />
                  <p className="text-2xl font-bold text-orange-600">{parsedData.summary.quality.overall}%</p>
                </div>
                <p className="text-sm text-orange-800 font-medium">Quality Score</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className={`w-5 h-5 mr-2 ${parsedData.summary.readyForImport ? 'text-green-500' : 'text-yellow-500'}`} />
                  <p className={`text-2xl font-bold ${parsedData.summary.readyForImport ? 'text-green-600' : 'text-yellow-600'}`}>
                    {parsedData.summary.readyForImport ? '✓' : '⚠'}
                  </p>
                </div>
                <p className={`text-sm font-medium ${parsedData.summary.readyForImport ? 'text-green-800' : 'text-yellow-800'}`}>
                  {parsedData.summary.readyForImport ? 'Ready' : 'Review Needed'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
