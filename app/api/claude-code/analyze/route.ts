import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { analyzeCode } from '@/lib/claude-code-sdk';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { code, language, analysisType = 'review' } = body;

    // Validate required fields
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Code is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate analysis type
    const validAnalysisTypes = ['review', 'optimize', 'security', 'documentation'];
    if (!validAnalysisTypes.includes(analysisType)) {
      return NextResponse.json(
        { 
          error: 'Invalid analysis type',
          message: `Analysis type must be one of: ${validAnalysisTypes.join(', ')}`
        },
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
                searchType: 'code_analysis',
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
      FREE: 3,
      PRO: 25,
      TEAM: 100,
    }[user.subscriptionTier as keyof typeof rateLimit] || 3;

    if (user._count.searches >= rateLimit) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `You have reached your daily limit of ${rateLimit} code analyses. Please upgrade your plan for higher limits.`,
          limit: rateLimit,
          used: user._count.searches,
        },
        { status: 429 }
      );
    }

    try {
      // Analyze code using Claude Code SDK
      const result = await analyzeCode({
        code,
        language,
        analysisType: analysisType as 'review' | 'optimize' | 'security' | 'documentation',
      });

      // Record the code analysis in the database
      await prisma.search.create({
        data: {
          userId: request.headers.get('x-user-id'),
          query: `Code analysis: ${analysisType}`,
          resultsCount: 1,
          searchType: 'code_analysis',
        },
      });

      // Log the code analysis for analytics
      console.log(`Code analysis successful for user ${request.headers.get('x-user-id')}:`, {
        language,
        analysisType,
        codeLength: code.length,
        qualityScore: result.quality_score,
      });

      return NextResponse.json({
        ...result,
        metadata: {
          analysis_type: analysisType,
          code_length: code.length,
          detected_language: language,
        },
        usage: {
          daily_limit: rateLimit,
          daily_used: user._count.searches + 1,
          remaining: rateLimit - user._count.searches - 1,
        },
      });
    } catch (sdkError) {
      console.error('Claude Code Analysis SDK Error:', sdkError);
      
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
        
        if (sdkError.message.includes('too large')) {
          return NextResponse.json(
            { 
              error: 'Code too large',
              message: 'The provided code is too large to analyze. Please break it into smaller chunks.'
            },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { 
          error: 'Code analysis failed',
          message: 'An error occurred while analyzing the code. Please try again later.'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Code analysis endpoint error:', error);
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
    if (!userId) {
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
                searchType: 'code_analysis',
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
      FREE: 3,
      PRO: 25,
      TEAM: 100,
    }[user.subscriptionTier as keyof typeof rateLimit] || 3;

    return NextResponse.json({
      usage: {
        daily_limit: rateLimit,
        daily_used: user._count.searches,
        remaining: Math.max(0, rateLimit - user._count.searches),
        subscription_tier: user.subscriptionTier,
      },
      supported_analysis_types: [
        {
          type: 'review',
          name: 'Code Review',
          description: 'Comprehensive review focusing on best practices and maintainability'
        },
        {
          type: 'optimize',
          name: 'Performance Optimization',
          description: 'Analyze for performance improvements and efficiency'
        },
        {
          type: 'security',
          name: 'Security Analysis',
          description: 'Identify security vulnerabilities and best practices'
        },
        {
          type: 'documentation',
          name: 'Documentation Generation',
          description: 'Generate comprehensive documentation and comments'
        }
      ],
      supported_languages: [
        'javascript', 'typescript', 'python', 'java', 'csharp', 
        'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'sql'
      ],
    });
  } catch (error) {
    console.error('Code analysis info endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}