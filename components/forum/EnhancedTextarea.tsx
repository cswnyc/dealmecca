'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, Link as LinkIcon, Smile, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EnhancedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  className?: string;
  onSubmit?: () => void;
  disabled?: boolean;
}

const EMOJI_OPTIONS = [
  '😀', '😃', '😄', '😁', '😊', '😍', '🤔', '😎', '😮', '😢',
  '👍', '👎', '❤️', '🔥', '💯', '✨', '🎉', '🚀', '💡', '⚡',
  '🤝', '💪', '🙌', '👏', '🎯', '📈', '💰', '🏆', '⭐', '💎'
];

export function EnhancedTextarea({
  value,
  onChange,
  placeholder = "What's on your mind?",
  maxLength = 500,
  minRows = 3,
  maxRows = 8,
  className = '',
  onSubmit,
  disabled = false
}: EnhancedTextareaProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate the number of rows based on content
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const rows = Math.min(Math.max(Math.ceil(textarea.scrollHeight / lineHeight), minRows), maxRows);
    
    // Set the height based on rows
    textarea.style.height = `${rows * lineHeight}px`;
  }, [minRows, maxRows]);

  // Adjust height when value changes
  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Handle text selection for formatting
  const handleSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    setSelectionStart(textarea.selectionStart);
    setSelectionEnd(textarea.selectionEnd);
  };

  // Insert text at cursor position or replace selection
  const insertText = (textToInsert: string, selectInserted = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value;
    
    const newValue = currentValue.substring(0, start) + textToInsert + currentValue.substring(end);
    onChange(newValue);

    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      if (selectInserted) {
        textarea.setSelectionRange(start, start + textToInsert.length);
      } else {
        textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
      }
    }, 0);
  };

  // Wrap selected text with formatting
  const wrapSelection = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      // Wrap existing selection
      const wrappedText = `${before}${selectedText}${after}`;
      insertText(wrappedText);
    } else {
      // Insert placeholder and select it
      const placeholderText = before === '**' ? 'bold text' : before === '*' ? 'italic text' : 'text';
      const wrappedText = `${before}${placeholderText}${after}`;
      insertText(wrappedText, true);
    }
  };

  // Format text functions
  const makeBold = () => wrapSelection('**');
  const makeItalic = () => wrapSelection('*');

  // Handle emoji selection
  const insertEmoji = (emoji: string) => {
    insertText(emoji);
    setShowEmojiPicker(false);
  };

  // Handle link insertion
  const insertLink = () => {
    if (!linkUrl) return;
    
    const linkMarkdown = linkText ? `[${linkText}](${linkUrl})` : linkUrl;
    insertText(linkMarkdown);
    
    setLinkUrl('');
    setLinkText('');
    setShowLinkDialog(false);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          makeBold();
          break;
        case 'i':
          e.preventDefault();
          makeItalic();
          break;
        case 'Enter':
          if (onSubmit && value.trim()) {
            e.preventDefault();
            onSubmit();
          }
          break;
      }
    }
  };

  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isAtLimit = characterCount >= maxLength;
  const remainingChars = maxLength - characterCount;

  return (
    <div className={`relative border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-1">
          {/* Bold Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={makeBold}
            disabled={disabled}
            className="h-8 w-8 p-0 hover:bg-gray-200"
            title="Bold (Cmd+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>

          {/* Italic Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={makeItalic}
            disabled={disabled}
            className="h-8 w-8 p-0 hover:bg-gray-200"
            title="Italic (Cmd+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>

          {/* Link Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkDialog(true)}
            disabled={disabled}
            className="h-8 w-8 p-0 hover:bg-gray-200"
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Emoji Button */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
              className="h-8 w-8 p-0 hover:bg-gray-200"
              title="Add Emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute top-10 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64"
              >
                <div className="grid grid-cols-10 gap-1">
                  {EMOJI_OPTIONS.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="w-6 h-6 text-lg hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Character Counter */}
        <div className={`text-xs ${isNearLimit ? (isAtLimit ? 'text-red-600' : 'text-orange-600') : 'text-gray-500'}`}>
          {remainingChars < 0 ? `${Math.abs(remainingChars)} over limit` : `${remainingChars} characters left`}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelection}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className="w-full px-4 py-3 resize-none border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-500"
        style={{
          minHeight: `${minRows * 1.5}rem`,
          maxHeight: `${maxRows * 1.5}rem`,
          lineHeight: '1.5rem'
        }}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="absolute inset-0 bg-white border border-gray-200 rounded-lg z-40 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add Link</h3>
            <button
              onClick={() => setShowLinkDialog(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    insertLink();
                  } else if (e.key === 'Escape') {
                    setShowLinkDialog(false);
                  }
                }}
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Text (optional)
              </label>
              <Input
                type="text"
                placeholder="Link description"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    insertLink();
                  } else if (e.key === 'Escape') {
                    setShowLinkDialog(false);
                  }
                }}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={insertLink}
                disabled={!linkUrl}
              >
                Add Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}