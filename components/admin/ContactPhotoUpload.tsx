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
import { getAuth } from 'firebase/auth';

interface ContactPhotoUploadProps {
  contactId: string;
  currentPhotoUrl?: string | null;
  contactName?: string;
  onPhotoChange?: (photoUrl: string | null) => void;
  className?: string;
}

export function ContactPhotoUpload({
  contactId,
  currentPhotoUrl,
  contactName = 'Contact',
  onPhotoChange,
  className = ""
}: ContactPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('error');
      setStatusMessage('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('error');
      setStatusMessage('File too large. Maximum size is 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setUploadStatus('idle');
    setStatusMessage('');

    try {
      // Get Firebase auth token
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Not authenticated');
      }

      const token = await user.getIdToken();

      // Upload file using the new photo endpoint
      const formData = new FormData();
      formData.append('photo', file);

      const uploadResponse = await fetch(`/api/admin/contacts/${contactId}/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Upload failed');
      }

      const uploadResult = await uploadResponse.json();

      setPhotoUrl(uploadResult.photo.url);
      setPreviewUrl(null); // Clear preview after successful upload
      setUploadStatus('success');
      setStatusMessage('Photo uploaded successfully');
      onPhotoChange?.(uploadResult.photo.url);

      // Clear status message after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setStatusMessage('');
      }, 3000);

    } catch (error) {
      console.error('Photo upload error:', error);
      setUploadStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Upload failed');
      setPreviewUrl(null); // Clear preview on error
    } finally {
      setUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Remove this photo? It will be replaced with an auto-generated avatar.')) {
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    setStatusMessage('');

    try {
      // Get Firebase auth token
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Not authenticated');
      }

      const token = await user.getIdToken();

      const response = await fetch(`/api/admin/contacts/${contactId}/photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove photo');
      }

      const result = await response.json();

      setPhotoUrl(result.contact.logoUrl || '');
      setUploadStatus('success');
      setStatusMessage('Photo removed, showing auto-generated avatar');
      onPhotoChange?.(result.contact.logoUrl);

      // Clear status message after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setStatusMessage('');
      }, 3000);

    } catch (error) {
      console.error('Photo removal error:', error);
      setUploadStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to remove photo');
    } finally {
      setUploading(false);
    }
  };

  // Determine if this is a manually uploaded photo (vs auto-generated)
  const isUploadedPhoto = photoUrl && (
    photoUrl.includes('vercel-storage') ||
    photoUrl.includes('blob.vercel-storage')
  );

  const isAutoGenerated = photoUrl && (
    photoUrl.includes('gravatar.com') ||
    photoUrl.includes('dicebear.com')
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col space-y-3">
        <label className="text-sm font-medium text-foreground">
          Contact Photo
        </label>

        {/* Photo Display */}
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
            {previewUrl ? (
              // Show preview while uploading
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : photoUrl ? (
              <img
                src={photoUrl}
                alt={contactName}
                className="w-full h-full object-cover"
              />
            ) : (
              <PhotoIcon className="w-8 h-8 text-muted-foreground" />
            )}

            {/* Upload indicator overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
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
                <span>{isUploadedPhoto ? 'Change Photo' : 'Upload Photo'}</span>
              </Button>

              {isUploadedPhoto && (
                <Button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Remove</span>
                </Button>
              )}
            </div>

            {/* Photo Type Indicator */}
            {!uploading && photoUrl && (
              <div className="text-xs text-muted-foreground">
                {isUploadedPhoto && '📸 Uploaded photo'}
                {isAutoGenerated && '🤖 Auto-generated avatar'}
              </div>
            )}

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
              <div className="text-sm text-primary">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Optimizing and uploading...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Helper Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Supported formats: JPEG, PNG, WebP</p>
          <p>• Maximum size: 5MB</p>
          <p>• Images will be optimized to 400×400 pixels</p>
          {isAutoGenerated && (
            <p className="text-primary font-medium">💡 Upload a real photo for better results</p>
          )}
        </div>
      </div>
    </div>
  );
}
