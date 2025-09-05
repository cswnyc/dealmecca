import { NextRequest, NextResponse } from 'next/server';
import { claudeCodeSDK } from '@/lib/claude-code-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const suggestions = await claudeCodeSDK.generateForumPostSuggestions(title, content);

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Forum suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate forum suggestions' },
      { status: 500 }
    );
  }
}