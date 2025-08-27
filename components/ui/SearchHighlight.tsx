'use client';

interface SearchHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
  highlightClassName?: string;
}

export function SearchHighlight({ 
  text, 
  searchTerm, 
  className = '', 
  highlightClassName = 'bg-yellow-200 text-yellow-900 px-1 rounded font-medium' 
}: SearchHighlightProps) {
  if (!searchTerm || !text) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create regex for case-insensitive search
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  
  // Split text by search term while preserving the search term
  const parts = text.split(regex);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        // If this part matches the search term (case insensitive), highlight it
        if (part.toLowerCase() === searchTerm.toLowerCase()) {
          return (
            <mark 
              key={index} 
              className={highlightClassName}
            >
              {part}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
}

export default SearchHighlight;

