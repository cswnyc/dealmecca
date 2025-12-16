// 🚀 DealMecca Bulk Import Progress Tracker Component
// Real-time progress visualization with detailed phase tracking

'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Upload, 
  Database, 
  Users, 
  Building,
  TrendingUp,
  Timer,
  Activity
} from 'lucide-react';

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

interface ProgressTrackerProps {
  progress: ImportProgress;
  isActive?: boolean;
}

export default function ProgressTracker({ progress, isActive = false }: ProgressTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isActive || !progress.startTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - progress.startTime!);
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, progress.startTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getPhaseStatus = (phase: string) => {
    if (!progress.phase) return 'pending';
    
    const phases = ['uploading', 'parsing', 'validating', 'importing_companies', 'importing_contacts', 'finalizing'];
    const currentIndex = phases.indexOf(progress.phase);
    const phaseIndex = phases.indexOf(phase);
    
    if (phaseIndex < currentIndex) return 'completed';
    if (phaseIndex === currentIndex) return progress.status === 'failed' ? 'failed' : 'active';
    return 'pending';
  };

  const getProgressPercentage = () => {
    if (progress.total === 0) return 0;
    return Math.round((progress.processed / progress.total) * 100);
  };

  const getSuccessRate = () => {
    if (progress.processed === 0) return 100;
    return Math.round((progress.successful / progress.processed) * 100);
  };

  const phases = [
    {
      id: 'uploading',
      name: 'File Upload',
      icon: Upload,
      description: 'Uploading and reading file'
    },
    {
      id: 'parsing',
      name: 'Data Parsing',
      icon: Activity,
      description: 'Extracting companies and contacts'
    },
    {
      id: 'validating',
      name: 'Validation',
      icon: CheckCircle,
      description: 'Checking data quality and formats'
    },
    {
      id: 'importing_companies',
      name: 'Import Companies',
      icon: Building,
      description: 'Creating and updating company records'
    },
    {
      id: 'importing_contacts',
      name: 'Import Contacts',
      icon: Users,
      description: 'Creating and updating contact records'
    },
    {
      id: 'finalizing',
      name: 'Finalizing',
      icon: TrendingUp,
      description: 'Completing import and generating summary'
    }
  ];

  return (
    <div className="bg-white border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <span>Import Progress</span>
        </h3>
        
        {isActive && (
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Timer className="w-4 h-4" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
            {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(progress.estimatedTimeRemaining)} remaining</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            {progress.status === 'completed' 
              ? 'Import Complete!' 
              : progress.status === 'failed'
                ? 'Import Failed'
                : progress.currentOperation || 'Processing...'
            }
          </span>
          <span className="text-muted-foreground">
            {progress.processed} / {progress.total} ({getProgressPercentage()}%)
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              progress.status === 'failed' 
                ? 'bg-red-500' 
                : progress.status === 'completed'
                  ? 'bg-green-500'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          >
            {isActive && progress.status === 'processing' && (
              <div className="h-full w-full bg-white bg-opacity-30 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      {progress.processed > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-900">{progress.processed}</p>
            <p className="text-xs text-blue-700">Processed</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-900">{progress.successful}</p>
            <p className="text-xs text-green-700">Successful</p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-900">{progress.failed}</p>
            <p className="text-xs text-red-700">Failed</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-900">{getSuccessRate()}%</p>
            <p className="text-xs text-purple-700">Success Rate</p>
          </div>
        </div>
      )}

      {/* Phase Progress */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Import Phases</h4>
        
        <div className="space-y-2">
          {phases.map((phase, index) => {
            const status = getPhaseStatus(phase.id);
            const IconComponent = phase.icon;
            
            return (
              <div key={phase.id} className="flex items-center space-x-3">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  ${status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : status === 'active'
                      ? 'bg-blue-500 text-white'
                      : status === 'failed'
                        ? 'bg-red-500 text-white'
                        : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : status === 'failed' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <IconComponent className={`w-4 h-4 ${status === 'active' && isActive ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      status === 'active' ? 'text-blue-900' : 
                      status === 'completed' ? 'text-green-900' :
                      status === 'failed' ? 'text-red-900' : 'text-muted-foreground'
                    }`}>
                      {phase.name}
                    </p>
                    
                    {status === 'active' && isActive && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-blue-600">Active</span>
                      </div>
                    )}
                    
                    {status === 'completed' && (
                      <span className="text-xs text-green-600">✓ Complete</span>
                    )}
                    
                    {status === 'failed' && (
                      <span className="text-xs text-red-600">✗ Failed</span>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{phase.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Operation Details */}
      {isActive && progress.currentOperation && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-sm font-medium text-blue-900">Current Operation</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">{progress.currentOperation}</p>
          
          {progress.phase === 'importing_companies' || progress.phase === 'importing_contacts' ? (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-blue-600 mb-1">
                <span>Processing batch</span>
                <span>{Math.min(progress.processed + 50, progress.total)} / {progress.total}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(Math.min(progress.processed + 50, progress.total) / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Error Summary */}
      {progress.errors.length > 0 && (
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-900">Errors Encountered</span>
          </div>
          
          <div className="space-y-1">
            {progress.errors.slice(0, 3).map((error, index) => (
              <p key={index} className="text-xs text-red-700">
                • {typeof error === 'string' ? error : error.message || 'Unknown error'}
              </p>
            ))}
            {progress.errors.length > 3 && (
              <p className="text-xs text-red-600">
                ... and {progress.errors.length - 3} more errors
              </p>
            )}
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div className={`
        text-center p-3 rounded-lg text-sm font-medium
        ${progress.status === 'completed' 
          ? 'bg-green-100 text-green-800' 
          : progress.status === 'failed'
            ? 'bg-red-100 text-red-800'
            : progress.status === 'processing'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-muted text-muted-foreground'
        }
      `}>
        {progress.status === 'completed' && '🎉 Import completed successfully!'}
        {progress.status === 'failed' && '❌ Import failed - please review errors'}
        {progress.status === 'processing' && '⚡ Import in progress...'}
        {progress.status === 'pending' && '⏳ Waiting to start...'}
      </div>
    </div>
  );
}
