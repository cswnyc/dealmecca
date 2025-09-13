'use client';

import { useState } from 'react';
import { RichTextEditor } from '@/components/forum/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestRichEditorPage() {
  const [content, setContent] = useState('<p>Welcome to the <strong>DealMecca</strong> rich text editor! 🚀</p><p>Try out these features:</p><ul><li><strong>Bold text</strong> and <em>italic text</em></li><li><u>Underline</u> formatting</li><li>Different <a href="https://dealmecca.com">link styles</a></li><li>Bullet lists and numbered lists</li><li>Multiple heading levels</li><li>Image upload with drag &amp; drop</li></ul><h2>Getting Started</h2><p>Use the toolbar above to format your text, or try dragging an image into the editor!</p>');
  const [previewMode, setPreviewMode] = useState(false);

  const handleSave = () => {
    console.log('Saving content:', content);
    alert('Content saved! Check the console for the HTML output.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Rich Text Editor Demo
          </h1>
          <p className="text-gray-600">
            A comprehensive rich text editor for DealMecca forum posts
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => setPreviewMode(false)}
            variant={!previewMode ? 'default' : 'outline'}
          >
            Edit Mode
          </Button>
          <Button
            onClick={() => setPreviewMode(true)}
            variant={previewMode ? 'default' : 'outline'}
          >
            Preview Mode
          </Button>
          <Button onClick={handleSave} variant="outline">
            Save Content
          </Button>
        </div>

        {!previewMode ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rich Text Editor</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Start writing your forum post..."
                  maxLength={5000}
                  autoSave={true}
                  autoSaveDelay={1500}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Text Formatting</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Bold, Italic, Underline</li>
                      <li>• Multiple heading levels (H1-H3)</li>
                      <li>• Paragraph formatting</li>
                      <li>• Bullet and numbered lists</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Advanced Features</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Link insertion and editing</li>
                      <li>• Image upload with drag & drop</li>
                      <li>• Character counter with limits</li>
                      <li>• Auto-save functionality</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 text-sm space-y-2">
            <p>
              <strong>Drag & Drop:</strong> Drag images directly into the editor area to upload them.
            </p>
            <p>
              <strong>Keyboard Shortcuts:</strong> Use Ctrl/Cmd+B for bold, Ctrl/Cmd+I for italic, etc.
            </p>
            <p>
              <strong>Links:</strong> Click the link button, enter a URL, and press Enter to add links.
            </p>
            <p>
              <strong>Auto-save:</strong> Content is automatically saved after 1.5 seconds of inactivity.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}