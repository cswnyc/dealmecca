import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { generateCode } from '@/lib/claude-code-sdk';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { prompt, language, framework, complexity, type, context } = body;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Check user's subscription for rate limiting
    const user = await prisma.user.findUnique({
      where: { id: request.headers.get('x-user-id') },
      include: {
        _count: {
          select: {
            searches: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Rate limiting based on subscription tier
    const rateLimit = {
      FREE: 5,
      PRO: 50,
      TEAM: 200,
    }[user.subscriptionTier as keyof typeof rateLimit] || 5;

    if (user._count.searches >= rateLimit) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `You have reached your daily limit of ${rateLimit} code generations. Please upgrade your plan for higher limits.`,
          limit: rateLimit,
          used: user._count.searches,
        },
        { status: 429 }
      );
    }

    try {
      // Generate code using Claude Code SDK
      const result = await generateCode({
        prompt,
        language,
        framework,
        complexity: complexity as 'simple' | 'intermediate' | 'advanced',
        type: type as 'component' | 'function' | 'api' | 'schema' | 'utility' | 'test',
        context,
      });

      // Record the code generation in the database for analytics and rate limiting
      await prisma.search.create({
        data: {
          userId: request.headers.get('x-user-id'),
          query: prompt,
          resultsCount: 1,
          searchType: 'code_generation',
        },
      });

      // Log the code generation for analytics
      console.log(`Code generation successful for user ${request.headers.get('x-user-id')}:`, {
        prompt: prompt.substring(0, 100) + '...',
        language,
        framework,
        type,
        complexity,
      });

      return NextResponse.json({
        ...result,
        usage: {
          daily_limit: rateLimit,
          daily_used: user._count.searches + 1,
          remaining: rateLimit - user._count.searches - 1,
        },
      });
    } catch (sdkError) {
      console.error('Claude Code SDK Error:', sdkError);
      
      // Handle specific SDK errors
      if (sdkError instanceof Error) {
        if (sdkError.message.includes('API key')) {
          return NextResponse.json(
            { error: 'Service configuration error' },
            { status: 503 }
          );
        }
        
        if (sdkError.message.includes('rate limit')) {
          return NextResponse.json(
            { error: 'Service temporarily unavailable due to rate limiting' },
            { status: 503 }
          );
        }
        
        if (sdkError.message.includes('content policy')) {
          return NextResponse.json(
            { 
              error: 'Content policy violation',
              message: 'The provided prompt violates content policy. Please modify your request.'
            },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { 
          error: 'Code generation failed',
          message: 'An error occurred while generating code. Please try again later.'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Code generation endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's current usage stats
    const user = await prisma.user.findUnique({
      where: { id: request.headers.get('x-user-id') },
      include: {
        _count: {
          select: {
            searches: {
              where: {
                searchType: 'code_generation',
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const rateLimit = {
      FREE: 5,
      PRO: 50,
      TEAM: 200,
    }[user.subscriptionTier as keyof typeof rateLimit] || 5;

    return NextResponse.json({
      usage: {
        daily_limit: rateLimit,
        daily_used: user._count.searches,
        remaining: Math.max(0, rateLimit - user._count.searches),
        subscription_tier: user.subscriptionTier,
      },
      supported_languages: [
        'javascript', 'typescript', 'python', 'java', 'csharp', 
        'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'sql'
      ],
      supported_types: [
        'component', 'function', 'api', 'schema', 'utility', 'test'
      ],
      complexity_levels: [
        'simple', 'intermediate', 'advanced'
      ],
    });
  } catch (error) {
    console.error('Code generation info endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}