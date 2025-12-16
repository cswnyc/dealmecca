'use client';

import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

interface RichTextPostFormProps {
  categories: ForumCategory[];
  onSubmit?: (postData: any) => Promise<void>;
  isLoading?: boolean;
}

export function RichTextPostForm({ categories, onSubmit, isLoading = false }: RichTextPostFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: [] as string[],
    isAnonymous: false
  });
  const [currentTag, setCurrentTag] = useState('');

  const handleContentChange = (html: string) => {
    setFormData(prev => ({ ...prev, content: html }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.categoryId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await onSubmit?.(formData);
      // Reset form on success
      setFormData({
        title: '',
        content: '',
        categoryId: '',
        tags: [],
        isAnonymous: false
      });
    } catch (error) {
      console.error('Failed to submit post:', error);
      alert('Failed to submit post. Please try again.');
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Create New Forum Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Post Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter a descriptive title for your post..."
              className="text-lg"
              disabled={isLoading}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.categoryId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              disabled={isLoading}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category">
                  {selectedCategory && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: selectedCategory.color }}
                      />
                      {selectedCategory.name}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rich Text Content */}
          <div className="space-y-2">
            <Label>Post Content *</Label>
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Write your forum post content here... Use the toolbar to format your text, add links, images, and more!"
              maxLength={10000}
              autoSave={true}
              autoSaveDelay={2000}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                disabled={isLoading}
              />
              <Button 
                type="button" 
                onClick={handleAddTag}
                variant="outline"
                disabled={isLoading}
              >
                Add Tag
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
              className="rounded border-border text-primary focus:ring-ring"
              disabled={isLoading}
            />
            <Label htmlFor="anonymous" className="text-sm font-normal">
              Post anonymously
            </Label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setFormData({
                  title: '',
                  content: '',
                  categoryId: '',
                  tags: [],
                  isAnonymous: false
                });
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.content.trim() || !formData.categoryId}
            >
              {isLoading ? 'Publishing...' : 'Publish Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}