'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

export default function BulkUploadPage() {
  const [uploadData, setUploadData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setUploadData(results.data);
          setUploadStatus(`Parsed ${results.data.length} records`);
        },
        error: (error) => {
          setUploadStatus(`Error parsing CSV: ${error.message}`);
        }
      });
    } else {
      setUploadStatus('Please upload a CSV file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (uploadData.length === 0) {
      setUploadStatus('No data to upload');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading...');

    try {
      const response = await fetch('/api/admin/bulk-import/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: uploadData }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadStatus(`Upload successful: ${result.message}`);
        setUploadData([]);
      } else {
        setUploadStatus(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Bulk Upload</h1>
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-4xl mb-4">📄</div>
            {isDragActive ? (
              <p className="text-blue-600">Drop the CSV file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag & drop a CSV file here, or click to select</p>
                <p className="text-sm text-gray-500">Only CSV files are accepted</p>
              </div>
            )}
          </div>

          {uploadStatus && (
            <div className={`mt-4 p-4 rounded ${
              uploadStatus.includes('Error') || uploadStatus.includes('failed')
                ? 'bg-red-100 text-red-700 border border-red-300'
                : uploadStatus.includes('successful')
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-blue-100 text-blue-700 border border-blue-300'
            }`}>
              {uploadStatus}
            </div>
          )}

          {uploadData.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Preview Data ({uploadData.length} records)</h3>
              <div className="bg-gray-50 rounded p-4 max-h-64 overflow-auto">
                <pre className="text-sm">
                  {JSON.stringify(uploadData.slice(0, 3), null, 2)}
                  {uploadData.length > 3 && '\n... and more'}
                </pre>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className={`px-4 py-2 rounded text-white ${
                    isUploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isUploading ? 'Uploading...' : 'Upload Data'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}