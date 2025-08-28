'use client';

import { useState } from 'react';
import { generatePropertyDescription } from '../../actions/claude-agents';

interface PropertyDescriptionGeneratorProps {
  listingId: string;
  currentDescription?: string;
  currentSummary?: string;
  onUpdate?: (description: string, summary: string) => void;
}

export function PropertyDescriptionGenerator({
  listingId,
  currentDescription,
  currentSummary,
  onUpdate
}: PropertyDescriptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    description?: string;
    summary?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generatePropertyDescription(listingId);
      
      if (result.success && result.data) {
        setGeneratedContent({
          description: result.data.description,
          summary: result.data.summary
        });
        
        if (onUpdate) {
          onUpdate(result.data.description, result.data.summary);
        }
      } else {
        setError(result.error || 'Failed to generate description');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-blue-900">AI Description Generator</h3>
          <p className="text-sm text-blue-700">
            Generate engaging descriptions using Claude AI
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : '✨ Generate with AI'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {generatedContent.summary && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Generated Summary:
          </label>
          <div className="p-3 bg-white border rounded">
            <p className="text-sm text-gray-800 italic">"{generatedContent.summary}"</p>
          </div>
        </div>
      )}

      {generatedContent.description && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Generated Description:
          </label>
          <div className="p-3 bg-white border rounded max-h-40 overflow-y-auto">
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {generatedContent.description}
            </p>
          </div>
        </div>
      )}

      {(currentDescription || currentSummary) && (
        <div className="text-xs text-gray-600">
          <strong>Current content:</strong> This listing already has{' '}
          {currentSummary && 'a summary'}
          {currentSummary && currentDescription && ' and '}
          {currentDescription && 'a description'}
          . Generating new content will replace it.
        </div>
      )}
    </div>
  );
}