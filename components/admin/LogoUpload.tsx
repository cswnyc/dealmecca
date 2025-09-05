'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  PhotoIcon, 
  XMarkIcon, 
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface LogoUploadProps {
  entityId: string;
  entityType: 'company' | 'contact';
  currentLogoUrl?: string;
  onLogoChange?: (logoUrl: string | null) => void;
  className?: string;
}

export function LogoUpload({ 
  entityId, 
  entityType, 
  currentLogoUrl, 
  onLogoChange,
  className = "" 
}: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('error');
      setStatusMessage('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('error');
      setStatusMessage('File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    setStatusMessage('');

    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);

      const uploadResponse = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Upload failed');
      }

      const uploadResult = await uploadResponse.json();

      // Update entity with new logo URL
      const updateResponse = await fetch(`/api/admin/${entityType}s/${entityId}/logo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoUrl: uploadResult.url }),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.error || 'Failed to update logo');
      }

      setLogoUrl(uploadResult.url);
      setUploadStatus('success');
      setStatusMessage('Logo uploaded successfully');
      onLogoChange?.(uploadResult.url);

    } catch (error) {
      console.error('Logo upload error:', error);
      setUploadStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    setUploading(true);
    try {
      const response = await fetch(`/api/admin/${entityType}s/${entityId}/logo`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove logo');
      }

      setLogoUrl('');
      setUploadStatus('success');
      setStatusMessage('Logo removed successfully');
      onLogoChange?.(null);

    } catch (error) {
      console.error('Logo removal error:', error);
      setUploadStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to remove logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col space-y-3">
        <label className="text-sm font-medium text-gray-700">
          {entityType === 'company' ? 'Company Logo' : 'Contact Photo'}
        </label>
        
        {/* Logo Display */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={`${entityType} logo`}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <PhotoIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex space-x-2">
              <Button 
                type="button"
                onClick={handleFileSelect}
                disabled={uploading}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                <span>{logoUrl ? 'Change' : 'Upload'}</span>
              </Button>
              
              {logoUrl && (
                <Button 
                  type="button"
                  onClick={handleRemoveLogo}
                  disabled={uploading}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Remove</span>
                </Button>
              )}
            </div>

            {/* Status Messages */}
            {uploadStatus === 'success' && (
              <div className="flex items-center space-x-1 text-green-600 text-sm">
                <CheckCircleIcon className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="flex items-center space-x-1 text-red-600 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
            )}

            {uploading && (
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Helper Text */}
        <p className="text-xs text-gray-500">
          Supported formats: JPEG, PNG, WebP, GIF. Maximum size: 5MB.
        </p>
      </div>
    </div>
  );
}