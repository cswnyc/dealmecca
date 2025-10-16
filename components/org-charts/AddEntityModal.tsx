'use client';

import { useState } from 'react';
import { useAuth } from "@/lib/auth/firebase-auth";
import { X, Upload, Info } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type EntityType = 'agency' | 'advertiser' | 'person' | 'industry' | 'publisher' | 'dsp-ssp' | 'adtech';

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  onEntityAdded?: (entity: any) => void;
}

export function AddEntityModal({ isOpen, onClose, entityType, onEntityAdded }: AddEntityModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [hideUsername, setHideUsername] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return null;
  }

  const getModalTitle = () => {
    switch (entityType) {
      case 'agency': return 'Add a new agency';
      case 'advertiser': return 'Add a new advertiser';
      case 'person': return 'Add new people';
      default: return `Add new ${entityType}`;
    }
  };

  const getPromptBullets = () => {
    switch (entityType) {
      case 'agency':
        return [
          "What's the name of the agency?",
          "What are some brands they handle?",
          "Where are they based?",
          "Who works there?"
        ];
      case 'advertiser':
        return [
          "What's the name of the advertiser?",
          "Where are they based?",
          "Who works there?",
          "What are the agencies they work with?"
        ];
      case 'person':
        return [
          "What are their names, titles and emails?",
          "What company do they work for?",
          "If at an agency, who are their clients?",
          "What do they handle?"
        ];
      default:
        return ["Please provide details about this entity"];
    }
  };

  const getPlaceholder = () => {
    switch (entityType) {
      case 'agency': return 'Write about the agency here...';
      case 'advertiser': return 'Write about the advertiser here...';
      case 'person': return 'Write about those people here...';
      default: return 'Write details here...';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check file size (15MB limit)
      if (selectedFile.size > 15 * 1024 * 1024) {
        alert('File size must be less than 15MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('Please provide some information');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('entityType', entityType);
      formData.append('hideUsername', hideUsername.toString());
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/api/admin/entities/conversational', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onEntityAdded?.(result);

        // Reset form
        setContent('');
        setFile(null);
        setHideUsername(false);

        // Close modal
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get user's display name or email
  const getUserDisplayName = () => {
    return user.displayName || user.email?.split('@')[0] || 'User';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-2xl font-semibold text-gray-900">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* Prompt bullets */}
          <ul className="mb-6 space-y-2">
            {getPromptBullets().map((bullet, index) => (
              <li key={index} className="text-base text-gray-900 flex items-start">
                <span className="mr-2">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          {/* Text area */}
          <div className="mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={getPlaceholder()}
              rows={8}
              className="w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400 border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none resize-none"
              required
            />
          </div>

          {/* File upload */}
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <div className="flex items-center space-x-2 text-blue-600">
                <Upload className="w-5 h-5" />
                <span className="text-base font-medium">
                  Add a file to this update <span className="text-gray-500">(optional)</span>
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Supports docs, pdfs, images or excel, up to 15MB.
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.xls,.xlsx"
                className="hidden"
              />
            </label>
            {file && (
              <div className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* User attribution */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="bg-amber-600 text-white text-sm">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-base text-gray-600">{getUserDisplayName()}</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hideUsername"
                checked={hideUsername}
                onChange={(e) => setHideUsername(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="hideUsername" className="flex items-center text-base text-gray-700 cursor-pointer">
                Hide my SC username
                <button
                  type="button"
                  className="ml-1 text-gray-400 hover:text-gray-600"
                  title="Your submission will be anonymous to other users"
                >
                  <Info className="w-4 h-4" />
                </button>
              </label>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-lg font-medium rounded-full transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
