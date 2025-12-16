// 🚀 DealMecca Bulk Import Results Component
// Comprehensive results display with actionable insights and next steps

'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  Eye,
  Users, 
  Building,
  Crown,
  Award,
  Mail,
  Phone,
  Linkedin,
  ExternalLink,
  RefreshCw,
  FileText,
  BarChart3
} from 'lucide-react';

interface ImportResultsProps {
  results: {
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
  };
  onStartNewImport: () => void;
  onViewData?: () => void;
}

export default function ImportResults({ results, onStartNewImport, onViewData }: ImportResultsProps) {
  const [showErrors, setShowErrors] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);

  const { results: importResults } = results;
  const { summary } = importResults;

  const totalCompanies = importResults.companiesCreated + importResults.companiesUpdated + importResults.companiesSkipped;
  const totalContacts = importResults.contactsCreated + importResults.contactsUpdated + importResults.contactsSkipped;

  const getSuccessLevel = () => {
    if (summary.successRate >= 95) return 'excellent';
    if (summary.successRate >= 80) return 'good';
    if (summary.successRate >= 60) return 'fair';
    return 'poor';
  };

  const successLevel = getSuccessLevel();
  const isSuccess = results.success && summary.successRate >= 80;

  return (
    <div className="space-y-6">
      {/* Success/Failure Header */}
      <div className={`
        border rounded-lg p-6 text-center
        ${isSuccess 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
        }
      `}>
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <CheckCircle className="w-16 h-16 text-green-500" />
          ) : (
            <AlertTriangle className="w-16 h-16 text-red-500" />
          )}
        </div>
        
        <h2 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-green-900' : 'text-red-900'}`}>
          {isSuccess 
            ? '🎉 Import Completed Successfully!' 
            : '⚠️ Import Completed with Issues'
          }
        </h2>
        
        <p className={`text-lg ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
          {summary.successfulOperations} of {summary.totalProcessed} operations successful 
          ({summary.successRate}% success rate)
        </p>
        
        <p className="text-sm text-muted-foreground mt-2">
          Completed in {summary.executionTimeFormatted} • {new Date(importResults.processedAt).toLocaleString()}
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Building className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{totalCompanies}</p>
              <p className="text-sm text-muted-foreground">Companies Processed</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {importResults.companiesCreated} new • {importResults.companiesUpdated} updated
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{totalContacts}</p>
              <p className="text-sm text-muted-foreground">Contacts Processed</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {importResults.contactsCreated} new • {importResults.contactsUpdated} updated
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className={`w-8 h-8 ${
              successLevel === 'excellent' ? 'text-green-500' :
              successLevel === 'good' ? 'text-blue-500' :
              successLevel === 'fair' ? 'text-yellow-500' : 'text-red-500'
            }`} />
            <div>
              <p className="text-2xl font-bold text-foreground">{summary.successRate}%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
          <div className={`mt-2 text-xs ${
            successLevel === 'excellent' ? 'text-green-600' :
            successLevel === 'good' ? 'text-blue-600' :
            successLevel === 'fair' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {successLevel === 'excellent' && '🏆 Excellent'}
            {successLevel === 'good' && '✅ Good'}
            {successLevel === 'fair' && '⚠️ Fair'}
            {successLevel === 'poor' && '❌ Needs Review'}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{summary.failedOperations}</p>
              <p className="text-sm text-muted-foreground">Issues</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {importResults.errors.length} errors • {importResults.warnings.length} warnings
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">📊 Import Breakdown</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Companies */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
              <Building className="w-5 h-5 text-blue-500" />
              <span>Companies ({totalCompanies})</span>
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm text-green-900">✅ Created</span>
                <span className="font-medium text-green-900">{importResults.companiesCreated}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-sm text-blue-900">🔄 Updated</span>
                <span className="font-medium text-blue-900">{importResults.companiesUpdated}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm text-foreground">⏭️ Skipped</span>
                <span className="font-medium text-foreground">{importResults.companiesSkipped}</span>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <span>Contacts ({totalContacts})</span>
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm text-green-900">✅ Created</span>
                <span className="font-medium text-green-900">{importResults.contactsCreated}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-sm text-blue-900">🔄 Updated</span>
                <span className="font-medium text-blue-900">{importResults.contactsUpdated}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm text-foreground">⏭️ Skipped</span>
                <span className="font-medium text-foreground">{importResults.contactsSkipped}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Errors Section */}
      {importResults.errors.length > 0 && (
        <div className="bg-white border rounded-lg">
          <button
            onClick={() => setShowErrors(!showErrors)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-muted transition-colors"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>❌ Errors ({importResults.errors.length})</span>
            </h3>
            <span className="text-muted-foreground">
              {showErrors ? '−' : '+'}
            </span>
          </button>
          
          {showErrors && (
            <div className="px-6 pb-6 space-y-2">
              {importResults.errors.map((error, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Warnings Section */}
      {importResults.warnings.length > 0 && (
        <div className="bg-white border rounded-lg">
          <button
            onClick={() => setShowWarnings(!showWarnings)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-muted transition-colors"
          >
            <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span>⚠️ Warnings ({importResults.warnings.length})</span>
            </h3>
            <span className="text-muted-foreground">
              {showWarnings ? '−' : '+'}
            </span>
          </button>
          
          {showWarnings && (
            <div className="px-6 pb-6 space-y-2">
              {importResults.warnings.map((warning, index) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                  {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">🚀 Next Steps</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={onStartNewImport}
            className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-input rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <RefreshCw className="w-5 h-5 text-muted-foreground group-hover:text-blue-500" />
            <span className="font-medium text-muted-foreground group-hover:text-blue-900">
              Import More Data
            </span>
          </button>

          {onViewData && (
            <button
              onClick={onViewData}
              className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span className="font-medium">View Imported Data</span>
            </button>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="font-medium text-foreground mb-2">Recommended Actions:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {isSuccess ? (
              <>
                <li>✅ Review newly imported contacts for outreach opportunities</li>
                <li>🎯 Set up campaigns targeting high-value media seller contacts</li>
                <li>📧 Configure automated follow-up sequences</li>
                <li>📊 Monitor contact engagement and conversion metrics</li>
              </>
            ) : (
              <>
                <li>🔍 Review and fix data validation errors before next import</li>
                <li>📝 Update data source to include missing required fields</li>
                <li>🧹 Clean duplicate records in your source data</li>
                <li>📋 Consider using our data template for optimal results</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Import Summary Footer */}
      <div className="bg-muted rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Import ID: <code className="bg-white px-2 py-1 rounded text-xs">{importResults.uploadId}</code>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Keep this ID for support reference if needed
        </p>
      </div>
    </div>
  );
}
