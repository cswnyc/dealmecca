// 🚀 DealMecca Bulk Import Data Preview Component
// Interactive preview of parsed data with validation results and media seller analysis

'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Building, 
  Target,
  Eye,
  EyeOff,
  TrendingUp,
  Mail,
  Phone,
  Linkedin,
  Crown,
  Award
} from 'lucide-react';

interface DataPreviewProps {
  data: {
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
  };
  onConfirmImport: () => void;
  isImporting?: boolean;
}

export default function DataPreview({ data, onConfirmImport, isImporting = false }: DataPreviewProps) {
  const [showErrors, setShowErrors] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showMediaStats, setShowMediaStats] = useState(true);

  const { summary, preview } = data;
  const { counts, quality, mediaSellerStats } = summary;
  const hasErrors = counts.totalErrors > 0;
  const hasCriticalErrors = counts.criticalErrors > 0;
  const canImport = summary.readyForImport && !hasCriticalErrors;

  // Calculate quality color classes
  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Import Status Banner */}
      <div className={`
        border rounded-lg p-4 ${canImport 
          ? 'bg-green-50 border-green-200' 
          : hasCriticalErrors 
            ? 'bg-red-50 border-red-200'
            : 'bg-yellow-50 border-yellow-200'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {canImport ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : hasCriticalErrors ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            )}
            
            <div>
              <p className={`font-medium ${canImport ? 'text-green-900' : hasCriticalErrors ? 'text-red-900' : 'text-yellow-900'}`}>
                {canImport 
                  ? '✅ Ready for Import' 
                  : hasCriticalErrors 
                    ? '❌ Critical Errors Found'
                    : '⚠️ Warnings Detected'
                }
              </p>
              <p className={`text-sm ${canImport ? 'text-green-700' : hasCriticalErrors ? 'text-red-700' : 'text-yellow-700'}`}>
                {canImport 
                  ? `${counts.totalCompanies} companies and ${counts.totalContacts} contacts ready to import`
                  : hasCriticalErrors
                    ? `${counts.criticalErrors} critical errors must be fixed before import`
                    : `${counts.warnings} warnings found - review recommended but import possible`
                }
              </p>
            </div>
          </div>

          {canImport && (
            <button
              onClick={onConfirmImport}
              disabled={isImporting}
              className={`
                px-6 py-2 bg-green-600 text-white rounded-lg font-medium transition-colors
                ${isImporting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                }
              `}
            >
              {isImporting ? 'Importing...' : 'Import Data'}
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Building className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.totalCompanies}</p>
              <p className="text-sm text-gray-500">Companies</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.totalContacts}</p>
              <p className="text-sm text-gray-500">Contacts</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{mediaSellerStats.highValueContacts}</p>
              <p className="text-sm text-gray-500">High-Value Targets</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            {hasErrors ? (
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-500" />
            )}
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.totalErrors}</p>
              <p className="text-sm text-gray-500">
                {hasErrors ? 'Issues Found' : 'All Good'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Assessment */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Data Quality Assessment</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries({
            'Overall': quality.overall,
            'Companies': quality.companies,
            'Contacts': quality.contacts,
            'Media Relevance': quality.mediaRelevance,
            'Completeness': quality.completeness
          }).map(([label, score]) => (
            <div key={label} className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${getQualityColor(score)}`}>
                {score}
              </div>
              <p className="text-sm text-gray-600 mt-2">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Media Seller Statistics */}
      <div className="bg-white border rounded-lg">
        <button
          onClick={() => setShowMediaStats(!showMediaStats)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span>🎯 Media Seller Analysis</span>
          </h3>
          {showMediaStats ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        
        {showMediaStats && (
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Crown className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-lg font-bold text-purple-900">{mediaSellerStats.cLevelContacts}</p>
                  <p className="text-xs text-purple-700">C-Level Executives</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Award className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-lg font-bold text-green-900">{mediaSellerStats.decisionMakers}</p>
                  <p className="text-xs text-green-700">Decision Makers</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-lg font-bold text-blue-900">{mediaSellerStats.contactsWithEmail}</p>
                  <p className="text-xs text-blue-700">With Email</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <Phone className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-lg font-bold text-orange-900">{mediaSellerStats.contactsWithPhone}</p>
                  <p className="text-xs text-orange-700">With Phone</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Contact Completeness</span>
                <span className="text-sm text-gray-600">
                  {Math.round((mediaSellerStats.contactsWithEmail + mediaSellerStats.contactsWithPhone + mediaSellerStats.contactsWithLinkedIn) / (mediaSellerStats.totalContacts * 3) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(mediaSellerStats.contactsWithEmail + mediaSellerStats.contactsWithPhone + mediaSellerStats.contactsWithLinkedIn) / (mediaSellerStats.totalContacts * 3) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Preview */}
      <div className="bg-white border rounded-lg">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            {showPreview ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            <span>📋 Data Preview ({preview.length} sample rows)</span>
          </h3>
          {showPreview ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        
        {showPreview && preview.length > 0 && (
          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {Object.keys(preview[0]).slice(0, 8).map((key) => (
                      <th key={key} className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-50">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      {Object.values(row).slice(0, 8).map((value: any, cellIndex) => (
                        <td key={cellIndex} className="py-2 px-3 text-gray-900">
                          {String(value).length > 30 
                            ? String(value).substring(0, 30) + '...' 
                            : String(value) || '-'
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > 5 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                ... and {preview.length - 5} more rows
              </p>
            )}
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {hasErrors && (
        <div className="bg-white border rounded-lg">
          <button
            onClick={() => setShowErrors(!showErrors)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span>⚠️ Validation Issues ({counts.totalErrors})</span>
            </h3>
            {showErrors ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          
          {showErrors && (
            <div className="px-6 pb-6 space-y-3">
              {summary.validationErrors.slice(0, 20).map((error, index) => (
                <div key={index} className={`
                  p-3 rounded-lg border-l-4 
                  ${error.message.includes('required') 
                    ? 'bg-red-50 border-red-400 text-red-700' 
                    : 'bg-yellow-50 border-yellow-400 text-yellow-700'
                  }
                `}>
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-sm">Row {error.row}:</span>
                    <span className="text-sm">{error.message}</span>
                  </div>
                  {error.value && (
                    <p className="text-xs mt-1 opacity-75">Value: "{error.value}"</p>
                  )}
                </div>
              ))}
              {summary.validationErrors.length > 20 && (
                <p className="text-sm text-gray-500 text-center">
                  ... and {summary.validationErrors.length - 20} more issues
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
