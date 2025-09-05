// Utility functions for handling @company and @contact mentions in forum posts

export interface MentionMatch {
  type: 'company' | 'contact' | 'topic';
  id: string;
  name: string;
  startIndex: number;
  endIndex: number;
  text: string;
}

export interface MentionSuggestion {
  id: string;
  name: string;
  displayName: string;
  type: 'company' | 'contact' | 'topic';
  logo?: string;
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
  title?: string;
  verified?: boolean;
  description?: string;
}

// Regular expressions for detecting mentions
export const MENTION_PATTERNS = {
  company: /@company\[([^\]]+)\]\(([^)]+)\)/g,
  contact: /@contact\[([^\]]+)\]\(([^)]+)\)/g,
  topic: /@topic\[([^\]]+)\]\(([^)]+)\)/g,
  trigger: /@(company|contact|topic)\s*$/,
  partialTrigger: /@(company|contact|topic)\s+([^@\s]*)\s*$/
};

/**
 * Detect if user is currently typing a mention
 */
export function detectMentionTrigger(text: string, cursorPosition: number): {
  type: 'company' | 'contact' | 'topic' | null;
  query: string;
  startIndex: number;
} | null {
  const beforeCursor = text.substring(0, cursorPosition);
  
  // Check for partial mention patterns
  const partialMatch = beforeCursor.match(/@(company|contact|topic)\s+([^@\s]*)\s*$/);
  if (partialMatch) {
    return {
      type: partialMatch[1] as 'company' | 'contact' | 'topic',
      query: partialMatch[2] || '',
      startIndex: beforeCursor.lastIndexOf(partialMatch[0])
    };
  }
  
  // Check for trigger patterns (just @company or @contact)
  const triggerMatch = beforeCursor.match(/@(company|contact)\s*$/);
  if (triggerMatch) {
    return {
      type: triggerMatch[1] as 'company' | 'contact',
      query: '',
      startIndex: beforeCursor.lastIndexOf(triggerMatch[0])
    };
  }
  
  return null;
}

/**
 * Insert mention into text at cursor position
 */
export function insertMention(
  text: string, 
  cursorPosition: number, 
  mention: MentionSuggestion,
  triggerInfo: { startIndex: number; type: 'company' | 'contact' }
): { newText: string; newCursorPosition: number } {
  const beforeMention = text.substring(0, triggerInfo.startIndex);
  const afterMention = text.substring(cursorPosition);
  
  // Format mention as markdown-style link
  const mentionText = `@${triggerInfo.type}[${mention.name}](${mention.id})`;
  
  const newText = beforeMention + mentionText + afterMention;
  const newCursorPosition = beforeMention.length + mentionText.length;
  
  return { newText, newCursorPosition };
}

/**
 * Parse mentions from text content to extract structured data
 */
export function parseMentions(text: string): {
  companyMentions: Array<{ id: string; name: string }>;
  contactMentions: Array<{ id: string; name: string }>;
} {
  const companyMentions: Array<{ id: string; name: string }> = [];
  const contactMentions: Array<{ id: string; name: string }> = [];
  
  // Parse company mentions
  const companyMatches = text.matchAll(MENTION_PATTERNS.company);
  for (const match of companyMatches) {
    companyMentions.push({
      id: match[2],
      name: match[1]
    });
  }
  
  // Parse contact mentions
  const contactMatches = text.matchAll(MENTION_PATTERNS.contact);
  for (const match of contactMatches) {
    contactMentions.push({
      id: match[2], 
      name: match[1]
    });
  }
  
  return { companyMentions, contactMentions };
}

/**
 * Convert mentions in text to clickable links for display
 */
export function formatMentionsForDisplay(text: string): string {
  let formattedText = text;
  
  // Replace company mentions with clickable links
  formattedText = formattedText.replace(
    MENTION_PATTERNS.company,
    '<a href="/orgs/companies/$2" class="mention mention-company" data-mention-type="company" data-mention-id="$2">@$1</a>'
  );
  
  // Replace contact mentions with clickable links
  formattedText = formattedText.replace(
    MENTION_PATTERNS.contact,
    '<a href="/contacts/$2" class="mention mention-contact" data-mention-type="contact" data-mention-id="$2">@$1</a>'
  );
  
  return formattedText;
}

/**
 * Search for mention suggestions from API
 */
export async function searchMentionSuggestions(
  type: 'company' | 'contact' | 'topic', 
  query: string
): Promise<MentionSuggestion[]> {
  if (!query || query.length < 2) return [];
  
  try {
    let endpoint;
    if (type === 'company') {
      endpoint = `/api/forum/mentions/companies?q=${encodeURIComponent(query)}`;
    } else if (type === 'contact') {
      endpoint = `/api/forum/mentions/contacts?q=${encodeURIComponent(query)}`;
    } else {
      endpoint = `/api/forum/mentions/topics?q=${encodeURIComponent(query)}`;
    }
    
    const response = await fetch(endpoint);
    
    if (!response.ok) throw new Error('Failed to fetch suggestions');
    
    const data = await response.json();
    
    if (type === 'company') {
      return data.companies.map((company: any) => ({
        ...company,
        type: 'company' as const
      }));
    } else if (type === 'contact') {
      return data.contacts.map((contact: any) => ({
        ...contact,
        type: 'contact' as const
      }));
    } else {
      return data.topics.map((topic: any) => ({
        ...topic,
        type: 'topic' as const
      }));
    }
  } catch (error) {
    console.error(`Failed to search ${type} mentions:`, error);
    return [];
  }
}

/**
 * Clean mention text for plain text display (removes markup)
 */
export function stripMentionMarkup(text: string): string {
  let cleanText = text;
  
  // Replace mention markup with just the names
  cleanText = cleanText.replace(MENTION_PATTERNS.company, '@$1');
  cleanText = cleanText.replace(MENTION_PATTERNS.contact, '@$1');
  cleanText = cleanText.replace(MENTION_PATTERNS.topic, '#$1');
  
  return cleanText;
} 