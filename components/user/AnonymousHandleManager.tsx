'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';
import { CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface AnonymousHandleManagerProps {
  onHandleChange?: (handle: string | null) => void;
}

export function AnonymousHandleManager({ onHandleChange }: AnonymousHandleManagerProps) {
  const { user: firebaseUser } = useAuth();
  const [currentHandle, setCurrentHandle] = useState<string | null>(null);
  const [newHandle, setNewHandle] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    message: string;
    suggestions?: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load current handle on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchCurrentHandle();
    }
  }, [session?.user?.id]);

  const fetchCurrentHandle = async () => {
    try {
      const response = await fetch('/api/user/anonymous-handle');
      if (response.ok) {
        const data = await response.json();
        setCurrentHandle(data.anonymousHandle);
        setNewHandle(data.anonymousHandle || '');
        onHandleChange?.(data.anonymousHandle);
      }
    } catch (error) {
      console.error('Error fetching anonymous handle:', error);
    }
  };

  const validateHandle = async (handle: string) => {
    if (!handle.trim()) {
      setValidation(null);
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch('/api/user/anonymous-handle/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          handle: handle.trim(),
          userId: session?.user?.id 
        }),
      });

      const data = await response.json();
      
      if (data.isAvailable) {
        setValidation({
          isValid: true,
          message: 'Handle is available!'
        });
      } else {
        setValidation({
          isValid: false,
          message: data.error,
          suggestions: data.suggestions
        });
      }
    } catch (error) {
      console.error('Error validating handle:', error);
      setValidation({
        isValid: false,
        message: 'Error validating handle'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (value: string) => {
    setNewHandle(value);
    
    // Debounce validation
    const timeoutId = setTimeout(() => {
      validateHandle(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const saveHandle = async () => {
    if (!validation?.isValid || !newHandle.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/anonymous-handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousHandle: newHandle.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentHandle(data.anonymousHandle);
        onHandleChange?.(data.anonymousHandle);
        setValidation({
          isValid: true,
          message: 'Handle saved successfully!'
        });
      } else {
        const error = await response.json();
        setValidation({
          isValid: false,
          message: error.error
        });
      }
    } catch (error) {
      console.error('Error saving handle:', error);
      setValidation({
        isValid: false,
        message: 'Error saving handle'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeHandle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/anonymous-handle', {
        method: 'DELETE',
      });

      if (response.ok) {
        setCurrentHandle(null);
        setNewHandle('');
        setValidation(null);
        onHandleChange?.(null);
      }
    } catch (error) {
      console.error('Error removing handle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setNewHandle(suggestion);
    validateHandle(suggestion);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Anonymous Handle</h3>
        {currentHandle && (
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
          >
            {previewMode ? (
              <>
                <EyeSlashIcon className="w-4 h-4" />
                <span>Hide Preview</span>
              </>
            ) : (
              <>
                <EyeIcon className="w-4 h-4" />
                <span>Preview</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="text-sm text-gray-600">
        Set an anonymous handle to post anonymously while maintaining consistency across your posts.
      </div>

      {previewMode && currentHandle && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-800 mb-1">Preview:</div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">?</span>
            </div>
            <span className="font-medium text-gray-900">{currentHandle}</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Anonymous</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="anonymous-handle" className="block text-sm font-medium text-gray-700">
          Handle
        </label>
        <div className="relative">
          <input
            type="text"
            id="anonymous-handle"
            value={newHandle}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter your anonymous handle..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            maxLength={20}
          />
          {isValidating && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
          {validation && !isValidating && (
            <div className="absolute right-3 top-2.5">
              {validation.isValid ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
        </div>

        {validation && (
          <div className={`text-sm ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
            {validation.message}
          </div>
        )}

        {validation?.suggestions && validation.suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Suggestions:</div>
            <div className="flex flex-wrap gap-2">
              {validation.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={saveHandle}
          disabled={!validation?.isValid || isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
        >
          {isLoading ? 'Saving...' : currentHandle ? 'Update Handle' : 'Save Handle'}
        </button>

        {currentHandle && (
          <button
            onClick={removeHandle}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            Remove Handle
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500">
        • Handle must be 3-20 characters
        • Only letters, numbers, underscores, and hyphens allowed
        • Must be unique across all users
      </div>
    </div>
  );
}