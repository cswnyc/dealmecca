import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthUser } from '@/server/authUser';

const prisma = new PrismaClient();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authedContext = await getAuthUser(request);
    
    if (!authedContext || !('user' in authedContext)) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { linkedinUrl } = await request.json();

    if (!linkedinUrl || typeof linkedinUrl !== 'string') {
      return NextResponse.json(
        { error: 'LinkedIn URL is required' },
        { status: 400 }
      );
    }

    // Validate LinkedIn URL format
    const linkedinUrlRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
    if (!linkedinUrlRegex.test(linkedinUrl)) {
      return NextResponse.json(
        { error: 'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourname)' },
        { status: 400 }
      );
    }

    // Normalize the URL
    const normalizedUrl = linkedinUrl.trim().toLowerCase();
    const finalUrl = normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`;

    // Update user with LinkedIn URL
    const updatedUser = await prisma.user.update({
      where: { id: authedContext.user.id },
      data: { 
        linkedinUrl: finalUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        linkedinUrl: true,
        verifiedSeller: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'LinkedIn profile URL saved successfully',
      user: updatedUser,
    });

  } catch (error) {
    console.error('Error saving LinkedIn URL:', error);
    return NextResponse.json(
      { error: 'Failed to save LinkedIn URL. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authedContext = await getAuthUser(request);
    
    if (!authedContext || !('user' in authedContext)) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authedContext.user.id },
      select: {
        id: true,
        linkedinUrl: true,
        verifiedSeller: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      linkedinUrl: user.linkedinUrl,
      verifiedSeller: user.verifiedSeller,
      hasLinkedIn: !!user.linkedinUrl,
    });

  } catch (error) {
    console.error('Error fetching LinkedIn URL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LinkedIn URL' },
      { status: 500 }
    );
  }
}
