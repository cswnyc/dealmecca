import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TopicParser } from '@/lib/forum/topic-parser';
import { requireAdmin } from '@/server/requireAdmin';

interface TopicSuggestion {
  id: string;
  name: string;
  description?: string;
  confidence: number;
  isExisting: boolean;
  context?: string;
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const body = await request.json();
    const { content, title, categoryId } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required for topic suggestions' },
        { status: 400 }
      );
    }

    // Parse content using existing TopicParser
    const parsedContent = TopicParser.parseContentIntoTopics(content);
    const allText = `${title || ''} ${content}`.trim();

    // Get existing topics for matching
    const existingTopics = await prisma.topic.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId })
      },
      select: {
        id: true,
        name: true,
        description: true,
        context: true
      }
    });

    const suggestions: TopicSuggestion[] = [];

    // Process parsed topics from TopicParser - handle TopicGroup structure
    for (const topicGroup of parsedContent.topics) {
      // Use the topic group name as a topic suggestion
      const topicName = topicGroup.name;

      // Check if topic already exists
      const existingTopic = existingTopics.find(t =>
        t.name.toLowerCase() === topicName.toLowerCase() ||
        t.name.toLowerCase().includes(topicName.toLowerCase()) ||
        topicName.toLowerCase().includes(t.name.toLowerCase())
      );

      if (existingTopic) {
        // Existing topic with higher confidence
        suggestions.push({
          id: existingTopic.id,
          name: existingTopic.name,
          description: existingTopic.description || undefined,
          confidence: 0.9,
          isExisting: true,
          context: existingTopic.context || topicGroup.context || undefined
        });
      } else {
        // New topic suggestion
        suggestions.push({
          id: `new-${topicName.toLowerCase().replace(/\s+/g, '-')}`,
          name: topicName,
          confidence: 0.8,
          isExisting: false,
          context: topicGroup.description || topicGroup.context
        });
      }
    }

    // Add company-based topic suggestions from standalone companies
    for (const companyMention of parsedContent.standaloneCompanies) {
      const companyTopic = existingTopics.find(t =>
        t.name.toLowerCase().includes(companyMention.name.toLowerCase())
      );

      if (companyTopic && !suggestions.find(s => s.id === companyTopic.id)) {
        suggestions.push({
          id: companyTopic.id,
          name: companyTopic.name,
          description: companyTopic.description || undefined,
          confidence: 0.85,
          isExisting: true,
          context: companyTopic.context || undefined
        });
      } else if (!companyTopic) {
        suggestions.push({
          id: `new-company-${companyMention.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${companyMention.name} Discussion`,
          confidence: 0.75,
          isExisting: false
        });
      }
    }

    // Add topic suggestions from companies within topic groups
    for (const topicGroup of parsedContent.topics) {
      for (const companyMention of topicGroup.companies) {
        const companyTopic = existingTopics.find(t =>
          t.name.toLowerCase().includes(companyMention.name.toLowerCase())
        );

        if (companyTopic && !suggestions.find(s => s.id === companyTopic.id)) {
          suggestions.push({
            id: companyTopic.id,
            name: companyTopic.name,
            description: companyTopic.description || undefined,
            confidence: 0.83,
            isExisting: true,
            context: companyTopic.context || topicGroup.context || undefined
          });
        }
      }
    }

    // Keyword-based topic matching for additional suggestions
    const keywords = allText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const keywordCounts = keywords.reduce((acc: {[key: string]: number}, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    for (const keyword of topKeywords) {
      const matchingTopics = existingTopics.filter(t =>
        t.name.toLowerCase().includes(keyword) ||
        t.description?.toLowerCase().includes(keyword)
      );

      for (const topic of matchingTopics) {
        if (!suggestions.find(s => s.id === topic.id)) {
          suggestions.push({
            id: topic.id,
            name: topic.name,
            description: topic.description || undefined,
            confidence: 0.6,
            isExisting: true,
            context: topic.context || undefined
          });
        }
      }
    }

    // Sort by confidence and limit to top suggestions
    const sortedSuggestions = suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8); // Provide up to 8 suggestions (more than the requested 5+)

    // Ensure we have at least 5 suggestions by adding generic ones if needed
    if (sortedSuggestions.length < 5) {
      const genericSuggestions = [
        { name: 'General Discussion', confidence: 0.3 },
        { name: 'Industry News', confidence: 0.25 },
        { name: 'Market Update', confidence: 0.2 },
        { name: 'Business Opportunity', confidence: 0.15 },
        { name: 'Community Question', confidence: 0.1 }
      ];

      for (const generic of genericSuggestions) {
        if (sortedSuggestions.length >= 5) break;
        if (!sortedSuggestions.find(s => s.name.toLowerCase() === generic.name.toLowerCase())) {
          sortedSuggestions.push({
            id: `new-${generic.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: generic.name,
            confidence: generic.confidence,
            isExisting: false
          });
        }
      }
    }

    return NextResponse.json({
      suggestions: sortedSuggestions,
      parsedContent: {
        topicGroups: parsedContent.topics.length,
        standaloneCompanies: parsedContent.standaloneCompanies.length,
        standaloneContacts: parsedContent.standaloneContacts.length,
        totalMentions: parsedContent.originalMentions.length
      }
    });

  } catch (error) {
    console.error('Error generating topic suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate topic suggestions' },
      { status: 500 }
    );
  }
}