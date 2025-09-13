# Rich Text Editor for DealMecca Forum

A comprehensive rich text editor built with TipTap for creating and editing forum posts with advanced formatting capabilities.

## Features

### ✅ Implemented Features
- **Text Formatting**: Bold, italic, underline support
- **Headings**: H1, H2, H3 with paragraph formatting
- **Lists**: Bullet points and numbered lists
- **Links**: Easy link insertion with URL dialog
- **Image Upload**: Drag & drop image support with local preview
- **Character Counter**: Real-time character count with customizable limits
- **Auto-save**: Configurable auto-save functionality
- **Responsive Design**: Tailwind CSS styling that matches DealMecca design
- **Controlled Component**: Standard React value/onChange props interface

### ⏳ Future Features (Mention extension disabled due to dependency issues)
- **@Mentions**: User and company mentions (can be re-enabled when dependency is resolved)

## Installation

The required packages are already installed:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-character-count @tiptap/extension-placeholder @tiptap/extension-underline @tiptap/suggestion --legacy-peer-deps
```

## Basic Usage

### Simple Editor

```tsx
import { RichTextEditor } from '@/components/forum/RichTextEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start writing..."
      maxLength={5000}
    />
  );
}
```

### Advanced Usage with All Options

```tsx
import { RichTextEditor } from '@/components/forum/RichTextEditor';

function AdvancedEditor() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Write your forum post..."
      maxLength={10000}
      autoSave={true}
      autoSaveDelay={2000}
      className="my-custom-class"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | HTML content of the editor |
| `onChange` | `(html: string) => void` | `undefined` | Callback when content changes |
| `placeholder` | `string` | `'Start writing your post...'` | Placeholder text |
| `maxLength` | `number` | `5000` | Maximum character limit |
| `autoSave` | `boolean` | `true` | Enable auto-save functionality |
| `autoSaveDelay` | `number` | `2000` | Auto-save delay in milliseconds |
| `className` | `string` | `''` | Additional CSS classes |

## Toolbar Features

### Text Formatting
- **Bold** (Ctrl/Cmd + B)
- **Italic** (Ctrl/Cmd + I) 
- **Underline** (Ctrl/Cmd + U)

### Headings
- **H1, H2, H3**: Different heading levels
- **Paragraph**: Regular text formatting

### Lists
- **Bullet List**: Unordered list
- **Numbered List**: Ordered list

### Media & Links
- **Link**: Insert/edit links with URL dialog
- **Image**: Upload images via button click or drag & drop

## Keyboard Shortcuts

- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline
- `Enter` - New paragraph
- `Shift + Enter` - Line break
- `Tab` - Indent (in lists)
- `Shift + Tab` - Outdent (in lists)

## Image Upload

The editor supports image upload in two ways:

1. **Click Upload**: Click the image button in the toolbar
2. **Drag & Drop**: Drag images directly into the editor area

### Customizing Image Upload

Currently, images are handled with local URLs for preview. To implement server upload:

```tsx
// In RichTextEditor.tsx, modify the handleImageUpload function:
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData
  });
  
  const { url } = await response.json();
  editor?.chain().focus().setImage({ src: url }).run();
};
```

## Integration Examples

### Forum Post Form

```tsx
import { RichTextPostForm } from '@/components/forum/RichTextPostForm';

function ForumPage({ categories }) {
  const handleSubmitPost = async (postData) => {
    const response = await fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    // Handle response
  };

  return (
    <RichTextPostForm 
      categories={categories}
      onSubmit={handleSubmitPost}
    />
  );
}
```

### Simple Comment Form

```tsx
function CommentForm({ onSubmit }) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <div>
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Write a comment..."
        maxLength={2000}
      />
      <button onClick={handleSubmit}>Post Comment</button>
    </div>
  );
}
```

## Styling

The editor uses Tailwind CSS and follows DealMecca's design system:

- **Primary Color**: Used for active toolbar buttons
- **Border Colors**: Consistent with form inputs
- **Typography**: Matches site typography scale
- **Responsive**: Works on mobile and desktop

### Custom Styling

Add custom styles by passing a `className` prop:

```tsx
<RichTextEditor
  className="my-4 shadow-lg"
  // ... other props
/>
```

## Auto-save

The editor includes built-in auto-save functionality:

- **Enabled by default** with 2-second delay
- **Debounced** to avoid excessive saves
- **Console logging** for debugging (replace with actual save logic)

To implement server-side auto-save:

```tsx
// Add to your component
const handleAutoSave = async (content: string) => {
  await fetch('/api/posts/auto-save', {
    method: 'POST',
    body: JSON.stringify({ content }),
    headers: { 'Content-Type': 'application/json' }
  });
};

// Pass to RichTextEditor
<RichTextEditor
  value={content}
  onChange={(html) => {
    setContent(html);
    handleAutoSave(html);
  }}
/>
```

## Error Handling

The editor includes basic error handling for:
- Image upload failures
- Network issues
- Invalid content

For production use, consider adding:
- User-friendly error messages
- Retry mechanisms
- Offline support
- Content recovery

## Browser Support

The editor supports all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing

Test the editor at: `http://localhost:3000/test-rich-editor`

This test page includes:
- Live editor with all features
- Preview mode
- Feature documentation
- Usage examples

## Troubleshooting

### Common Issues

1. **Mention extension error**: Currently disabled due to dependency conflicts
2. **Image upload not working**: Implement server-side upload endpoint
3. **Content not saving**: Check onChange callback implementation

### Debug Mode

Enable console logging by checking browser dev tools. The editor logs:
- Content changes
- Auto-save events
- Image upload attempts
- API responses

## Performance

The editor is optimized for performance:
- **Lazy loading** of extensions
- **Debounced** auto-save
- **Efficient re-renders** via React hooks
- **Small bundle size** with tree-shaking

For large documents, consider:
- Implementing pagination
- Virtual scrolling
- Content streaming
- Progressive loading