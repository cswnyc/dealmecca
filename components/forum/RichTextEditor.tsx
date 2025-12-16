'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
// import Mention from '@tiptap/extension-mention'; // Temporarily disabled due to dependency issues
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Upload,
  Type
} from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  autoSave?: boolean;
  autoSaveDelay?: number;
  className?: string;
}

export function RichTextEditor({ 
  value = '', 
  onChange, 
  placeholder = 'Start writing your post...',
  maxLength = 5000,
  autoSave = true,
  autoSaveDelay = 2000,
  className = ''
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:text-primary/80 underline cursor-pointer'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm'
        }
      }),
      Underline,
      Placeholder.configure({
        placeholder
      }),
      CharacterCount.configure({
        limit: maxLength
      }),
      // Mention extension temporarily disabled due to dependency issues
      // Mention.configure({
      //   HTMLAttributes: {
      //     class: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium'
      //   }
      // })
    ],
    content: value,
    immediatelyRender: false, // Fix for SSR hydration issues
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
      
      // Auto-save functionality
      if (autoSave) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
          // Here you could implement actual auto-save to backend
          console.log('Auto-saving content...', html);
        }, autoSaveDelay);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4'
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          handleImageUpload(file);
          return true;
        }
        return false;
      }
    }
  });

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;

    // Create a local URL for immediate display
    const localUrl = URL.createObjectURL(file);
    
    // Insert image immediately with local URL
    editor.chain().focus().setImage({ src: localUrl }).run();

    // Here you would typically upload to your server/cloud storage
    // For now, we'll simulate an upload
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you'd upload the file and get back a permanent URL
      const formData = new FormData();
      formData.append('file', file);
      
      // Replace with actual upload endpoint
      // const response = await fetch('/api/upload/image', {
      //   method: 'POST',
      //   body: formData
      // });
      // const { url } = await response.json();
      
      // For demo, we'll keep the local URL
      console.log('Image uploaded successfully:', localUrl);
      
    } catch (error) {
      console.error('Failed to upload image:', error);
      // Remove the image if upload failed
      // editor.chain().focus().deleteSelection().run();
    }
  }, [editor]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleLinkAdd = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  if (!editor) {
    return (
      <Card className={`border-0 shadow-sm ${className}`}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded mb-4"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const characterCount = editor.storage.characterCount.characters();
  const characterLimit = maxLength;
  const isNearLimit = characterCount > characterLimit * 0.8;
  const isAtLimit = characterCount >= characterLimit;

  return (
    <Card className={`border-0 shadow-sm ${className}`}>
      <CardContent className="p-0">
        {/* Toolbar */}
        <div className="border-b border-border p-3 flex items-center gap-1 flex-wrap">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-border pr-3 mr-3">
            <Button
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('underline') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className="h-8 w-8 p-0"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r border-border pr-3 mr-3">
            <Button
              variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className="h-8 w-8 p-0"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className="h-8 w-8 p-0"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className="h-8 w-8 p-0"
            >
              <Heading3 className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('paragraph') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setParagraph().run()}
              className="h-8 w-8 p-0"
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-border pr-3 mr-3">
            <Button
              variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className="h-8 w-8 p-0"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          {/* Link */}
          <div className="flex items-center gap-1 border-r border-border pr-3 mr-3">
            <Button
              variant={editor.isActive('link') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowLinkDialog(true)}
              className="h-8 w-8 p-0"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Image Upload */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 p-0"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Link Dialog */}
        {showLinkDialog && (
          <div className="border-b border-border p-3 bg-muted">
            <div className="flex items-center gap-2">
              <Input
                type="url"
                placeholder="Enter URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLinkAdd();
                  } else if (e.key === 'Escape') {
                    setShowLinkDialog(false);
                    setLinkUrl('');
                  }
                }}
                className="flex-1"
                autoFocus
              />
              <Button onClick={handleLinkAdd} size="sm">
                Add Link
              </Button>
              <Button 
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                }}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Editor Content */}
        <div
          className={`relative ${isDragOver ? 'bg-primary/10 border-primary/30' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 z-10 border-2 border-dashed border-primary/50 rounded-lg">
              <div className="text-center">
                <Upload className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-primary font-medium">Drop your image here</p>
              </div>
            </div>
          )}
          <EditorContent editor={editor} />
        </div>

        {/* Character Counter */}
        <div className="border-t border-border px-4 py-2 flex justify-between items-center text-sm">
          <div className="text-muted-foreground">
            {autoSave && <span className="mr-4">Auto-save enabled</span>}
          </div>
          <div className={`${isNearLimit ? (isAtLimit ? 'text-destructive' : 'text-orange-600') : 'text-muted-foreground'}`}>
            {characterCount} / {characterLimit} characters
          </div>
        </div>
      </CardContent>
    </Card>
  );
}