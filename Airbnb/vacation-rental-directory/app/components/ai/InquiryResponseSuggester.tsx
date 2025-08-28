'use client';

import { useState } from 'react';
import { suggestInquiryResponse } from '../../actions/claude-agents';

interface InquiryResponseSuggesterProps {
  inquiryId: string;
  guestName?: string;
  guestMessage: string;
  onSuggestion?: (response: string) => void;
}

export function InquiryResponseSuggester({
  inquiryId,
  guestName,
  guestMessage,
  onSuggestion
}: InquiryResponseSuggesterProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedResponse, setSuggestedResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerateSuggestion = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await suggestInquiryResponse(inquiryId);
      
      if (result.success && result.data) {
        setSuggestedResponse(result.data);
        setIsExpanded(true);
        
        if (onSuggestion) {
          onSuggestion(result.data);
        }
      } else {
        setError(result.error || 'Failed to generate response');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(suggestedResponse);
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-green-50">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-green-900">AI Response Assistant</h4>
          <p className="text-sm text-green-700">
            Generate a suggested response to {guestName || 'this guest'}
          </p>
        </div>
        <button
          onClick={handleGenerateSuggestion}
          disabled={isGenerating}
          className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isGenerating ? 'Thinking...' : '🤖 Suggest Response'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Guest Message Context */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Guest Message:
        </label>
        <div className="p-3 bg-gray-100 border rounded text-sm">
          <p className="text-gray-800 italic">"{guestMessage}"</p>
        </div>
      </div>

      {/* AI Suggested Response */}
      {suggestedResponse && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              AI Suggested Response:
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                📋 Copy
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>
          
          <div className={`p-3 bg-white border rounded transition-all ${
            isExpanded ? 'max-h-96' : 'max-h-24'
          } overflow-y-auto`}>
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {suggestedResponse}
            </p>
          </div>
          
          <div className="text-xs text-gray-600">
            💡 <strong>Tip:</strong> Review and personalize this response before sending. 
            Add specific details about your property or local recommendations.
          </div>
        </div>
      )}
    </div>
  );
}