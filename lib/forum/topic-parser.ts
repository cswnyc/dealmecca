interface MentionContext {
  type: 'company' | 'contact' | 'category' | 'user';
  id: string;
  name: string;
  context?: string; // e.g., "@ Healix NY"
  location?: string;
  role?: string;
}

interface TopicGroup {
  name: string;
  context: string;
  primaryCompany?: MentionContext;
  companies: MentionContext[];
  contacts: MentionContext[];
  location?: string;
  description?: string;
}

interface ParsedContent {
  topics: TopicGroup[];
  standaloneCompanies: MentionContext[];
  standaloneContacts: MentionContext[];
  originalMentions: MentionContext[];
}

/**
 * Enhanced mention parser that detects contextual patterns and groups related mentions
 */
export class TopicParser {
  private static readonly MENTION_REGEX = /@\[([^\]]+)\]\(([^:]+):([^)]+)\)/g;
  private static readonly LOCATION_PATTERNS = [
    /(@|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*(?:\s+[A-Z]{2})?)/g, // @ Location or City ST
    /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*)/g, // in Location
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*)\s+office/gi, // Location office
  ];

  /**
   * Parse content and extract mentions with context
   */
  static extractMentions(content: string): MentionContext[] {
    const mentions: MentionContext[] = [];
    let match;

    const regex = new RegExp(this.MENTION_REGEX);
    while ((match = regex.exec(content)) !== null) {
      const [fullMatch, name, type, id] = match;

      // Extract surrounding context (30 chars before and after)
      const startIndex = Math.max(0, match.index - 30);
      const endIndex = Math.min(content.length, match.index + fullMatch.length + 30);
      const contextWindow = content.slice(startIndex, endIndex);

      // Look for location context around this mention
      const context = this.extractLocationContext(contextWindow, name);

      mentions.push({
        type: type as MentionContext['type'],
        id,
        name,
        context,
        location: this.extractLocation(contextWindow)
      });
    }

    return mentions;
  }

  /**
   * Extract location context for a specific mention
   */
  private static extractLocationContext(contextWindow: string, mentionName: string): string | undefined {
    // Escape the mention name for regex
    const escapedMentionName = mentionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Look for patterns like "@[Company](id) @ Location" or "@[Company](id) at Location"
    const markdownLocationMatch = contextWindow.match(new RegExp(`@\\[${escapedMentionName}\\]\\([^)]+\\)\\s*(@|at)\\s+([^.,;!?\\n]+)`, 'i'));
    if (markdownLocationMatch) {
      return `@ ${markdownLocationMatch[2].trim()}`;
    }

    // Look for patterns like "Company @ Location" or "Company at Location" (fallback)
    const locationMatch = contextWindow.match(new RegExp(`${escapedMentionName}\\s*(@|at)\\s+([^.,;!?\\n]+)`, 'i'));
    if (locationMatch) {
      return `@ ${locationMatch[2].trim()}`;
    }

    // Look for "in Location" patterns
    const inLocationMatch = contextWindow.match(/in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*)/);
    if (inLocationMatch) {
      return `in ${inLocationMatch[1]}`;
    }

    return undefined;
  }

  /**
   * Extract location from context window
   */
  private static extractLocation(contextWindow: string): string | undefined {
    for (const pattern of this.LOCATION_PATTERNS) {
      const match = contextWindow.match(pattern);
      if (match) {
        return match[1] || match[2];
      }
    }
    return undefined;
  }

  /**
   * Parse content and group mentions into topics
   */
  static parseContentIntoTopics(content: string): ParsedContent {
    const mentions = this.extractMentions(content);
    const topics: TopicGroup[] = [];
    const standaloneCompanies: MentionContext[] = [];
    const standaloneContacts: MentionContext[] = [];

    // Group mentions by context/location
    const contextGroups = new Map<string, MentionContext[]>();
    const unGroupedMentions: MentionContext[] = [];

    for (const mention of mentions) {
      if (mention.context || mention.location) {
        const key = mention.context || mention.location || 'general';
        if (!contextGroups.has(key)) {
          contextGroups.set(key, []);
        }
        contextGroups.get(key)!.push(mention);
      } else {
        unGroupedMentions.push(mention);
      }
    }

    // Create topics from grouped mentions
    for (const [context, groupedMentions] of contextGroups) {
      if (groupedMentions.length > 1 || this.shouldCreateTopicForSingle(groupedMentions[0])) {
        const companies = groupedMentions.filter(m => m.type === 'company');
        const contacts = groupedMentions.filter(m => m.type === 'contact');

        const primaryCompany = companies[0];
        const topicName = this.generateTopicName(groupedMentions, context);

        topics.push({
          name: topicName,
          context,
          primaryCompany,
          companies,
          contacts,
          location: groupedMentions[0]?.location,
          description: this.generateTopicDescription(groupedMentions, context)
        });
      } else {
        // Single mention without significant context - treat as standalone
        const mention = groupedMentions[0];
        if (mention.type === 'company') {
          standaloneCompanies.push(mention);
        } else if (mention.type === 'contact') {
          standaloneContacts.push(mention);
        }
      }
    }

    // Handle ungrouped mentions
    for (const mention of unGroupedMentions) {
      if (mention.type === 'company') {
        standaloneCompanies.push(mention);
      } else if (mention.type === 'contact') {
        standaloneContacts.push(mention);
      }
    }

    return {
      topics,
      standaloneCompanies,
      standaloneContacts,
      originalMentions: mentions
    };
  }

  /**
   * Determine if a single mention should become a topic
   */
  private static shouldCreateTopicForSingle(mention: MentionContext): boolean {
    // Create topic if mention has rich context
    return !!(mention.context && mention.context.length > 3);
  }

  /**
   * Generate a descriptive topic name
   */
  private static generateTopicName(mentions: MentionContext[], context: string): string {
    const companies = mentions.filter(m => m.type === 'company');
    const contacts = mentions.filter(m => m.type === 'contact');

    if (companies.length > 0) {
      const primaryCompany = companies[0];

      // Clean up the context to be more concise
      const cleanContext = this.cleanContext(context);

      if (companies.length === 1 && contacts.length === 0) {
        return `${primaryCompany.name} ${cleanContext}`;
      } else if (companies.length > 1) {
        return `${primaryCompany.name} ${cleanContext} + ${companies.length - 1} more`;
      } else if (contacts.length > 0) {
        return `${primaryCompany.name} ${cleanContext} + ${contacts.length} contact${contacts.length > 1 ? 's' : ''}`;
      }
    }

    if (contacts.length > 0) {
      const firstContact = contacts[0];
      const cleanContext = this.cleanContext(context);

      if (contacts.length === 1) {
        return `${firstContact.name} ${cleanContext}`;
      } else {
        return `${firstContact.name} + ${contacts.length - 1} more contacts`;
      }
    }

    return this.cleanContext(context);
  }

  /**
   * Clean up context strings for better readability
   */
  private static cleanContext(context: string): string {
    // Remove leading @ if present and clean up
    let cleaned = context.replace(/^@\s*/, '@ ');

    // Truncate at common break points for readability
    const breakPoints = [' who ', ' that ', ' which ', ' with ', ' and ', ' for '];
    for (const breakPoint of breakPoints) {
      const index = cleaned.indexOf(breakPoint);
      if (index > 10) { // Only break if we have reasonable content before
        cleaned = cleaned.substring(0, index);
        break;
      }
    }

    // Ensure it starts with @ for location contexts
    if (!cleaned.startsWith('@') && !cleaned.startsWith('in ')) {
      cleaned = `@ ${cleaned}`;
    }

    return cleaned;
  }

  /**
   * Generate topic description
   */
  private static generateTopicDescription(mentions: MentionContext[], context: string): string {
    const companies = mentions.filter(m => m.type === 'company').length;
    const contacts = mentions.filter(m => m.type === 'contact').length;

    const parts = [];
    if (companies > 0) parts.push(`${companies} compan${companies > 1 ? 'ies' : 'y'}`);
    if (contacts > 0) parts.push(`${contacts} contact${contacts > 1 ? 's' : ''}`);

    return `${parts.join(' and ')} related to ${context}`;
  }

  /**
   * Generate auto-title from parsed content
   */
  static generateAutoTitle(content: string, maxLength: number = 80): string {
    const parsed = this.parseContentIntoTopics(content);

    // If we have topics, use the first topic as the title
    if (parsed.topics.length > 0) {
      const primaryTopic = parsed.topics[0];
      let title = primaryTopic.name;

      // Add count of additional topics/mentions
      const additionalCount = parsed.topics.length - 1 +
                             parsed.standaloneCompanies.length +
                             parsed.standaloneContacts.length;

      if (additionalCount > 0) {
        title += ` + ${additionalCount} more`;
      }

      return this.truncateTitle(title, maxLength);
    }

    // Fallback to standalone mentions
    if (parsed.standaloneCompanies.length > 0) {
      const company = parsed.standaloneCompanies[0];
      let title = company.name;

      const additionalCount = parsed.standaloneCompanies.length - 1 +
                             parsed.standaloneContacts.length;

      if (additionalCount > 0) {
        title += ` + ${additionalCount} more`;
      }

      return this.truncateTitle(title, maxLength);
    }

    // Final fallback to content truncation
    return this.truncateTitle(content.trim(), maxLength);
  }

  /**
   * Truncate title intelligently
   */
  private static truncateTitle(title: string, maxLength: number): string {
    if (title.length <= maxLength) return title;

    // Try to truncate at good break points first
    const breakPoints = [' + ', ' who ', ' that ', ' with ', ' and ', ' for ', ' at '];
    for (const breakPoint of breakPoints) {
      const index = title.indexOf(breakPoint);
      if (index > 0 && index < maxLength - 3) {
        return title.substring(0, index) + '...';
      }
    }

    // Fallback to word boundary truncation
    const truncated = title.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.6) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  }
}

export type { MentionContext, TopicGroup, ParsedContent };