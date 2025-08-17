// 🚀 DealMecca Bulk Import File Uploader Component
// Beautiful drag & drop interface for uploading CSV, Excel, and JSON files

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle, CheckCircle, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  selectedFile?: File | null;
  onClearFile?: () => void;
}

export default function FileUploader({ 
  onFileSelect, 
  isLoading = false,
  selectedFile = null,
  onClearFile
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('🔄 File drop event:', { acceptedFiles, rejectedFiles });
    if (rejectedFiles.length > 0) {
      // Handle rejected files
      const errors = rejectedFiles[0].errors;
      console.error('File rejected:', errors);
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
    setDragActive(false);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections, open } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: isLoading || !mounted,
    noClick: false,
    noKeyboard: false,
    onDragEnter: () => {
      console.log('🎯 Drag enter');
      setDragActive(true);
    },
    onDragLeave: () => {
      console.log('🎯 Drag leave');
      setDragActive(false);
    },
    onDropAccepted: (files) => {
      console.log('✅ Files accepted:', files);
    },
    onDropRejected: (rejectedFiles) => {
      console.log('❌ Files rejected:', rejectedFiles);
    }
  });

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!mounted) {
    return (
      <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-gray-500">Loading file uploader...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Debug Info */}
      <div className="text-xs text-gray-500 font-mono">
        Debug: mounted={mounted.toString()}, isDragActive={isDragActive.toString()}, isLoading={isLoading.toString()}
      </div>
      
      {/* Main Upload Area */}
      {!selectedFile ? (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
              ${isDragActive || dragActive 
                ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              <div className={`
                p-4 rounded-full transition-colors
                ${isDragActive || dragActive ? 'bg-blue-100' : 'bg-gray-100'}
              `}>
                <Upload className={`
                  w-8 h-8 transition-colors
                  ${isDragActive || dragActive ? 'text-blue-500' : 'text-gray-400'}
                `} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isLoading ? 'Processing File...' : isDragActive ? 'Drop your file here' : 'Upload Company & Contact Data'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isDragActive 
                    ? 'Release to upload your file' 
                    : 'Drag & drop your file here, or click to browse'
                  }
                </p>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-2 text-xs text-gray-400">
                <File className="w-4 h-4" />
                <span>CSV</span>
                <span>•</span>
                <span>Excel (.xlsx, .xls)</span>
                <span>•</span>
                <span>JSON</span>
                <span>•</span>
                <span className="font-medium">Max 50MB</span>
              </div>
            </div>
          </div>
          
          {/* Fallback Button */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Drag & drop not working?</p>
            <button
              type="button"
              onClick={open}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              📂 Choose File Manually
            </button>
          </div>
        </div>
      ) : (
        /* Selected File Display */
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">{selectedFile.name}</p>
                <p className="text-sm text-green-700">
                  {formatFileSize(selectedFile.size)} • Ready for processing
                </p>
              </div>
            </div>
            {onClearFile && !isLoading && (
              <button
                onClick={onClearFile}
                className="p-1 hover:bg-green-200 rounded transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5 text-green-600" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">File Upload Error</p>
              {fileRejections.map(({ file, errors }, index) => (
                <div key={index} className="mt-1">
                  <p className="text-sm text-red-700">{file.name}:</p>
                  <ul className="text-xs text-red-600 ml-4">
                    {errors.map((error, errorIndex) => (
                      <li key={errorIndex}>• {error.message}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-2">📊 Expected Data Format:</p>
            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-medium text-blue-800 mb-1">🏢 Company Fields:</p>
                <ul className="space-y-0.5 text-blue-600">
                  <li>• <code>name</code> (required)</li>
                  <li>• <code>domain</code>, <code>industry</code></li>
                  <li>• <code>employee_count</code>, <code>revenue</code></li>
                  <li>• <code>headquarters</code>, <code>website</code></li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-800 mb-1">👤 Contact Fields:</p>
                <ul className="space-y-0.5 text-blue-600">
                  <li>• <code>first_name</code>, <code>last_name</code></li>
                  <li>• <code>email</code>, <code>phone</code></li>
                  <li>• <code>title</code> (required), <code>company_name</code></li>
                  <li>• <code>linkedin_url</code>, <code>department</code></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="font-medium text-blue-800 mb-1">🎯 Target Media Seller Roles:</p>
              <div className="flex flex-wrap gap-1">
                {[
                  'CMO', 'Media Director', 'Brand Manager', 
                  'Programmatic Trader', 'Media Associate', 'Group Agency Director'
                ].map((role) => (
                  <span key={role} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}