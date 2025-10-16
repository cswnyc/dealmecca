import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// API endpoint to handle conversational entity submissions
export async function POST(request: NextRequest) {
  try {
    // Get the session from Firebase auth via cookies
    const formData = await request.formData();

    const content = formData.get('content') as string;
    const entityType = formData.get('entityType') as string;
    const hideUsername = formData.get('hideUsername') === 'true';
    const file = formData.get('file') as File | null;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // TODO: Process the conversational input with AI/NLP to extract structured data
    // TODO: Store in database with status 'pending_review'
    // TODO: If file is provided, upload to storage and link to submission

    // For now, just return success
    console.log('Conversational entity submission:', {
      entityType,
      content: content.substring(0, 100) + '...',
      hideUsername,
      hasFile: !!file,
      fileName: file?.name
    });

    return NextResponse.json({
      success: true,
      message: 'Submission received! An admin will review and add the entity soon.',
      data: {
        entityType,
        status: 'pending_review'
      }
    });

  } catch (error) {
    console.error('Error processing conversational entity submission:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}
