import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { claudeCodeSDK } from '@/lib/claude-code-sdk';

export async function POST(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, type = 'forum_post' } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Title and content are required' },
        { status: 400 }
      );
    }

    let suggestions;

    switch (type) {
      case 'forum_post':
        suggestions = await claudeCodeSDK.generateForumPostSuggestions(title, content);
        break;
      
      default:
        suggestions = await claudeCodeSDK.generateForumPostSuggestions(title, content);
        break;
    }

    return NextResponse.json({
      success: true,
      suggestions,
      type
    });

  } catch (error) {
    console.error('Claude Code suggestions error:', error);
    
    // Return fallback suggestions if Claude API fails
    const fallbackSuggestions = {
      tags: [],
      technologies: [],
      frameworks: [],
      complexity: 'intermediate',
      projectType: 'fullstack',
      urgency: 'MEDIUM',
      codeRelated: false,
      suggestedCategories: ['general', 'discussion'],
      keyTopics: []
    };

    return NextResponse.json({
      success: true,
      suggestions: fallbackSuggestions,
      type: 'forum_post',
      fallback: true,
      message: 'Using fallback suggestions due to API limitation'
    });
  }
}