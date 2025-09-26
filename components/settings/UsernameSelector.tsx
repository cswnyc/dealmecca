'use client';

import { useState, useEffect } from 'react';
import { Shuffle } from 'lucide-react';

interface UsernameSelectorProps {
  currentUsername?: string;
  firebaseUid: string;
  onSelect: (username: string) => void;
  disabled?: boolean;
}

export default function UsernameSelector({
  currentUsername,
  firebaseUid,
  onSelect,
  disabled = false
}: UsernameSelectorProps) {
  const [selectedUsername, setSelectedUsername] = useState(currentUsername || '');
  const [usernameOptions, setUsernameOptions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customUsername, setCustomUsername] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Generate initial username options
  useEffect(() => {
    if (firebaseUid && usernameOptions.length === 0) {
      generateNewOptions();
    }
  }, [firebaseUid]);

  const generateNewOptions = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/users/identity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid,
          count: 6,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsernameOptions(data.usernames);
      }
    } catch (error) {
      console.error('Error generating username options:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUsernameSelect = (username: string) => {
    if (disabled) return;
    setSelectedUsername(username);
    setShowCustomInput(false);
    onSelect(username);
  };

  const handleCustomUsernameSubmit = () => {
    const trimmedUsername = customUsername.trim();
    if (trimmedUsername && !disabled) {
      setSelectedUsername(trimmedUsername);
      onSelect(trimmedUsername);
      setCustomUsername('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Change your username
          </label>
          <p className="text-xs text-gray-500">
            Choose how you want to appear in discussions. You can select from suggestions or create your own.
          </p>
        </div>
        <button
          onClick={generateNewOptions}
          disabled={isGenerating || disabled}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          title="Generate new username options"
        >
          <Shuffle className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>Shuffle</span>
        </button>
      </div>

      {/* Current username display */}
      {currentUsername && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Current</p>
              <p className="text-sm text-blue-700">{currentUsername}</p>
            </div>
          </div>
        </div>
      )}

      {/* Username options grid */}
      {usernameOptions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Suggested usernames:</p>
          <div className="grid grid-cols-2 gap-2">
            {usernameOptions.map((username, index) => {
              const isSelected = selectedUsername === username;
              return (
                <button
                  key={index}
                  onClick={() => handleUsernameSelect(username)}
                  disabled={disabled}
                  className={`
                    p-3 text-left rounded-lg border transition-all duration-200
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                  `}
                >
                  <span className="text-sm font-medium">{username}</span>
                  {isSelected && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Selected
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom username section */}
      <div className="border-t border-gray-200 pt-4">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            disabled={disabled}
            className="text-sm text-gray-600 hover:text-gray-800 underline disabled:opacity-50"
          >
            Or create your own username
          </button>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Custom username
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomUsernameSubmit()}
                placeholder="Enter your preferred username"
                maxLength={50}
                disabled={disabled}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
              />
              <button
                onClick={handleCustomUsernameSubmit}
                disabled={!customUsername.trim() || disabled}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Use
              </button>
            </div>
            <div className="flex space-x-4 text-xs text-gray-500">
              <span>{customUsername.length}/50 characters</span>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomUsername('');
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Generating new options...</span>
        </div>
      )}
    </div>
  );
}